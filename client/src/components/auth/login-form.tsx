import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, User } from "lucide-react";
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
    loginMutation.mutate(data, {
      onSuccess: () => {
        // force refresh to ensure user state is updated
        window.location.href = '/';
      }
    });
  };
  
  const handleGuestLogin = () => {
    loginGuestMutation.mutate(undefined, {
      onSuccess: () => {
        // force refresh to ensure user state is updated
        window.location.href = '/';
      }
    });
  };
  
  const handleFacebookLogin = () => {
    loginFacebookMutation.mutate(undefined, {
      onSuccess: () => {
        // force refresh to ensure user state is updated
        window.location.href = '/';
      }
    });
  };
  
  return (
    <div className="bg-black/30 rounded-lg p-6 backdrop-blur-sm border border-[#D4AF37]/20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">اسم المستخدم</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">كلمة المرور</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-white"
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
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A] font-bold py-3 px-4 rounded-md transition-all"
          >
            {loginMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              "دخول"
            )}
          </Button>
          
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
            >
              نسيت كلمة المرور؟
            </button>
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
              onClick={onSwitchToRegister}
            >
              إنشاء حساب
            </button>
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
            <span className="flex-shrink mx-3 text-[#D4AF37]/60 text-xs">أو</span>
            <div className="flex-grow border-t border-[#D4AF37]/20"></div>
          </div>
          
          {/* أزرار تسجيل الدخول البديلة */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGuestLogin}
              disabled={loginGuestMutation.isPending}
              className="flex items-center justify-center py-2 px-4 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-md transition-all"
            >
              {loginGuestMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  <span>دخول كضيف</span>
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookLogin}
              disabled={loginFacebookMutation.isPending}
              className="flex items-center justify-center py-2 px-4 border border-[#1877F2]/30 hover:border-[#1877F2] hover:bg-[#1877F2]/10 text-white rounded-md transition-all"
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
          
        </form>
      </Form>
    </div>
  );
}