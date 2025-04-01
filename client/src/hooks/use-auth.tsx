import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  loginGuestMutation: UseMutationResult<SelectUser, Error, void>; // تسجيل الدخول كضيف
  loginFacebookMutation: UseMutationResult<SelectUser, Error, void>; // تسجيل الدخول بالفيسبوك
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

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

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        loginGuestMutation,
        loginFacebookMutation,
        logoutMutation,
        registerMutation,
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