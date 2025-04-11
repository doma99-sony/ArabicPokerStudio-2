import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: SelectUser | null;
  setUser: (updater: SelectUser | ((prevUser: SelectUser | null) => SelectUser | null)) => void;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  loginGuestMutation: UseMutationResult<SelectUser, Error, void>; // تسجيل الدخول كضيف
  loginFacebookMutation: UseMutationResult<SelectUser, Error, void>; // تسجيل الدخول بالفيسبوك
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  goToProfile: () => void;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });
  
  // دالة للانتقال إلى صفحة الملف الشخصي
  const goToProfile = () => {
    // إعادة تحميل الصفحة عند الانتقال للملف الشخصي لضمان تحديث الجلسة بشكل كامل
    window.location.href = '/profile';
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً، ${user.username}!`,
      });
      // توجيه المستخدم إلى صفحة الملف الشخصي بعد تسجيل الدخول
      setTimeout(() => {
        goToProfile();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "يرجى التحقق من اسم المستخدم وكلمة المرور",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: `مرحباً، ${user.username}!`,
      });
      // توجيه المستخدم إلى صفحة الملف الشخصي بعد تسجيل الدخول
      setTimeout(() => {
        goToProfile();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء الحساب",
        description: error.message || "يرجى المحاولة باستخدام اسم مستخدم آخر",
        variant: "destructive",
      });
    },
  });

  // تسجيل الدخول كضيف
  const loginGuestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/login/guest");
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "تم تسجيل الدخول كضيف",
        description: `مرحباً، ${user.username}!`,
      });
      // توجيه المستخدم إلى صفحة الملف الشخصي بعد تسجيل الدخول
      setTimeout(() => {
        goToProfile();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول كضيف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تسجيل الدخول بالفيسبوك
  const loginFacebookMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/login/facebook");
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "تم تسجيل الدخول بواسطة فيسبوك",
        description: `مرحباً، ${user.username}!`,
      });
      // توجيه المستخدم إلى صفحة الملف الشخصي بعد تسجيل الدخول
      setTimeout(() => {
        goToProfile();
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الدخول بواسطة فيسبوك",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // تعيين علامة تسجيل الخروج لإظهار شاشة البداية مرة أخرى
      sessionStorage.setItem('hasLoggedOut', 'true');
      
      // تخزين معلومة أن المستخدم كان مسجلاً
      if (user) {
        sessionStorage.setItem('hadUser', 'true');
      }
      
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      
      // إعادة تحميل الصفحة بعد تسجيل الخروج لإظهار شاشة البداية
      setTimeout(() => {
        window.location.reload();
      }, 800); // انتظار قليلاً للتأكد من ظهور رسالة النجاح
    },
    onError: (error: Error) => {
      toast({
        title: "فشل تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تنفيذ دالة تحديث المستخدم
  const setUser = (updater: SelectUser | ((prevUser: SelectUser | null) => SelectUser | null)) => {
    // تحديث البيانات في كاش البيانات
    queryClient.setQueryData(["/api/user"], current => {
      // إذا كان المدخل دالة، استخدمها لتحديث البيانات الحالية
      if (typeof updater === 'function') {
        return updater(current as SelectUser | null);
      }
      // وإلا، استخدم القيمة الجديدة مباشرة
      return updater;
    });
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        setUser,
        isLoading,
        error,
        loginMutation,
        loginGuestMutation,
        loginFacebookMutation,
        logoutMutation,
        registerMutation,
        goToProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("يجب استخدام useAuth داخل AuthProvider");
  }
  return context;
}