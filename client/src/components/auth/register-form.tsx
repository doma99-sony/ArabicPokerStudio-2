import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل" })
    .max(20, { message: "اسم المستخدم يجب أن يحتوي على 20 حرف على الأكثر" }),
  password: z
    .string()
    .min(6, { message: "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل" }),
  email: z
    .string()
    .email({ message: "بريد إلكتروني غير صالح" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    // Strip email as it's not in our schema but we want to collect it for UX
    const { email, ...registerData } = data;
    registerMutation.mutate(registerData, {
      onSuccess: (user) => {
        // تأكيد بأننا حصلنا على معلومات المستخدم بشكل صحيح
        if (user && user.id) {
          // تخزين معلومات آخر دخول في التخزين المحلي
          localStorage.setItem("lastAuthTimestamp", Date.now().toString());
          // إعادة تحميل الصفحة والتوجيه إلى اللوبي
          window.location.href = '/';
        }
      }
    });
  };

  return (
    <div className="relative backdrop-blur-xl bg-gradient-to-b from-[#000000]/80 to-[#0A0A0A]/90 rounded-xl p-6 shadow-[0_0_25px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30">
      {/* Card decoration */}
      <div className="absolute -top-3 -left-3 w-16 h-16 transform -rotate-12 opacity-80">
        <div className="w-12 h-16 rounded-md bg-white shadow-md flex items-center justify-center text-red-600 font-bold text-xl">Q♥</div>
      </div>
      <div className="absolute -bottom-3 -right-3 w-16 h-16 transform rotate-12 opacity-80">
        <div className="w-12 h-16 rounded-md bg-white shadow-md flex items-center justify-center text-black font-bold text-xl">J♠</div>
      </div>
      
      {/* Poker chips decoration */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-600 rounded-full border-2 border-white shadow-lg z-10"></div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full border-2 border-white shadow-lg z-20"></div>
      <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-600 rounded-full border-2 border-white shadow-lg z-10"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-black rounded-full border-2 border-white shadow-lg z-20"></div>

      {/* Decorative line */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
      </div>
      
      {/* Title */}
      <motion.h2 
        className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        إنشاء حساب جديد
      </motion.h2>
      
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#D4AF37] font-bold text-sm">البريد الإلكتروني</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      {...field}
                      type="email"
                      className="w-full bg-[#121212] border-2 border-[#D4AF37]/30 rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 shadow-inner transition-all"
                      placeholder="أدخل بريدك الإلكتروني"
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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] hover:from-[#E5C04B] hover:to-[#D4AF37] text-black font-bold py-3 px-4 rounded-lg transition-all shadow-[0_4px_10px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_15px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
            >
              {registerMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  <span>إنشاء الحساب</span>
                </div>
              )}
            </Button>
          </motion.div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
            <span className="flex-shrink mx-3 text-[#D4AF37] text-xs font-medium">VIP بوكر تكساس</span>
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
          </div>

          <motion.div 
            className="flex justify-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37] transition-colors flex items-center"
              onClick={onSwitchToLogin}
            >
              <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
              <ArrowRight className="h-4 w-4 mr-1" />
            </button>
          </motion.div>
          
          {/* VIP badge decoration */}
          <div className="absolute -bottom-3 right-1/2 transform translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-xs text-black font-bold py-1 px-4 rounded-full shadow-lg">
            VIP بوكر
          </div>
        </form>
      </Form>
    </div>
  );
}