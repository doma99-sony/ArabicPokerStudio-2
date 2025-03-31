import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ShoppingCart, DollarSign, Zap, CreditCard, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// أنواع العناصر في المتجر
type ChipPackage = {
  id: string;
  name: string;
  amount: number;
  price: number;
  discountPercent?: number;
  popular?: boolean;
  bestValue?: boolean;
};

type MissionType = {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  completed: boolean;
};

export default function ShopPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chips");
  const [selectedPackage, setSelectedPackage] = useState<ChipPackage | null>(null);
  const [openPurchaseDialog, setOpenPurchaseDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // عروض شحن الرقاقات
  const chipPackages: ChipPackage[] = [
    {
      id: "chips_1",
      name: "باقة المبتدئين",
      amount: 100000,
      price: 20,
      discountPercent: 0
    },
    {
      id: "chips_2",
      name: "باقة المتوسطة",
      amount: 500000,
      price: 99,
      discountPercent: 0,
      popular: true
    },
    {
      id: "chips_3",
      name: "باقة المليون",
      amount: 1000000,
      price: 200,
      discountPercent: 5
    },
    {
      id: "chips_4",
      name: "باقة النخبة",
      amount: 10000000,
      price: 1600,
      discountPercent: 15,
      bestValue: true
    }
  ];

  // المهمات اليومية
  const dailyMissions: MissionType[] = [
    {
      id: "mission_1",
      title: "خبير الدومينو",
      description: "العب 10 أدوار دومينو",
      reward: 100000,
      progress: 3,
      total: 10,
      completed: false
    },
    {
      id: "mission_2",
      title: "جامع الثروات",
      description: "اجمع 2 مليون رقاقة في طاولات بوكر النوب",
      reward: 200000,
      progress: 750000,
      total: 2000000,
      completed: false
    },
    {
      id: "mission_3",
      title: "المشتري الذهبي",
      description: "قم بشراء أي شيء من المتجر بقيمة 100ج",
      reward: 500000,
      progress: 0,
      total: 100,
      completed: false
    },
    {
      id: "mission_4",
      title: "سيد الطاولات",
      description: "فز في 5 ألعاب بوكر متتالية",
      reward: 300000,
      progress: 2,
      total: 5,
      completed: false
    },
    {
      id: "mission_5",
      title: "الفوز الكبير",
      description: "اربح 5 مليون رقاقة في لعبة واحدة",
      reward: 1000000,
      progress: 0,
      total: 5000000,
      completed: false
    }
  ];

  // محاكاة عملية الشراء
  const handlePurchase = () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOpenPurchaseDialog(false);
      
      toast({
        title: "تمت عملية الشراء بنجاح!",
        description: `تم إضافة ${selectedPackage.amount.toLocaleString()} رقاقة إلى حسابك.`,
        duration: 5000
      });

      // تحديث تقدم المهمة الثالثة (المشتري الذهبي)
      if (selectedPackage.price >= 100) {
        toast({
          title: "مهمة مكتملة!",
          description: "لقد أكملت مهمة المشتري الذهبي وحصلت على 500,000 رقاقة!",
          duration: 5000
        });
      }
    }, 2000);
  };

  // تنسيق للرقم بالصيغة العربية
  const formatNumber = (num: number): string => {
    return num.toLocaleString("ar-EG");
  };

  // المطالبة بمكافأة المهمة
  const claimReward = (mission: MissionType) => {
    toast({
      title: "تمت المطالبة بنجاح!",
      description: `تم إضافة ${formatNumber(mission.reward)} رقاقة إلى حسابك.`,
      duration: 3000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1708] text-white">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/lobby")}
            className="flex items-center gap-2 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            <ArrowRight className="h-5 w-5" />
            <span>العودة للصفحة الرئيسية</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#D4AF37]">المتجر</h1>
            <ShoppingCart className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        
        {/* عرض الرصيد الحالي */}
        <div className="bg-black/40 p-4 rounded-lg border border-[#D4AF37]/30 flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#D4AF37]/20 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm text-white/70">رصيدك الحالي</p>
              <p className="text-xl font-bold text-[#D4AF37]">{user?.chips?.toLocaleString() || 0} رقاقة</p>
            </div>
          </div>
          
          <Button 
            className="bg-[#D4AF37] hover:bg-[#c9a431] text-black"
            onClick={() => navigate("/inventory")}
          >
            <ShoppingBag className="h-4 w-4 ml-1" />
            الحقيبة
          </Button>
        </div>
        
        {/* تبويبات المتجر */}
        <Tabs 
          defaultValue="chips" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-[#D4AF37]/20">
            <TabsList className="bg-black/30 overflow-x-auto w-full">
              <TabsTrigger value="chips" className="text-[#D4AF37]">
                <Zap className="h-4 w-4 ml-1" />
                شحن الرقاقات
              </TabsTrigger>
              <TabsTrigger value="missions" className="text-[#D4AF37]">
                <div className="h-4 w-4 ml-1 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-xs">🎯</span>
                </div>
                المهمات اليومية
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* قسم شحن الرقاقات */}
          <TabsContent value="chips" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chipPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-[#1a1708]/80 rounded-lg border ${
                    pkg.popular ? 'border-orange-500' : pkg.bestValue ? 'border-[#D4AF37]' : 'border-gray-700'
                  } overflow-hidden cursor-pointer hover:shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all duration-300 relative`}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setOpenPurchaseDialog(true);
                  }}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-2 py-1 font-bold">
                      الأكثر شراءً
                    </div>
                  )}
                  {pkg.bestValue && (
                    <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs px-2 py-1 font-bold">
                      أفضل قيمة
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-[#1a1708] to-black p-4 flex flex-col items-center">
                    <h3 className="font-bold text-lg text-[#D4AF37] text-center mb-2">{pkg.name}</h3>
                    <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-3">
                      <DollarSign className="h-8 w-8 text-[#D4AF37]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{formatNumber(pkg.amount)}</p>
                    <p className="text-sm text-white/60 mb-2">رقاقة</p>
                    
                    {pkg.discountPercent && pkg.discountPercent > 0 && (
                      <div className="bg-green-600/20 text-green-400 text-xs px-2 py-0.5 rounded-full mb-2">
                        خصم {pkg.discountPercent}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col items-center bg-black/40">
                    <p className="text-lg font-bold text-[#D4AF37] mb-2">{pkg.price} ج.م</p>
                    <Button className="w-full bg-[#D4AF37] hover:bg-[#c9a431] text-black font-bold">
                      شراء الآن
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* قسم المهمات اليومية */}
          <TabsContent value="missions" className="mt-6">
            <div className="bg-black/20 rounded-lg border border-[#D4AF37]/20 p-4 mb-4">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-2">المهمات اليومية</h3>
              <p className="text-sm text-white/70">أكمل المهمات اليومية للحصول على مكافآت إضافية!</p>
            </div>
            
            <div className="space-y-4">
              {dailyMissions.map((mission) => {
                const progressPercent = Math.min(100, (mission.progress / mission.total) * 100);
                const isCompleted = mission.progress >= mission.total;
                
                return (
                  <div 
                    key={mission.id}
                    className={`bg-[#1a1708]/60 rounded-lg border ${
                      isCompleted ? 'border-green-500/50' : 'border-gray-700/50'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-[#D4AF37]">{mission.title}</h3>
                          <p className="text-sm text-white/70">{mission.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-white/50">المكافأة</span>
                          <p className="font-bold text-[#D4AF37]">{formatNumber(mission.reward)} رقاقة</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-[#D4AF37]'}`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">
                          {isCompleted ? 'مكتمل' : `${mission.progress} / ${formatNumber(mission.total)}`}
                        </span>
                        
                        <Button
                          size="sm"
                          className={isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 text-gray-400 cursor-not-allowed"}
                          disabled={!isCompleted}
                          onClick={() => isCompleted && claimReward(mission)}
                        >
                          {isCompleted ? 'استلم المكافأة' : 'غير مكتمل'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* نافذة منبثقة لتأكيد الشراء */}
      {selectedPackage && (
        <Dialog open={openPurchaseDialog} onOpenChange={setOpenPurchaseDialog}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
                تأكيد عملية الشراء
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-[#D4AF37]" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white text-center mb-2">{selectedPackage.name}</h3>
              
              <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg mb-3">
                <span className="text-white/70">الكمية:</span>
                <span className="font-bold text-[#D4AF37]">{formatNumber(selectedPackage.amount)} رقاقة</span>
              </div>
              
              <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg mb-4">
                <span className="text-white/70">السعر:</span>
                <span className="font-bold text-[#D4AF37]">{selectedPackage.price} ج.م</span>
              </div>
              
              <div className="text-center text-sm text-white/70 mb-4">
                سيتم إضافة الرقاقات إلى حسابك فوراً بعد إتمام العملية
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="outline" 
                className="text-white/70 border-white/20"
                onClick={() => setOpenPurchaseDialog(false)}
                disabled={isProcessing}
              >
                إلغاء
              </Button>
              
              <Button 
                className="bg-[#D4AF37] hover:bg-[#c9a431] text-black"
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full ml-2"></span>
                    جاري المعالجة...
                  </span>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 ml-1" />
                    تأكيد الشراء
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}