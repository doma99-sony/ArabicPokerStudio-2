import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '../shared/schema';
import { log } from './vite';

// إنشاء اتصال مع قاعدة البيانات
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// تهيئة مجموعة الاتصالات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // الحد الأقصى لعدد الاتصالات
  idleTimeoutMillis: 30000, // وقت انتهاء الاتصال الخامل بالميلي ثانية
  connectionTimeoutMillis: 5000, // وقت انتظار الاتصال قبل الفشل
});

// معالجة أخطاء الاتصال بقاعدة البيانات
pool.on('error', (err) => {
  log(`Unexpected error on idle client: ${err.message}`, 'database');
  process.exit(-1);
});

// تهيئة عميل Drizzle للتعامل مع قاعدة البيانات
export const db = drizzle(pool, { schema });

// وظيفة لتنفيذ الترحيلات التلقائية عند بدء التشغيل
export async function initializeDatabase() {
  try {
    log('Connecting to database...', 'database');
    
    // التحقق من الاتصال بقاعدة البيانات
    const client = await pool.connect();
    client.release();
    log('Database connection successful', 'database');
    
    // تنفيذ الترحيلات تلقائيًا
    log('Running migrations...', 'database');
    await migrate(db, { migrationsFolder: './migrations' });
    log('Migrations completed successfully', 'database');
    
    return true;
  } catch (error: any) {
    log(`Database initialization error: ${error.message || 'Unknown error'}`, 'database');
    console.error('Full error:', error);
    return false;
  }
}

// وظيفة لإغلاق اتصالات قاعدة البيانات بشكل آمن
export async function closeDatabase() {
  try {
    log('Closing database connections...', 'database');
    await pool.end();
    log('Database connections closed', 'database');
  } catch (error: any) {
    log(`Error closing database connections: ${error.message || 'Unknown error'}`, 'database');
  }
}