import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Crown, Star, Check, CreditCard, Lock, Shield, Gift, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// تعريف أنواع VIP
type VIPLevel = {
  id: number;
  name: string;
  price: number;
  color: string;
  borderColor: string;
  bgGradient: string;
  icon: string;
  benefits: string[];
  exclusive: string;
};

export default function VIPPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVIP, setSelectedVIP] = useState<VIPLevel | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // مستويات الـ VIP
  const vipLevels: VIPLevel[] = [
    {
      id: 1,
      name: "VIP 1",
      price: 100,
      color: "text-amber-400",
      borderColor: "border-amber-400",
      bgGradient: "from-amber-700/40 to-black",
      icon: "👑",
      benefits: [
        "خصم 5% على شراء الرقاقات",
        "رقاقات إضافية يومية: 5,000",
        "دعم أولوية"
      ],
      exclusive: "إطار VIP 1 حصري"
    },
    {
      id: 2,
      name: "VIP 2",
      price: 200,
      color: "text-purple-400",
      borderColor: "border-purple-400",
      bgGradient: "from-purple-700/40 to-black",
      icon: "💎",
      benefits: [
        "خصم 10% على شراء الرقاقات",
        "رقاقات إضافية يومية: 10,000",
        "دعم أولوية",
        "رموز تعبيرية خاصة في الدردشة"
      ],
      exclusive: "إطار VIP 2 حصري"
    },
    {
      id: 3,
      name: "VIP 3",
      price: 400,
      color: "text-blue-400",
      borderColor: "border-blue-400",
      bgGradient: "from-blue-700/40 to-black",
      icon: "🔷",
      benefits: [
        "خصم 15% على شراء الرقاقات",
        "رقاقات إضافية يومية: 25,000",
        "دعم أولوية متميز",
        "رموز تعبيرية خاصة في الدردشة",
        "طاولات VIP حصرية"
      ],
      exclusive: "إطار VIP 3 حصري"
    },
    {
      id: 4,
      name: "VIP 4",
      price: 800,
      color: "text-green-400",
      borderColor: "border-green-400",
      bgGradient: "from-green-700/40 to-black",
      icon: "🔱",
      benefits: [
        "خصم 20% على شراء الرقاقات",
        "رقاقات إضافية يومية: 50,000",
        "دعم أولوية فائق",
        "رموز تعبيرية خاصة في الدردشة",
        "طاولات VIP حصرية",
        "مكافآت أسبوعية خاصة"
      ],
      exclusive: "إطار VIP 4 حصري + أفاتار خاص"
    },
    {
      id: 5,
      name: "VIP 5",
      price: 1600,
      color: "text-red-400",
      borderColor: "border-red-400",
      bgGradient: "from-red-700/40 to-black",
      icon: "⚜️",
      benefits: [
        "خصم 25% على شراء الرقاقات",
        "رقاقات إضافية يومية: 100,000",
        "دعم أولوية VIP",
        "جميع الرموز التعبيرية الخاصة",
        "طاولات VIP حصرية",
        "مكافآت أسبوعية خاصة",
        "هدايا شهرية"
      ],
      exclusive: "إطار VIP 5 حصري + مجموعة أفاتارات"
    },
    {
      id: 6,
      name: "VIP 6",
      price: 3200,
      color: "text-pink-400",
      borderColor: "border-pink-400",
      bgGradient: "from-pink-700/40 to-black",
      icon: "🏆",
      benefits: [
        "خصم 30% على شراء الرقاقات",
        "رقاقات إضافية يومية: 250,000",
        "دعم VIP شخصي",
        "جميع الرموز التعبيرية الخاصة",
        "طاولات VIP 6 حصرية",
        "مكافآت أسبوعية خاصة",
        "هدايا شهرية",
        "تخصيص طاولة خاصة"
      ],
      exclusive: "طقم كامل VIP 6 (إطار + أفاتار + إكسسوارات)"
    },
    {
      id: 7,
      name: "VIP 7",
      price: 6400,
      color: "text-[#E5C04B]",
      borderColor: "border-[#E5C04B]",
      bgGradient: "from-[#6B4B0C]/40 to-black",
      icon: "👑💎",
      benefits: [
        "خصم 40% على شراء الرقاقات",
        "رقاقات إضافية يومية: 500,000",
        "دعم VIP شخصي ممتاز",
        "جميع المميزات الحصرية",
        "طاولات ELITE حصرية",
        "مكافآت أسبوعية مضاعفة",
        "هدايا شهرية فاخرة",
        "تخصيص طاولة وكروت خاصة"
      ],
      exclusive: "طقم ELITE كامل + تأثيرات خاصة في اللعبة"
    },
    {
      id: 8,
      name: "VIP 8",
      price: 12800,
      color: "text-[#E5E4E2]",
      borderColor: "border-[#E5E4E2]",
      bgGradient: "from-[#353535]/60 to-black",
      icon: "👑💎⚜️",
      benefits: [
        "خصم 50% على شراء الرقاقات",
        "رقاقات إضافية يومية: 1,000,000",
        "دعم العضو البلاتيني",
        "كل المميزات المتاحة",
        "طاولات PLATINUM حصرية",
        "مكافآت أسبوعية بلاتينية",
        "هدايا شهرية بلاتينية",
        "تخصيص كامل للطاولة والكروت",
        "عروض خاصة حصرية"
      ],
      exclusive: "طقم PLATINUM الكامل + تأثيرات خاصة + لقب PLATINUM"
    }
  ];

  // محاكاة عملية الشراء
  const handlePurchase = () => {
    if (!selectedVIP) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPurchaseDialog(false);
      
      toast({
        title: "تمت عملية الشراء بنجاح!",
        description: `تمت ترقية حسابك إلى ${selectedVIP.name} بنجاح.`,
        duration: 5000
      });
    }, 2000);
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
            <h1 className="text-2xl font-bold text-[#D4AF37]">VIP عضوية</h1>
            <Crown className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        
        {/* معلومات المستخدم والحالة */}
        <div className="bg-black/60 p-4 rounded-lg border border-[#D4AF37]/30 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1708] p-2 rounded-full border border-[#D4AF37]/30">
                <Crown className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm text-white/70">مستوى VIP الحالي</p>
                <p className="text-lg font-bold text-[#D4AF37]">غير مشترك</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1708] p-2 rounded-full border border-[#D4AF37]/30">
                <Zap className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm text-white/70">رصيدك الحالي</p>
                <p className="text-lg font-bold text-[#D4AF37]">{user?.chips?.toLocaleString() || 0} رقاقة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1708] p-2 rounded-full border border-[#D4AF37]/30">
                <Gift className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm text-white/70">مكافآت متاحة</p>
                <p className="text-lg font-bold text-red-400">0 مكافأة</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* مستويات الـ VIP */}
        <div className="bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20 mb-6">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">اختر مستوى VIP</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vipLevels.map((vip) => (
              <div 
                key={vip.id}
                className={`rounded-lg overflow-hidden border-2 ${vip.borderColor} hover:shadow-lg hover:shadow-${vip.borderColor}/30 transition-all duration-300 cursor-pointer transform hover:scale-105`}
                onClick={() => {
                  setSelectedVIP(vip);
                  setShowPurchaseDialog(true);
                }}
              >
                <div className={`bg-gradient-to-b ${vip.bgGradient} p-6 flex flex-col items-center`}>
                  <div className="mb-2 text-4xl">{vip.icon}</div>
                  <h3 className={`text-xl font-bold ${vip.color} mb-1`}>{vip.name}</h3>
                  <p className="text-white/60 text-sm mb-4 text-center">اشتراك لمدة شهر</p>
                  
                  <div className="bg-black/40 rounded-lg p-3 mb-4 text-center w-full">
                    <p className="text-xs text-white/70">السعر</p>
                    <p className={`text-2xl font-bold ${vip.color}`}>{vip.price} ج.م</p>
                  </div>
                  
                  <div className="space-y-2 mb-4 w-full">
                    {vip.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className={`h-4 w-4 ${vip.color} mr-1`} />
                        <span className="text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-black/40 p-3 rounded-lg w-full">
                    <p className="text-center text-xs text-white/70 mb-1">حصرياً</p>
                    <p className={`text-center font-bold ${vip.color} text-sm`}>{vip.exclusive}</p>
                  </div>
                </div>
                
                <div className="bg-black/60 p-3">
                  <Button className={`w-full ${vip.color.replace('text-', 'bg-').replace('400', '500')} hover:${vip.color.replace('text-', 'bg-').replace('400', '600')} text-black font-bold`}>
                    اشترك الآن
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* مميزات الـ VIP */}
        <div className="bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20 mb-6">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">مميزات عضوية VIP</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <Gift className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">مكافآت يومية</h3>
              <p className="text-sm text-white/70">احصل على رقاقات إضافية كل يوم تتناسب مع مستوى VIP الخاص بك</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">خصومات حصرية</h3>
              <p className="text-sm text-white/70">استمتع بخصومات خاصة على شراء الرقاقات تصل إلى 50%</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">محتوى حصري</h3>
              <p className="text-sm text-white/70">أطر وأفاتارات حصرية لكل مستوى VIP لتتميز عن باقي اللاعبين</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">دعم أولوية</h3>
              <p className="text-sm text-white/70">دعم فني خاص وأولوية في حل المشكلات</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <Star className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">طاولات VIP</h3>
              <p className="text-sm text-white/70">طاولات لعب خاصة لأعضاء VIP فقط مع ميزات حصرية</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mb-3 flex items-center justify-center">
                <Zap className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">عروض خاصة</h3>
              <p className="text-sm text-white/70">عروض حصرية ومكافآت خاصة لأعضاء VIP فقط</p>
            </div>
          </div>
        </div>
        
        {/* الأسئلة الشائعة */}
        <div className="bg-black/40 p-4 rounded-xl border border-[#D4AF37]/20">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">الأسئلة الشائعة</h2>
          
          <div className="space-y-4">
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">كيف يمكنني ترقية مستوى VIP الخاص بي؟</h3>
              <p className="text-sm text-white/70">يمكنك شراء أي مستوى VIP مباشرة من هذه الصفحة. مدة الاشتراك شهر واحد ويمكن تجديده تلقائياً.</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">هل يمكنني تغيير مستوى VIP الخاص بي؟</h3>
              <p className="text-sm text-white/70">نعم، يمكنك الترقية إلى مستوى أعلى في أي وقت. سيتم احتساب المبلغ المتبقي من اشتراكك الحالي.</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">متى أحصل على المكافآت اليومية؟</h3>
              <p className="text-sm text-white/70">يتم إضافة المكافآت اليومية تلقائياً لرصيدك عند تسجيل الدخول الأول كل يوم.</p>
            </div>
            
            <div className="bg-[#1a1708]/50 p-4 rounded-lg border border-[#D4AF37]/20">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-1">هل يمكنني إلغاء اشتراك VIP الخاص بي؟</h3>
              <p className="text-sm text-white/70">نعم، يمكنك إلغاء التجديد التلقائي لاشتراك VIP في أي وقت من صفحة الإعدادات. ستستمر في الاستمتاع بمميزات VIP حتى نهاية فترة الاشتراك الحالية.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* نافذة تأكيد الشراء */}
      {selectedVIP && (
        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
                تأكيد الاشتراك في {selectedVIP.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selectedVIP.bgGradient} flex items-center justify-center border-2 ${selectedVIP.borderColor}`}>
                  <span className="text-4xl">{selectedVIP.icon}</span>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">المستوى:</span>
                  <span className={`font-bold ${selectedVIP.color}`}>{selectedVIP.name}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/70">المدة:</span>
                  <span className="font-bold text-white">شهر واحد</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/70">السعر:</span>
                  <span className={`font-bold ${selectedVIP.color}`}>{selectedVIP.price} ج.م</span>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded-lg mb-4">
                <h4 className={`font-bold ${selectedVIP.color} mb-2`}>المميزات:</h4>
                <ul className="space-y-1">
                  {selectedVIP.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className={`h-4 w-4 ${selectedVIP.color} mr-1`} />
                      <span className="text-white/80">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="text-center text-sm text-white/70 mb-4">
                بالضغط على "تأكيد الشراء"، أنت توافق على شروط الاشتراك.
              </div>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button 
                variant="outline" 
                className="text-white/70 border-white/20"
                onClick={() => setShowPurchaseDialog(false)}
                disabled={isProcessing}
              >
                إلغاء
              </Button>
              
              <Button 
                className={`${selectedVIP.color.replace('text-', 'bg-').replace('400', '500')} hover:${selectedVIP.color.replace('text-', 'bg-').replace('400', '600')} text-black`}
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