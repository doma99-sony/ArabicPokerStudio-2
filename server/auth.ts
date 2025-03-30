import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import createMemoryStore from "memorystore";

// تعريف واجهة المستخدم في النظام
interface UserType {
  id: number;
  username: string;
  password: string;
  chips: number;
  avatar?: string | null;
}

// تعريف واجهة المستخدم لجواز السفر
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
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

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "poker-game-secret-key";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    // تمكين حفظ الجلسة حتى لو لم تتغير
    resave: true,
    // حفظ الجلسة غير المهيأة لمنع إعادة تأهيل المستخدم
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 86400000 // 24 ساعة
    }),
    cookie: { 
      secure: false, // تعطيل secure لبيئة التطوير
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 أسبوع
      sameSite: 'lax',
      httpOnly: true,
      path: '/'
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
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("اسم المستخدم موجود بالفعل");
      }

      // Create user with hashed password and initial chips
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Login the new user
      req.login(user, (err) => {
        if (err) return next(err);
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
        
        // تأكيد للمتصفح بأن ملفات تعريف الارتباط يجب تخزينها
        res.setHeader('Set-Cookie', [
          `connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
        ]);
        
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

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
