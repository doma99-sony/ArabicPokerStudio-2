import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// تعريف دالة apiRequest
const apiRequest = async (url: string, options: { method: string; data?: any }) => {
  const { method, data } = options;
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };
  
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "حدث خطأ في الطلب");
  }
  
  return response.json();
};

// Components UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Coins as CoinsIcon, Gift, Loader2, Search, Send } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/use-auth";

// تعريف المخطط
const sendChipsSchema = z.object({
  recipientId: z.string().min(1, { message: "يرجى إدخال معرف المستلم" }),
  amount: z.number().min(1000, { message: "الحد الأدنى للتحويل هو 1,000 رقائق" })
    .max(100000000, { message: "الحد الأقصى للتحويل هو 100,000,000 رقائق" }),
});

type SendChipsFormValues = z.infer<typeof sendChipsSchema>;

export default function SendChipsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchLoading, setSearchLoading] = useState(false);
  const [recipient, setRecipient] = useState<any | null>(null);
  const [dailyLimit, setDailyLimit] = useState<{
    used: number;
    remaining: number;
    resetTime: number;
  }>({
    used: 0,
    remaining: 100000000, // 100 مليون رقاقة
    resetTime: Date.now() + 24 * 60 * 60 * 1000, // وقت إعادة التعيين بعد 24 ساعة
  });
  const [countdown, setCountdown] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 24, minutes: 0, seconds: 0 });

  // Maximum amount based on user's available chips (limited to 100 million)
  const maxAmount = Math.min(user?.chips || 0, 100000000);
  
  // إعداد النموذج
  const form = useForm<SendChipsFormValues>({
    resolver: zodResolver(sendChipsSchema),
    defaultValues: {
      recipientId: "",
      amount: Math.min(1000, maxAmount), // قيمة افتراضية معقولة (الحد الأدنى)
    },
  });

  // قيمة الرقائق الحالية 
  const chipsAmount = form.watch("amount");
  
  // تقديم النموذج - المتغير
  const sendChipsMutation = useMutation({
    mutationFn: (data: SendChipsFormValues) => {
      // تحويل معرف المستلم إلى رقم قبل الإرسال عن طريق إرسال نسخة معدلة من البيانات
      return apiRequest("/api/send-chips", {
        method: "POST",
        data: {
          ...data,
          // ملاحظة: لا نغير النوع هنا، نرسل البيانات كما هي والخادم سيتعامل معها
          recipientId: data.recipientId.trim()
        },
      });
    }
  });

  // البحث عن المستخدم
  const searchUserMutation = useMutation({
    mutationFn: (userId: string) => {
      setSearchLoading(true);
      return apiRequest("/api/users/" + userId, {
        method: "GET",
      });
    },
    onSuccess: (data) => {
      setRecipient(data);
      setSearchLoading(false);
      
      // رسالة نجاح لتأكيد العثور على المستخدم
      toast({
        title: "تم العثور على المستخدم",
        description: `المستخدم ${data.username} جاهز لاستلام الرقائق.`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      setRecipient(null);
      setSearchLoading(false);
      
      let errorMessage = "تأكد من إدخال معرف المستخدم بشكل صحيح.";
      
      // التحقق من نوع الخطأ إذا كان معروفًا
      if (error && error.message) {
        if (error.message.includes("المستخدم غير موجود")) {
          errorMessage = "هذا المستخدم غير مسجل في النظام.";
        }
      }
      
      toast({
        title: "لم يتم العثور على المستخدم",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // البحث عن المستخدم عند التغيير
  const handleSearchUser = () => {
    const userId = form.getValues().recipientId.trim(); // إزالة المسافات الزائدة
    
    if (!userId || userId.length === 0) {
      toast({
        title: "معرف المستلم مطلوب",
        description: "يرجى إدخال معرف المستلم للبحث عنه",
        variant: "destructive",
      });
      return;
    }
    
    // تحويل معرف المستخدم إلى رقم إذا كان ممكناً
    const userIdNum = parseInt(userId);
    const searchId = isNaN(userIdNum) ? userId : userIdNum.toString();
    
    // البحث عن المستخدم
    searchUserMutation.mutate(searchId);
  };

  // تحديث العد التنازلي
  useEffect(() => {
    // استرجاع البيانات المخزنة من localStorage
    const storedDailyLimit = localStorage.getItem('dailyLimit');
    if (storedDailyLimit) {
      setDailyLimit(JSON.parse(storedDailyLimit));
    }

    // تحديث العد التنازلي كل ثانية
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now >= dailyLimit.resetTime) {
        // إعادة تعيين الحد اليومي عند انتهاء الوقت
        const newLimit = {
          used: 0,
          remaining: 100000000,
          resetTime: now + 24 * 60 * 60 * 1000,
        };
        setDailyLimit(newLimit);
        localStorage.setItem('dailyLimit', JSON.stringify(newLimit));
        setCountdown({ hours: 24, minutes: 0, seconds: 0 });
      } else {
        // تحديث العد التنازلي
        const diff = dailyLimit.resetTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, minutes, seconds });
      }
    }, 1000);
    
    // تنظيف المؤقت عند إلغاء تحميل المكون
    return () => clearInterval(intervalId);
  }, [dailyLimit.resetTime]);
  
  // تقديم النموذج
  const onSubmit = (data: SendChipsFormValues) => {
    // التحقق من وجود المستلم قبل الإرسال
    if (!recipient) {
      toast({
        title: "المستلم غير موجود",
        description: "يرجى البحث عن المستلم والتأكد من وجوده قبل إرسال الرقائق.",
        variant: "destructive",
      });
      return;
    }
    
    if (data.amount > (user?.chips || 0)) {
      toast({
        title: "رصيد غير كافي",
        description: "لا تملك ما يكفي من الرقائق لإتمام هذه العملية.",
        variant: "destructive",
      });
      return;
    }
    
    // التحقق من الحد اليومي
    if (data.amount > dailyLimit.remaining) {
      toast({
        title: "تجاوز الحد اليومي",
        description: `يمكنك تحويل ${dailyLimit.remaining.toLocaleString('ar-EG')} رقاقة كحد أقصى في الوقت الحالي. يمكنك التحويل مرة أخرى بعد ${countdown.hours} ساعة و ${countdown.minutes} دقيقة.`,
        variant: "destructive",
      });
      return;
    }
    
    // إرسال الطلب
    sendChipsMutation.mutate(data, {
      onSuccess: () => {
        // تحديث الحد اليومي فقط بعد نجاح التحويل
        const newLimit = {
          ...dailyLimit,
          used: dailyLimit.used + data.amount,
          remaining: dailyLimit.remaining - data.amount,
        };
        setDailyLimit(newLimit);
        localStorage.setItem('dailyLimit', JSON.stringify(newLimit));
        
        toast({
          title: "تم إرسال الرقائق بنجاح",
          description: `تم إرسال ${data.amount.toLocaleString('ar-EG')} رقائق إلى ${recipient?.username}`,
        });
        
        // تحديث بيانات المستخدم
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        // العودة إلى الصفحة السابقة بعد النجاح
        setTimeout(() => {
          navigate("/");
        }, 2000);
      },
      onError: (error: any) => {
        let errorMessage = "حدث خطأ أثناء محاولة إرسال الرقائق. يرجى المحاولة مرة أخرى.";
        let errorTitle = "خطأ في إرسال الرقائق";
        
        // تفصيل رسائل الخطأ استناداً إلى نوع الخطأ المعروف
        if (error && error.message) {
          if (error.message.includes("المستلم غير موجود")) {
            errorMessage = "لم يتم العثور على المستخدم المستلم. يرجى التحقق من المعرّف وإعادة المحاولة.";
            errorTitle = "خطأ في المستلم";
          } else if (error.message.includes("رصيد غير كافٍ")) {
            errorMessage = "لا تملك رصيد كافي من الرقائق لإتمام هذه العملية.";
            errorTitle = "رصيد غير كافي";
          } else if (error.message.includes("لا يمكنك إرسال رقائق لنفسك")) {
            errorMessage = "لا يمكنك إرسال رقائق لنفسك. يرجى إدخال معرّف مستخدم آخر.";
            errorTitle = "عملية غير مسموحة";
          } else {
            errorMessage = error.message;
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  // التحقق من أن المستخدم مسجل الدخول
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md border-[#D4AF37] bg-black/70 text-white">
          <CardHeader>
            <CardTitle className="text-[#D4AF37]">يجب تسجيل الدخول أولاً</CardTitle>
            <CardDescription className="text-gray-400">
              يجب عليك تسجيل الدخول لاستخدام ميزة العطاء
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => navigate("/login")} 
              className="bg-[#D4AF37] text-black hover:bg-[#B08D1A] w-full"
            >
              تسجيل الدخول
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1B4D3E] to-black/90 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2 bg-black/20 hover:bg-[#D4AF37]/20 text-[#D4AF37]"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#D4AF37] flex items-center">
            <Gift className="mr-2 h-6 w-6" />
            العطاء
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0A3A2A]/80 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30">
            <CoinsIcon className="h-4 w-4 text-[#D4AF37] ml-2" />
            <span className="text-[#D4AF37] font-bold">
              {user?.chips?.toLocaleString('ar-EG') || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-b from-black/80 to-[#0A3A2A]/20">
        <div className="max-w-md mx-auto">
          <Card className="border-[#D4AF37] bg-black/70 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#D4AF37] text-center">إرسال رقائق إلى صديق</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                قم بإدخال معرف المستخدم وكمية الرقائق التي ترغب في إرسالها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* حقل معرف المستلم */}
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[#D4AF37]">معرف المستلم</FormLabel>
                        <div className="flex">
                          <FormControl>
                            <Input
                              placeholder="أدخل معرف المستلم"
                              className="bg-[#0A3A2A]/40 border-[#D4AF37]/30 text-white"
                              {...field}
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            className="mr-2 bg-[#D4AF37] text-black hover:bg-[#B08D1A]"
                            onClick={handleSearchUser}
                            disabled={searchLoading}
                          >
                            {searchLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* عرض معلومات المستلم إذا تم العثور عليه */}
                  {recipient && (
                    <div className="border border-[#D4AF37]/30 rounded-lg p-3 bg-[#0A3A2A]/30">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37] ml-3">
                          <img 
                            src={recipient.avatar || "/assets/poker-icon-gold.png"} 
                            alt={recipient.username} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#D4AF37]">{recipient.username}</div>
                          <div className="text-sm text-gray-400">معرف: {recipient.id}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* حقل كمية الرقائق */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-[#D4AF37]">كمية الرقائق</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex">
                              <Input
                                type="number"
                                className="bg-[#0A3A2A]/40 border-[#D4AF37]/30 text-white"
                                min={1000}
                                max={maxAmount}
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                              />
                              <div className="mr-2 min-w-[100px] flex items-center justify-center py-2 bg-[#0A3A2A] rounded border border-[#D4AF37]/30">
                                <CoinsIcon className="h-4 w-4 text-[#D4AF37] ml-1" />
                                <span className="text-[#D4AF37]">رقائق</span>
                              </div>
                            </div>
                            
                            <Slider
                              onValueChange={(value) => field.onChange(value[0])}
                              defaultValue={[field.value]}
                              value={[field.value]}
                              max={maxAmount}
                              min={1000}
                              step={1000}
                              className="py-4"
                            />
                            
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>الحد الأدنى: 1,000</span>
                              <span>الحد الأقصى: {maxAmount.toLocaleString('ar-EG')}</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* زر إرسال */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#D4AF37] text-black hover:bg-[#B08D1A] flex items-center justify-center gap-2 h-12"
                      disabled={sendChipsMutation.isPending}
                    >
                      {sendChipsMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      ) : (
                        <Send className="h-5 w-5 ml-2" />
                      )}
                      إرسال {chipsAmount?.toLocaleString('ar-EG') || 0} رقائق
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              {/* عرض معلومات الحد اليومي والعد التنازلي */}
              <div className="border border-[#D4AF37]/30 rounded-lg p-3 bg-[#0A3A2A]/30 w-full mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#D4AF37] text-sm">الحد اليومي:</span>
                  <span className="text-white text-sm">
                    <span className="font-bold">{dailyLimit.remaining.toLocaleString('ar-EG')}</span>
                    <span className="text-gray-400"> / 100,000,000</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#D4AF37] text-sm">إعادة التعيين:</span>
                  <div className="flex items-center bg-black/30 rounded px-2 py-1 text-white font-mono">
                    <span className="mx-1">{countdown.hours.toString().padStart(2, '0')}</span>:
                    <span className="mx-1">{countdown.minutes.toString().padStart(2, '0')}</span>:
                    <span className="mx-1">{countdown.seconds.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                ملاحظة: سيتم إرسال إشعار للمستلم لاستلام الرقائق من خلال صندوق الرسائل
              </p>
              <p className="text-xs text-gray-400 text-center">
                يمكنك تحويل 100,000,000 رقاقة كحد أقصى كل 24 ساعة
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}