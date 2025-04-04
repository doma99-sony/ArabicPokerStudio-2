import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { log } from './vite';

// إنشاء اتصال مع قاعدة البيانات
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set. Using in-memory storage instead.');
}

// تهيئة مجموعة الاتصالات مع تكوين محسن للأداء
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // زيادة الحد الأقصى لعدد الاتصالات المتزامنة
  idleTimeoutMillis: 60000, // زيادة وقت انتهاء الاتصال الخامل لتقليل عمليات إعادة الاتصال
  connectionTimeoutMillis: 10000, // زيادة مهلة الاتصال لتحسين الموثوقية
  allowExitOnIdle: false, // منع إغلاق الاتصالات عند الخمول لتحسين الأداء
  keepAlive: true, // إبقاء الاتصال حياً
  keepAliveInitialDelayMillis: 10000, // تأخير أولي لإرسال حزم keep-alive
}) : null;

// معالجة أخطاء الاتصال بقاعدة البيانات
if (pool) {
  pool.on('error', (err) => {
    log(`Unexpected error on idle client: ${err.message}`, 'database');
    process.exit(-1);
  });
}

// تهيئة عميل Drizzle للتعامل مع قاعدة البيانات
export const db = pool ? drizzle(pool, { schema }) : null;

// وظيفة لتنفيذ الترحيلات التلقائية عند بدء التشغيل مع دعم إعادة المحاولة
export async function initializeDatabase(maxRetries = 5, retryDelay = 2000) {
  // إذا لم يكن هناك اتصال بقاعدة البيانات، نعود مباشرة
  if (!pool) {
    log('No database connection pool available. Using in-memory storage.', 'database');
    return true;
  }

  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      log(`Connecting to database (attempt ${retryCount + 1}/${maxRetries})...`, 'database');
      
      // التحقق من الاتصال بقاعدة البيانات
      const client = await pool.connect();
      
      // التحقق من صلاحية الاتصال عن طريق استعلام بسيط
      const result = await client.query('SELECT NOW()');
      if (!result || !result.rows || result.rows.length === 0) {
        throw new Error('Database connection validation failed');
      }
      
      client.release();
      log('Database connection successful and validated', 'database');
      
      // تنفيذ الترحيلات تلقائيًا
      if (db) {
        log('Running migrations...', 'database');
        await migrate(db, { migrationsFolder: './migrations' });
        log('Migrations completed successfully', 'database');
        
        // إجراء عملية تنظيف للاتصالات غير المستخدمة
        await pool.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \'idle\' AND state_change < NOW() - INTERVAL \'1 hour\'');
        log('Cleaned up idle connections', 'database');
      }
      
      return true;
    } catch (error: any) {
      retryCount++;
      log(`Database initialization error (attempt ${retryCount}/${maxRetries}): ${error.message || 'Unknown error'}`, 'database');
      
      if (retryCount < maxRetries) {
        log(`Retrying database initialization in ${retryDelay}ms...`, 'database');
        // انتظار قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // زيادة وقت الانتظار بشكل تدريجي
        retryDelay = Math.min(retryDelay * 1.5, 30000);
      } else {
        log('Maximum retries reached. Database initialization failed.', 'database');
        console.error('Full error:', error);
        return false;
      }
    }
  }
  
  return false;
}

// وظيفة لإغلاق اتصالات قاعدة البيانات بشكل آمن مع محاولات إعادة المحاولة
export async function closeDatabase(maxRetries = 3, retryDelay = 1000) {
  // إذا لم يكن هناك اتصال بقاعدة البيانات، نعود مباشرة
  if (!pool) {
    log('No database connection pool to close.', 'database');
    return true;
  }

  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      log('Closing database connections...', 'database');
      await pool.end();
      log('Database connections closed successfully', 'database');
      return true;
    } catch (error: any) {
      retryCount++;
      log(`Error closing database connections (attempt ${retryCount}/${maxRetries}): ${error.message || 'Unknown error'}`, 'database');
      
      if (retryCount < maxRetries) {
        log(`Retrying database connection close in ${retryDelay}ms...`, 'database');
        // انتظار قبل إعادة المحاولة
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        log('Maximum retries reached. Database connections may not have closed properly.', 'database');
        return false;
      }
    }
  }
  
  return false;
}