import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { FaFacebook } from "react-icons/fa";

const loginSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { loginMutation, loginGuestMutation, loginFacebookMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = (data: LoginFormValues) => {
    // تخزين توقيت بدء محاولة تسجيل الدخول
    const loginStartTime = Date.now();
    
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        // تأكيد بأننا حصلنا على معلومات المستخدم بشكل صحيح
        if (user && user.id) {
          // تخزين معلومات آخر دخول في التخزين المحلي
          localStorage.setItem("lastAuthTimestamp", Date.now().toString());
          
          // حساب زمن الاستجابة
          const responseTime = Date.now() - loginStartTime;
          console.log(`تم تسجيل الدخول بنجاح من نموذج تسجيل الدخول العادي (${responseTime}ms)`);
          
          // التوجيه يتم فوراً من خلال use-auth.tsx
        }
      }
    });
  };
  
  const handleGuestLogin = () => {
    // تخزين توقيت بدء محاولة تسجيل الدخول
    const loginStartTime = Date.now();
    
    loginGuestMutation.mutate(undefined, {
      onSuccess: (user) => {
        // تأكيد بأننا حصلنا على معلومات المستخدم بشكل صحيح
        if (user && user.id) {
          // تخزين معلومات آخر دخول
          localStorage.setItem("lastAuthTimestamp", Date.now().toString());
          
          // حساب زمن الاستجابة
          const responseTime = Date.now() - loginStartTime;
          console.log(`تم تسجيل الدخول كضيف بنجاح من نموذج تسجيل الدخول (${responseTime}ms)`);
          
          // التوجيه يتم فوراً من خلال use-auth.tsx
        }
      }
    });
  };
  
  const handleFacebookLogin = () => {
    // تخزين توقيت بدء محاولة تسجيل الدخول
    const loginStartTime = Date.now();
    
    loginFacebookMutation.mutate(undefined, {
      onSuccess: (user) => {
        // تأكيد بأننا حصلنا على معلومات المستخدم بشكل صحيح
        if (user && user.id) {
          // تخزين معلومات آخر دخول
          localStorage.setItem("lastAuthTimestamp", Date.now().toString());
          
          // حساب زمن الاستجابة
          const responseTime = Date.now() - loginStartTime;
          console.log(`تم تسجيل الدخول عبر فيسبوك بنجاح من نموذج تسجيل الدخول (${responseTime}ms)`);
          
          // التوجيه يتم فوراً من خلال use-auth.tsx
        }
      }
    });
  };
  
  return (
    <div className="relative backdrop-blur-xl bg-gradient-to-b from-[#000000]/80 to-[#0A0A0A]/90 rounded-xl p-6 shadow-[0_0_25px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30">
      {/* Card decoration */}
      <div className="absolute -top-3 -right-3 w-16 h-16 transform rotate-12 opacity-80">
        <div className="w-12 h-16 rounded-md bg-white shadow-md flex items-center justify-center text-red-600 font-bold text-xl">A♥</div>
      </div>
      <div className="absolute -bottom-3 -left-3 w-16 h-16 transform -rotate-12 opacity-80">
        <div className="w-12 h-16 rounded-md bg-white shadow-md flex items-center justify-center text-black font-bold text-xl">K♠</div>
      </div>
      
      {/* Poker chips decoration */}
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg z-10"></div>
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg z-20"></div>
      <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-green-600 rounded-full border-2 border-white shadow-lg z-10"></div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full border-2 border-white shadow-lg z-20"></div>

      {/* Decorative line */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#D4AF37] font-bold text-sm">اسم المستخدم</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]">
                      <User className="h-5 w-5" />
                    </div>
                    <Input
                      {...field}
                      className="w-full bg-[#121212] border-2 border-[#D4AF37]/30 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 shadow-inner transition-all"
                      placeholder="أدخل اسم المستخدم"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#D4AF37] font-bold text-sm">كلمة المرور</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-[#121212] border-2 border-[#D4AF37]/30 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 shadow-inner transition-all"
                      placeholder="أدخل كلمة المرور"
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] hover:from-[#E5C04B] hover:to-[#D4AF37] text-black font-bold py-3 px-4 rounded-lg transition-all shadow-[0_4px_10px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_15px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
          >
            {loginMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="h-5 w-5 mr-2" />
                <span>تسجيل الدخول</span>
              </div>
            )}
          </Button>
          
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37] transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37] transition-colors"
              onClick={onSwitchToRegister}
            >
              إنشاء حساب جديد
            </button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
            <span className="flex-shrink mx-3 text-[#D4AF37] text-xs font-medium">أو الدخول بواسطة</span>
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
          </div>
          
          {/* أزرار تسجيل الدخول البديلة */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGuestLogin}
              disabled={loginGuestMutation.isPending}
              className="flex items-center justify-center py-2 px-4 bg-[#121212] border-2 border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] rounded-lg transition-all shadow-md"
            >
              {loginGuestMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <User className="h-4 w-4 mr-2 text-[#D4AF37]" />
                  <span>دخول كضيف</span>
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookLogin}
              disabled={loginFacebookMutation.isPending}
              className="flex items-center justify-center py-2 px-4 bg-[#121212] border-2 border-[#1877F2]/30 text-white hover:bg-[#1877F2]/10 hover:border-[#1877F2] rounded-lg transition-all shadow-md"
            >
              {loginFacebookMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <FaFacebook className="h-4 w-4 mr-2 text-[#1877F2]" />
                  <span>فيسبوك</span>
                </>
              )}
            </Button>
          </div>
          
          {/* VIP badge decoration */}
          <div className="absolute -bottom-3 right-1/2 transform translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-xs text-black font-bold py-1 px-4 rounded-full shadow-lg">
            VIP بوكر
          </div>
        </form>
      </Form>
    </div>
  );
}