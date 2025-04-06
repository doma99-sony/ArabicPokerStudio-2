// نقلنا هذا المكون من المجلد dialogs إلى مجلد components بسبب مشكلة في الاستيراد

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { X, Plus, Users, Coins, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatChips, formatToEnglishNumbers } from "@/lib/utils";

// نموذج إنشاء الطاولة
const createTableSchema = z.object({
  name: z.string().min(3, "اسم الطاولة يجب أن يحتوي على 3 أحرف على الأقل").max(50, "اسم الطاولة لا يجب أن يتجاوز 50 حرف"),
  smallBlind: z.number().min(10, "الحد الأدنى للرهان الصغير هو 10 رقائق"),
  maxPlayers: z.number().min(2, "يجب أن يكون عدد اللاعبين على الأقل 2").max(9, "الحد الأقصى لعدد اللاعبين هو 9"),
  minBuyIn: z.number().min(20, "الحد الأدنى للدخول يجب أن يكون 20 رقاقة على الأقل"),
  maxBuyIn: z.number().min(100, "الحد الأقصى للدخول يجب أن يكون 100 رقاقة على الأقل"),
  category: z.string().min(1, "يجب اختيار فئة الطاولة"),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
});

type CreateTableForm = z.infer<typeof createTableSchema>;

interface CreateTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
}

export function CreateTableDialog({ isOpen, onClose, gameType }: CreateTableDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isPrivateTable, setIsPrivateTable] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("نوب");
  const [smallBlindValue, setSmallBlindValue] = useState(10);
  const [maxPlayersValue, setMaxPlayersValue] = useState(6);
  const [buyInRange, setBuyInRange] = useState([200, 2000]);

  const form = useForm<CreateTableForm>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      name: `طاولة ${user?.username || ""}`,
      smallBlind: 10,
      maxPlayers: 6,
      minBuyIn: 200,
      maxBuyIn: 2000,
      category: "نوب",
      isPrivate: false,
      password: "",
    },
  });

  if (!isOpen) return null;

  const handleSubmit = async (data: CreateTableForm) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/tables/${gameType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          createdBy: user.id,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إنشاء الطاولة");
      }

      const result = await response.json();
      
      toast({
        title: "تم إنشاء الطاولة بنجاح",
        description: "يتم توجيهك إلى الطاولة الآن...",
      });

      // انتقل إلى صفحة الطاولة
      onClose();
      setTimeout(() => {
        navigate(`/${gameType}/${result.tableId}`);
      }, 500);
    } catch (error) {
      console.error("Error creating table:", error);
      toast({
        title: "خطأ في إنشاء الطاولة",
        description: error instanceof Error ? error.message : "حدث خطأ غير معروف",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تعديل الفورم عند تغيير قيمة السلايدر
  const updateFormValue = (field: keyof CreateTableForm, value: any) => {
    form.setValue(field, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // تحديث مدى الشراء عند تغييره من السلايدر
  const handleBuyInRangeChange = (values: number[]) => {
    setBuyInRange(values);
    updateFormValue("minBuyIn", values[0]);
    updateFormValue("maxBuyIn", values[1]);
  };

  // تحديث قيمة الرهان الصغير عند تغييرها من السلايدر
  const handleSmallBlindChange = (value: number[]) => {
    const smallBlind = value[0];
    setSmallBlindValue(smallBlind);
    updateFormValue("smallBlind", smallBlind);
  };

  // تحديث عدد اللاعبين عند تغييره من السلايدر
  const handleMaxPlayersChange = (value: number[]) => {
    const maxPlayers = value[0];
    setMaxPlayersValue(maxPlayers);
    updateFormValue("maxPlayers", maxPlayers);
  };

  // تحديث نوع الطاولة (خاصة/عامة)
  const handlePrivateChange = (checked: boolean) => {
    setIsPrivateTable(checked);
    updateFormValue("isPrivate", checked);
    if (!checked) {
      updateFormValue("password", "");
    }
  };

  // تحديث فئة الطاولة
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    updateFormValue("category", value);
    
    // تعديل قيم افتراضية حسب الفئة
    if (value === "نوب") {
      handleSmallBlindChange([10]);
      handleBuyInRangeChange([200, 2000]);
    } else if (value === "متوسط") {
      handleSmallBlindChange([50]);
      handleBuyInRangeChange([1000, 10000]);
    } else if (value === "محترف") {
      handleSmallBlindChange([100]);
      handleBuyInRangeChange([2000, 20000]);
    } else if (value === "الفاجر") {
      handleSmallBlindChange([500]);
      handleBuyInRangeChange([10000, 100000]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-[#0E1016] border border-[#D4AF37]/30 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#0E1016] border-b border-[#D4AF37]/30 flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-[#D4AF37]">إنشاء طاولة جديدة</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60"
          >
            <X size={18} className="text-[#D4AF37]" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-4">
          <div>
            <Label htmlFor="name" className="text-[#D4AF37]">اسم الطاولة</Label>
            <Input
              id="name"
              placeholder="أدخل اسم الطاولة"
              {...form.register("name")}
              className="bg-black/40 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white mt-1"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category" className="text-[#D4AF37]">فئة الطاولة</Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="bg-black/40 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white mt-1">
                <SelectValue placeholder="اختر فئة الطاولة" />
              </SelectTrigger>
              <SelectContent className="bg-[#0E1016] border-[#D4AF37]/30">
                <SelectItem value="نوب" className="focus:bg-[#D4AF37]/20 focus:text-[#D4AF37]">
                  نوب (10/20)
                </SelectItem>
                <SelectItem value="متوسط" className="focus:bg-[#D4AF37]/20 focus:text-[#D4AF37]">
                  متوسط (50/100)
                </SelectItem>
                <SelectItem value="محترف" className="focus:bg-[#D4AF37]/20 focus:text-[#D4AF37]">
                  محترف (100/200)
                </SelectItem>
                <SelectItem value="الفاجر" className="focus:bg-[#D4AF37]/20 focus:text-[#D4AF37]">
                  الفاجر (500/1000)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#D4AF37]">الرهان الصغير / الكبير</Label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/80 text-sm">
                <span className="font-arabic-numbers">{formatToEnglishNumbers(smallBlindValue)}</span> / <span className="font-arabic-numbers">{formatToEnglishNumbers(smallBlindValue * 2)}</span>
              </span>
              <span className="text-white/80 text-sm bg-black/40 px-2 py-1 rounded-md">
                <Coins size={14} className="inline ml-1 text-[#D4AF37]" />
                <span className="font-arabic-numbers">{formatChips(smallBlindValue)}</span>
              </span>
            </div>
            <Slider
              defaultValue={[10]}
              value={[smallBlindValue]}
              min={10}
              max={1000}
              step={10}
              onValueChange={handleSmallBlindChange}
              className="my-2"
            />
            <div className="grid grid-cols-5 gap-1 text-xs text-white/60">
              <div>10</div>
              <div>50</div>
              <div>100</div>
              <div>500</div>
              <div>1000</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#D4AF37]">عدد اللاعبين</Label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/80 text-sm">
                <Users size={14} className="inline ml-1 text-[#D4AF37]" />
                <span className="font-arabic-numbers">{formatToEnglishNumbers(maxPlayersValue)}</span> لاعبين
              </span>
            </div>
            <Slider
              defaultValue={[6]}
              value={[maxPlayersValue]}
              min={2}
              max={9}
              step={1}
              onValueChange={handleMaxPlayersChange}
              className="my-2"
            />
            <div className="grid grid-cols-8 gap-1 text-xs text-white/60">
              <div>2</div>
              <div>3</div>
              <div>4</div>
              <div>5</div>
              <div>6</div>
              <div>7</div>
              <div>8</div>
              <div>9</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#D4AF37]">مدى الشراء (الحد الأدنى / الأقصى)</Label>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/80 text-sm">
                <span className="font-arabic-numbers">{formatToEnglishNumbers(buyInRange[0])}</span> - <span className="font-arabic-numbers">{formatToEnglishNumbers(buyInRange[1])}</span>
              </span>
              <span className="text-white/80 text-sm bg-black/40 px-2 py-1 rounded-md">
                <Coins size={14} className="inline ml-1 text-[#D4AF37]" />
                <span className="font-arabic-numbers">{formatChips(buyInRange[0])}</span>
              </span>
            </div>
            <Slider
              defaultValue={[200, 2000]}
              value={buyInRange}
              min={100}
              max={100000}
              step={100}
              minStepsBetweenThumbs={5}
              onValueChange={handleBuyInRangeChange}
              className="my-2"
            />
            <div className="grid grid-cols-5 gap-1 text-xs text-white/60">
              <div>100</div>
              <div>1K</div>
              <div>10K</div>
              <div>50K</div>
              <div>100K</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse mt-4">
            <Checkbox
              id="isPrivate"
              checked={isPrivateTable}
              onCheckedChange={handlePrivateChange}
              className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
            />
            <Label
              htmlFor="isPrivate"
              className="text-white cursor-pointer select-none"
            >
              طاولة خاصة (تتطلب كلمة مرور)
            </Label>
          </div>

          {isPrivateTable && (
            <div>
              <Label htmlFor="password" className="text-[#D4AF37]">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور للطاولة"
                {...form.register("password")}
                className="bg-black/40 border-[#D4AF37]/30 focus:border-[#D4AF37] text-white mt-1"
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#D4AF37]/20 flex justify-end space-x-2 space-x-reverse">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-black hover:bg-[#E5C04B]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء الطاولة
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}