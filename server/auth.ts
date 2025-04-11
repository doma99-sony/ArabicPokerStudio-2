import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import createMemoryStore from "memorystore";
// Import PostgreSQL store
import pgSession from "connect-pg-simple";

// تعريف واجهة المستخدم في النظام
interface UserType {
  id: number;
  username: string;
  password: string;
  chips: number;
  avatar?: string | null;
  userCode: string; // معرف المستخدم الفريد (5 أرقام)
  isGuest: boolean; // هل المستخدم ضيف - ليس قابل لأن يكون null
  authType?: 'email' | 'facebook' | 'guest'; // نوع الحساب
}

// تعريف واجهة المستخدم لجواز السفر
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);
const PostgreSqlStore = pgSession(session);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// وظيفة لإنشاء اسم مستخدم عشوائي للضيوف
function generateGuestUsername(): string {
  const guestId = Math.floor(100000 + Math.random() * 900000); // 6 أرقام عشوائية
  return `ضيف_${guestId}`;
}

// وظيفة لإنشاء معرف فريد للمستخدم (User Code)
function generateUserCode(): string {
  // إنشاء معرف فريد مكون من 5 أرقام يمكن للمستخدم استخدامه للتعريف بنفسه للآخرين
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "poker-game-secret-key";
  
  // تحديد مخزن الجلسات بناءً على توفر اتصال PostgreSQL
  let sessionStore;
  
  // التحقق من وجود اتصال PostgreSQL
  if (process.env.DATABASE_URL) {
    console.log("استخدام مخزن PostgreSQL للجلسات");
    try {
      // محاولة إنشاء مخزن PostgreSQL
      sessionStore = new PostgreSqlStore({
        conString: process.env.DATABASE_URL,
        tableName: 'sessions',
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 60,
        errorLog: console.error,
        disableTouch: false
      });
    } catch (err) {
      // في حالة فشل الاتصال بـ PostgreSQL
      console.error("خطأ في إنشاء مخزن جلسات PostgreSQL:", err);
      console.log("استخدام مخزن الذاكرة للجلسات (احتياطي)");
      sessionStore = new MemoryStore({
        checkPeriod: 86400000 // مسح الجلسات المنتهية كل 24 ساعة
      });
    }
  } else {
    // استخدام مخزن الذاكرة إذا لم يتم توفير اتصال PostgreSQL
    console.log("عدم وجود اتصال PostgreSQL، استخدام مخزن الذاكرة للجلسات");
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // مسح الجلسات المنتهية كل 24 ساعة
    });
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // استخدام المخزن المناسب
    cookie: { 
      secure: false, // تعطيل secure لبيئة التطوير
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      sameSite: 'lax',
      httpOnly: true,
      path: '/'
    },
    // التأكد من أن session ID ثابت
    genid: function() {
      return Math.random().toString(36).substring(2) + 
        Date.now().toString(36) + 
        Math.random().toString(36).substring(2);
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      // إذا لم يتم العثور على المستخدم (ربما تم حذفه)، لا يتم رمي خطأ بل إرجاع معلومات فشل المصادقة
      if (!user) {
        console.log(`لم يتم العثور على المستخدم برقم ${id}، إزالة تخصيص الجلسة`);
        return done(null, false);
      }
      
      // إرجاع بيانات المستخدم الموجود
      done(null, user);
    } catch (err) {
      console.error("خطأ في استرجاع بيانات المستخدم:", err);
      // في حالة وجود خطأ، نعيد قيمة false بدلًا من الخطأ نفسه
      done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("اسم المستخدم موجود بالفعل");
      }

      // Create user with hashed password and initial chips and unique user code
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        userCode: generateUserCode(), // إضافة معرف فريد للمستخدم
        isGuest: false,
        authType: 'email'
      });

      // Login the new user
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Set cookie for the session
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // زيادة المدة إلى 30 يوم
        res.cookie('connect.sid', req.sessionID, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: oneMonth,
          secure: false
        });
        
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: UserType | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: "خطأ في اسم المستخدم أو كلمة المرور" });
      }
      
      req.login(user, (err: Error | null) => {
        if (err) {
          return next(err);
        }
        
        // تأكيد للمتصفح بأن ملفات تعريف الارتباط يجب تخزينها - استخدام cookie parser
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // زيادة المدة إلى 30 يوم
        res.cookie('connect.sid', req.sessionID, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: oneMonth,
          secure: false
        });
        
        // استجابة ناجحة مع بيانات المستخدم
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const sessionID = req.sessionID;
    
    req.logout((err) => {
      if (err) return next(err);
      
      // مسح الجلسة بالكامل
      req.session.destroy((err) => {
        if (err) return next(err);
        
        // مسح كوكيز الجلسة من المتصفح
        res.clearCookie('connect.sid');
        
        // إعادة تأكيد على المتصفح أن الجلسة قد تم مسحها
        res.setHeader('Set-Cookie', ['connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
        
        return res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
      });
    });
  });

  // تسجيل الدخول كضيف
  app.post("/api/login/guest", async (req, res, next) => {
    try {
      // إنشاء مستخدم ضيف جديد مع اسم مستخدم عشوائي
      const guestUsername = generateGuestUsername();
      const guestPassword = Math.random().toString(36).slice(-10); // كلمة مرور عشوائية
      
      // إنشاء المستخدم الضيف مع رصيد أولي 50,000 رقاقة
      const guestUser = await storage.createUser({
        username: guestUsername,
        password: await hashPassword(guestPassword),
        chips: 50000,
        userCode: generateUserCode(), // إضافة معرف فريد
        isGuest: true,
        authType: 'guest'
      });
      
      // تسجيل دخول الضيف تلقائياً
      req.login(guestUser, (err) => {
        if (err) return next(err);
        
        // تأكيد على المتصفح بحفظ جلسة المستخدم
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // زيادة المدة إلى 30 يوم
        res.cookie('connect.sid', req.sessionID, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: oneMonth,
          secure: false
        });
        
        // إرجاع معلومات المستخدم الضيف
        res.status(200).json(guestUser);
      });
    } catch (err) {
      next(err);
    }
  });
  
  // واجهة وهمية لتسجيل الدخول بالفيسبوك (بدون تكامل حقيقي)
  app.post("/api/login/facebook", async (req, res, next) => {
    try {
      // في حالة التكامل الحقيقي، سيتم التحقق من معلومات المستخدم مع Facebook
      // ولكن حالياً سنقوم بإنشاء مستخدم جديد بمجرد أن المستخدم يضغط على زر الفيسبوك
      
      // إنشاء اسم مستخدم عشوائي لمستخدم الفيسبوك
      const fbUsername = `fb_${Math.floor(1000 + Math.random() * 9000)}`;
      const fbPassword = Math.random().toString(36).slice(-10);
      
      // إنشاء مستخدم جديد مع رصيد 100,000 رقاقة
      const fbUser = await storage.createUser({
        username: fbUsername,
        password: await hashPassword(fbPassword),
        chips: 100000,
        userCode: generateUserCode(), // إضافة معرف فريد
        isGuest: false,
        authType: 'facebook'
      });
      
      // تسجيل دخول مستخدم الفيسبوك تلقائياً
      req.login(fbUser, (err) => {
        if (err) return next(err);
        
        // تأكيد على المتصفح بحفظ جلسة المستخدم
        const oneMonth = 30 * 24 * 60 * 60 * 1000; // زيادة المدة إلى 30 يوم
        res.cookie('connect.sid', req.sessionID, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: oneMonth,
          secure: false
        });
        
        // إرجاع معلومات المستخدم
        res.status(200).json(fbUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "المستخدم غير مسجل دخوله",
        status: 401 
      });
    }
    
    // جلب بيانات المستخدم المحدثة من قاعدة البيانات 
    // للتأكد من أن البيانات حديثة، وخاصة الرقائق
    storage.getUser(req.user.id)
      .then(updatedUser => {
        if (!updatedUser) {
          return res.status(404).json({ 
            error: "NotFound", 
            message: "المستخدم غير موجود",
            status: 404 
          });
        }
        
        // تحديث بيانات المستخدم في الجلسة
        req.login(updatedUser, (err) => {
          if (err) {
            console.error("خطأ في تحديث جلسة المستخدم:", err);
            // عند حدوث خطأ، نستمر في إرجاع بيانات المستخدم الحالية
          }
          
          // إعادة إرسال كوكيز بجلسة محدثة
          const oneMonth = 30 * 24 * 60 * 60 * 1000; // زيادة المدة إلى 30 يوم
          res.cookie('connect.sid', req.sessionID, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: oneMonth,
            secure: false
          });
          
          // إرجاع بيانات المستخدم المحدثة
          res.json(updatedUser);
        });
      })
      .catch(err => {
        console.error("خطأ في جلب بيانات المستخدم:", err);
        // في حالة حدوث خطأ، نقوم بإرجاع بيانات المستخدم من الجلسة
        res.json(req.user);
      });
  });
}
