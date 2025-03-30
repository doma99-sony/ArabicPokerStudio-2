import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
    registerMutation.mutate(registerData);
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
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
            disabled={registerMutation.isPending}
            className="w-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A] font-bold py-3 px-4 rounded-md transition-all"
          >
            {registerMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              "تسجيل"
            )}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
              onClick={onSwitchToLogin}
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}