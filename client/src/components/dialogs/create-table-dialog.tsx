import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { X, Plus, Users, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatChips } from "@/lib/utils";

// نموذج إنشاء الطاولة
const createTableSchema = z.object({
  name: z.string().min(3, "اسم الطاولة يجب أن يحتوي على 3 أحرف على الأقل").max(50, "اسم الطاولة لا يجب أن يتجاوز 50 حرف"),
  smallBlind: z.number().min(10, "الحد الأدنى للرهان الصغير هو 10 رقائق"),
  bigBlind: z.number().min(20, "الحد الأدنى للرهان الكبير هو 20 رقائق"),
  minBuyIn: z.number().min(200, "الحد الأدنى للشراء هو 200 رقائق"),
  maxBuyIn: z.number().min(1000, "الحد الأدنى للشراء الأقصى هو 1000 رقائق"),
  maxPlayers: z.number().min(2, "يجب أن يكون هناك لاعبين على الأقل").max(9, "الحد الأقصى هو 9 لاعبين"),
  category: z.string().min(1, "يجب اختيار مستوى الطاولة"),
  hasPassword: z.boolean().default(false),
  password: z.string().optional(),
  isVip: z.boolean().default(false),
  requiredVipLevel: z.number().min(0, "مستوى VIP يجب أن يكون 0 أو أكثر").max(10, "الحد الأقصى لمستوى VIP هو 10").default(0),
});

// نوع بيانات النموذج
type CreateTableFormData = z.infer<typeof createTableSchema>;

// خصائص المكون
interface CreateTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
}

// القيم الافتراضية
const defaultFormValues: CreateTableFormData = {
  name: "",
  smallBlind: 10,
  bigBlind: 20,
  minBuyIn: 500,
  maxBuyIn: 5000,
  maxPlayers: 6,
  category: "نوب",
  hasPassword: false,
  password: "",
  isVip: false,
  requiredVipLevel: 0,
};

export function CreateTableDialog({ isOpen, onClose, gameType }: CreateTableDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // إعداد نموذج إنشاء الطاولة
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateTableFormData>({
    resolver: zodResolver(createTableSchema),
    defaultValues: defaultFormValues,
  });
  
  // مراقبة قيم النموذج
  const hasPassword = watch("hasPassword");
  const isVip = watch("isVip");
  const smallBlind = watch("smallBlind");
  const bigBlind = watch("bigBlind");
  const minBuyIn = watch("minBuyIn");
  const maxBuyIn = watch("maxBuyIn");
  
  // تحديث قيمة الرهان الكبير تلقائياً عند تغيير الرهان الصغير
  const handleSmallBlindChange = (value: number[]) => {
    const newSmallBlind = value[0];
    setValue("smallBlind", newSmallBlind);
    
    // تأكد من أن الرهان الكبير ضعف الرهان الصغير على الأقل
    if (bigBlind < newSmallBlind * 2) {
      setValue("bigBlind", newSmallBlind * 2);
    }
  };
  
  // تحديث قيمة الشراء الأدنى تلقائياً عند تغيير الرهان الكبير
  const handleBigBlindChange = (value: number[]) => {
    const newBigBlind = value[0];
    setValue("bigBlind", newBigBlind);
    
    // تأكد من أن الحد الأدنى للشراء 20 ضعف الرهان الكبير على الأقل
    if (minBuyIn < newBigBlind * 20) {
      setValue("minBuyIn", newBigBlind * 20);
    }
  };
  
  // معالجة تقديم النموذج
  const onSubmit = async (data: CreateTableFormData) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول لإنشاء طاولة",
        variant: "destructive",
      });
      return;
    }
    
    // فحص رصيد المستخدم
    if (user.chips < data.minBuyIn) {
      toast({
        title: "رصيد غير كافٍ",
        description: `تحتاج على الأقل ${formatChips(data.minBuyIn)} لإنشاء هذه الطاولة`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // تجهيز بيانات الطاولة للإرسال
      const tableData = {
        ...data,
        gameType: gameType || "arab_poker",
        password: data.hasPassword ? data.password : undefined,
        requiredVipLevel: data.isVip ? data.requiredVipLevel : 0,
        tableSettings: {
          category: data.category,
        },
      };
      
      // إرسال طلب إنشاء الطاولة
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "حدث خطأ أثناء إنشاء الطاولة");
      }
      
      const result = await response.json();
      
      toast({
        title: "تم إنشاء الطاولة بنجاح",
        description: "سيتم توجيهك إلى الطاولة الجديدة",
      });
      
      // إغلاق النافذة المنبثقة
      onClose();
      
      // التوجيه إلى الطاولة الجديدة
      if (result.tableId) {
        navigate(`/arab-poker/${result.tableId}`);
      }
    } catch (error) {
      console.error("خطأ في إنشاء الطاولة:", error);
      toast({
        title: "فشل في إنشاء الطاولة",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // إذا كانت النافذة مغلقة، لا تعرض شيئاً
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-[#0a0a21] to-black rounded-lg p-6 w-full max-w-md border border-[#D4AF37]/30 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#D4AF37]">إنشاء طاولة جديدة</h2>
          <button onClick={onClose} className="text-[#D4AF37] hover:text-[#E5C04B]">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* اسم الطاولة */}
          <div>
            <Label htmlFor="name" className="text-[#D4AF37]">اسم الطاولة</Label>
            <Input
              id="name"
              placeholder="أدخل اسم للطاولة"
              className="bg-black/40 border-[#D4AF37]/30 text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          {/* مستوى الطاولة */}
          <div>
            <Label htmlFor="category" className="text-[#D4AF37]">مستوى الطاولة</Label>
            <Select 
              defaultValue="نوب" 
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger className="bg-black/40 border-[#D4AF37]/30 text-white">
                <SelectValue placeholder="اختر مستوى الطاولة" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a21] border-[#D4AF37]/30">
                <SelectItem value="نوب">نوب</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="محترف">محترف</SelectItem>
                <SelectItem value="الفاجر">الفاجر</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>
          
          {/* الرهان الصغير */}
          <div>
            <Label htmlFor="smallBlind" className="text-[#D4AF37]">الرهان الصغير: {formatChips(smallBlind)}</Label>
            <Slider
              id="smallBlind"
              min={10}
              max={1000}
              step={10}
              value={[smallBlind]}
              onValueChange={handleSmallBlindChange}
              className="mt-2"
            />
            {errors.smallBlind && (
              <p className="text-red-500 text-sm mt-1">{errors.smallBlind.message}</p>
            )}
          </div>
          
          {/* الرهان الكبير */}
          <div>
            <Label htmlFor="bigBlind" className="text-[#D4AF37]">الرهان الكبير: {formatChips(bigBlind)}</Label>
            <Slider
              id="bigBlind"
              min={20}
              max={2000}
              step={20}
              value={[bigBlind]}
              onValueChange={handleBigBlindChange}
              className="mt-2"
            />
            {errors.bigBlind && (
              <p className="text-red-500 text-sm mt-1">{errors.bigBlind.message}</p>
            )}
          </div>
          
          {/* الحد الأدنى للشراء */}
          <div>
            <Label htmlFor="minBuyIn" className="text-[#D4AF37]">الحد الأدنى للشراء: {formatChips(minBuyIn)}</Label>
            <Slider
              id="minBuyIn"
              min={200}
              max={10000}
              step={100}
              value={[minBuyIn]}
              onValueChange={(value) => setValue("minBuyIn", value[0])}
              className="mt-2"
            />
            {errors.minBuyIn && (
              <p className="text-red-500 text-sm mt-1">{errors.minBuyIn.message}</p>
            )}
          </div>
          
          {/* الحد الأقصى للشراء */}
          <div>
            <Label htmlFor="maxBuyIn" className="text-[#D4AF37]">الحد الأقصى للشراء: {formatChips(maxBuyIn)}</Label>
            <Slider
              id="maxBuyIn"
              min={1000}
              max={100000}
              step={1000}
              value={[maxBuyIn]}
              onValueChange={(value) => setValue("maxBuyIn", value[0])}
              className="mt-2"
            />
            {errors.maxBuyIn && (
              <p className="text-red-500 text-sm mt-1">{errors.maxBuyIn.message}</p>
            )}
          </div>
          
          {/* عدد اللاعبين */}
          <div>
            <Label htmlFor="maxPlayers" className="text-[#D4AF37]">الحد الأقصى للاعبين</Label>
            <Select 
              defaultValue="6" 
              onValueChange={(value) => setValue("maxPlayers", parseInt(value))}
            >
              <SelectTrigger className="bg-black/40 border-[#D4AF37]/30 text-white">
                <SelectValue placeholder="عدد اللاعبين" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a21] border-[#D4AF37]/30">
                <SelectItem value="2">2 لاعبين</SelectItem>
                <SelectItem value="4">4 لاعبين</SelectItem>
                <SelectItem value="6">6 لاعبين</SelectItem>
                <SelectItem value="9">9 لاعبين</SelectItem>
              </SelectContent>
            </Select>
            {errors.maxPlayers && (
              <p className="text-red-500 text-sm mt-1">{errors.maxPlayers.message}</p>
            )}
          </div>
          
          {/* كلمة المرور */}
          <div className="flex items-start space-x-2 space-x-reverse">
            <Checkbox
              id="hasPassword"
              checked={hasPassword}
              onCheckedChange={(checked) => setValue("hasPassword", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="hasPassword" className="text-[#D4AF37]">
                تأمين الطاولة بكلمة مرور
              </Label>
              <p className="text-sm text-[#D4AF37]/70">
                سيُطلب من اللاعبين إدخال كلمة المرور للانضمام
              </p>
            </div>
          </div>
          
          {/* حقل كلمة المرور */}
          {hasPassword && (
            <div>
              <Label htmlFor="password" className="text-[#D4AF37]">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                className="bg-black/40 border-[#D4AF37]/30 text-white"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          )}
          
          {/* خيار VIP */}
          <div className="flex items-start space-x-2 space-x-reverse">
            <Checkbox
              id="isVip"
              checked={isVip}
              onCheckedChange={(checked) => setValue("isVip", checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="isVip" className="text-[#D4AF37]">
                طاولة VIP
              </Label>
              <p className="text-sm text-[#D4AF37]/70">
                سيُطلب من اللاعبين مستوى VIP معين للانضمام
              </p>
            </div>
          </div>
          
          {/* مستوى VIP المطلوب */}
          {isVip && (
            <div>
              <Label htmlFor="requiredVipLevel" className="text-[#D4AF37]">مستوى VIP المطلوب: {watch("requiredVipLevel")}</Label>
              <Slider
                id="requiredVipLevel"
                min={1}
                max={10}
                step={1}
                value={[watch("requiredVipLevel")]}
                onValueChange={(value) => setValue("requiredVipLevel", value[0])}
                className="mt-2"
              />
              {errors.requiredVipLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.requiredVipLevel.message}</p>
              )}
            </div>
          )}
          
          {/* رصيدك الحالي */}
          <div className="bg-black/20 p-3 rounded-lg border border-[#D4AF37]/20 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-[#D4AF37]">رصيدك الحالي:</span>
              <div className="flex items-center">
                <Coins className="h-4 w-4 text-[#D4AF37] ml-1" />
                <span className="font-bold text-[#D4AF37]">{formatChips(user?.chips || 0)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[#D4AF37]">الحد الأدنى للشراء:</span>
              <div className="flex items-center">
                <Coins className="h-4 w-4 text-[#D4AF37] ml-1" />
                <span className="font-bold text-[#D4AF37]">{formatChips(minBuyIn)}</span>
              </div>
            </div>
          </div>
          
          {/* زر الإنشاء */}
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button 
              type="submit" 
              className="bg-[#D4AF37] text-black hover:bg-[#E5C04B]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <X className="animate-spin h-4 w-4 ml-2" />
                  جارِ الإنشاء...
                </span>
              ) : (
                <span className="flex items-center">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء الطاولة
                </span>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={onClose}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}