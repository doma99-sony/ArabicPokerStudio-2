import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يحتوي على 3 أحرف على الأقل" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { loginMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="bg-slate/30 rounded-lg p-6 backdrop-blur-sm border border-gold/20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-tajawal">اسم المستخدم</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="w-full bg-deepBlack/70 border border-gold/30 rounded py-2 px-3 text-white focus:outline-none focus:border-gold"
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
                <FormLabel className="text-white font-tajawal">كلمة المرور</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-deepBlack/70 border border-gold/30 rounded py-2 px-3 text-white focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/70"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye-slash"></i>
                      ) : (
                        <i className="fas fa-eye"></i>
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
            className="w-full bg-gradient-to-br from-gold to-darkGold hover:from-lightGold hover:to-gold text-deepBlack font-bold py-3 px-4 rounded-md transition-all font-cairo"
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
              className="text-gold/90 hover:text-gold"
            >
              نسيت كلمة المرور؟
            </button>
            <button
              type="button"
              className="text-gold/90 hover:text-gold"
              onClick={onSwitchToRegister}
            >
              تسجيل جديد
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
