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

// واجهة بيانات تحديث المستخدم
interface UpdateUserData {
  username?: string;
  avatar?: string;
  chips?: number;
  diamonds?: number;
}

type AuthContextType = {
  user: SelectUser | null;
  setUser: (updater: SelectUser | ((prevUser: SelectUser | null) => SelectUser | null)) => void;
  updateUserData: (data: UpdateUserData) => Promise<SelectUser | null>;
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
  
  // دالة للانتقال إلى صفحة اللوبي الرئيسية
  const goToLobby = () => {
    // إعادة تحميل الصفحة عند الانتقال للوبي الرئيسي لضمان تحديث الجلسة بشكل كامل
    window.location.href = '/';
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
      // توجيه المستخدم إلى صفحة اللوبي الرئيسية بعد تسجيل الدخول
      setTimeout(() => {
        goToLobby();
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
      // توجيه المستخدم إلى صفحة اللوبي الرئيسية بعد تسجيل الدخول
      setTimeout(() => {
        goToLobby();
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
      // توجيه المستخدم إلى صفحة اللوبي الرئيسية بعد تسجيل الدخول
      setTimeout(() => {
        goToLobby();
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
      // توجيه المستخدم إلى صفحة اللوبي الرئيسية بعد تسجيل الدخول
      setTimeout(() => {
        goToLobby();
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
  
  // دالة تحديث بيانات المستخدم عبر API
  const updateUserData = async (data: UpdateUserData): Promise<SelectUser | null> => {
    if (!user) return null;
    
    try {
      // تحديث فوري - نحدث البيانات محلياً أولاً قبل الاتصال بالسيرفر
      const preliminaryUser = {
        ...user,
        ...(data.username && { username: data.username }),
        ...(data.chips !== undefined && { chips: user.chips + data.chips }),
        ...(data.diamonds !== undefined && { diamonds: user.diamonds + data.diamonds }),
        ...(data.avatar && { avatar: data.avatar }),
      };
      
      // تحديث البيانات في cache فوراً لتجنب الريفرش
      queryClient.setQueryData(["/api/user"], preliminaryUser);
      
      // قم بإرسال البيانات إلى السيرفر
      let endpoint = '/api/profile/update';
      let method = 'POST';
      let payload: any = data;
      
      // نستخدم نقاط نهاية مختلفة لأنواع التحديثات المختلفة بدلاً من نقطة نهاية واحدة
      if (data.username) {
        endpoint = '/api/profile/username';
        method = 'POST';
        payload = { username: data.username };
      } else if (data.chips !== undefined) {
        endpoint = '/api/profile/add-chips';
        method = 'POST';
        payload = { amount: data.chips };
      } else if (data.diamonds !== undefined) {
        endpoint = '/api/profile/add-diamonds';
        method = 'POST';
        payload = { amount: data.diamonds };
      }
      
      // استدعاء API
      const res = await apiRequest(method, endpoint, payload);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تحديث البيانات');
      }
      
      const result = await res.json();
      
      // تحديث البيانات بالقيم الفعلية من السيرفر
      const updatedUser = {
        ...user,
        ...(data.username && { username: data.username }),
        ...(data.chips !== undefined && { chips: result.newChipsAmount || user.chips + data.chips }),
        ...(data.diamonds !== undefined && { diamonds: result.newDiamondsAmount || user.diamonds + data.diamonds }),
        ...(data.avatar && { avatar: data.avatar || result.avatarUrl }),
      };
      
      // تحديث البيانات في cache
      queryClient.setQueryData(["/api/user"], updatedUser);
      
      // توست رسالة نجاح
      toast({
        title: "تم تحديث البيانات بنجاح",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });
      
      // إرسال تحديث عبر WebSocket للعميل لتحديث الواجهات الأخرى
      try {
        const ws = new WebSocket(`wss://${window.location.host}/ws`);
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'profile_update',
            user_id: user.id,
            data: data
          }));
          ws.close();
        };
      } catch (wsError) {
        console.log('غير قادر على إرسال تحديث WebSocket:', wsError);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('خطأ في تحديث بيانات المستخدم:', error);
      
      // إرجاع البيانات الأصلية في حالة الخطأ
      queryClient.setQueryData(["/api/user"], user);
      
      // توست رسالة خطأ
      toast({
        title: "فشل تحديث البيانات",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
      
      return null;
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        setUser,
        updateUserData,
        isLoading,
        error,
        loginMutation,
        loginGuestMutation,
        loginFacebookMutation,
        logoutMutation,
        registerMutation,
        goToProfile: goToLobby, // تم تغيير السلوك لتوجيه المستخدم إلى اللوبي بدلاً من الملف الشخصي
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