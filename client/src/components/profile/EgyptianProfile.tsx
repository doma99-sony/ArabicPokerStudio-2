import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { X, Copy, LogOut, Home } from "lucide-react";

// استخدام الصور من المجلد العام
// افتراض أن الصورة التي أنشأناها موجودة في المسار الصحيح
const egyptBorderSvg = "/images/egypt-border.svg";

// أنواع البادجات التي يمكن امتلاكها
export enum BadgeType {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  ROYAL = 'royal',
  AGENT = 'agent'
}

// واجهة بيانات المستخدم الممتدة
interface ExtendedUserProfile {
  id: number;
  username: string;
  chips: number;
  avatar?: string | null;
  level: number;
  experience: number;
  rank: string;
  fabChips: number;
  diamonds: number;
  badges: BadgeType[];
  title?: string;
  agentBadgeUnlocked: boolean;
  agentName?: string;
  fabChargeCount: number;
}

// الواجهة البرمجية للمكون
interface EgyptianProfileProps {
  user?: ExtendedUserProfile;
  editable?: boolean;
}

// مكون الملف الشخصي بالطابع المصري الفرعوني
const EgyptianProfile: React.FC<EgyptianProfileProps> = ({ 
  user, 
  editable = false 
}) => {
  // حالة فتح النوافذ وتعديل الملف الشخصي
  const [showAgentCodeDialog, setShowAgentCodeDialog] = useState(false);
  const [agentCode, setAgentCode] = useState('');
  const [showTitleEditDialog, setShowTitleEditDialog] = useState(false);
  const [newTitle, setNewTitle] = useState(user?.title || '');
  
  // استخدام مكونات النظام
  const { toast } = useToast();
  const { user: authUser, logoutMutation } = useAuth();
  
  // بيانات المستخدم الافتراضية
  const defaultUser: ExtendedUserProfile = {
    id: 0,
    username: "زائر",
    chips: 0,
    avatar: null,
    level: 1,
    experience: 0,
    rank: "مبتدئ",
    fabChips: 0,
    diamonds: 0,
    badges: [BadgeType.BASIC],
    agentBadgeUnlocked: false,
    fabChargeCount: 0
  };
  
  // المستخدم الحالي أو الافتراضي
  const currentUser = user || defaultUser;
  
  // حساب نسبة اكتمال المستوى
  const experiencePercentage = () => {
    const nextLevelExp = currentUser.level * 1000;
    const currentLevelExp = (currentUser.level - 1) * 1000;
    const userExp = currentUser.experience;
    const levelProgress = ((userExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(Math.max(levelProgress, 0), 100);
  };
  
  // التحقق من رمز الوكيل
  const verifyAgentCode = () => {
    // هذا مجرد مثال، يجب استبداله بمنطق حقيقي للتحقق
    if (agentCode === '56485645') {
      toast({
        title: "تم التحقق بنجاح!",
        description: "تم فتح شارة وكيل الشحن",
        variant: "default",
      });
      // هنا يجب إرسال طلب API لحفظ التغييرات
      setShowAgentCodeDialog(false);
    } else {
      toast({
        title: "رمز غير صحيح",
        description: "يرجى التحقق من رمز الوكيل والمحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  // تغيير لقب المستخدم
  const updateUserTitle = () => {
    if (newTitle.trim().length === 0) {
      toast({
        title: "لقب غير صالح",
        description: "يرجى إدخال لقب صالح",
        variant: "destructive",
      });
      return;
    }
    
    // هنا يجب إرسال طلب API لحفظ التغييرات
    toast({
      title: "تم تحديث اللقب",
      description: "تم تحديث لقب المستخدم بنجاح",
      variant: "default",
    });
    
    setShowTitleEditDialog(false);
  };
  
  // نسخ معرف المستخدم
  const copyUserId = () => {
    navigator.clipboard.writeText(currentUser.id.toString());
    toast({
      title: "تم النسخ",
      description: "تم نسخ رقم المعرف إلى الحافظة",
      variant: "default",
    });
  };
  
  // الحصول على اسم رتبة البادج
  const getBadgeRankName = (badge: BadgeType): string => {
    switch (badge) {
      case BadgeType.SILVER:
        return "فضي";
      case BadgeType.GOLD:
        return "ذهبي";
      case BadgeType.ROYAL:
        return "ملكي";
      default:
        return "أساسي";
    }
  };
  
  // الحصول على لون البادج
  const getBadgeColor = (badge: BadgeType): string => {
    switch (badge) {
      case BadgeType.SILVER:
        return "from-gray-300 to-gray-100";
      case BadgeType.GOLD:
        return "from-amber-500 to-yellow-300";
      case BadgeType.ROYAL:
        return "from-purple-700 to-purple-400";
      case BadgeType.AGENT:
        return "from-green-600 to-green-400";
      default:
        return "from-blue-600 to-blue-400";
    }
  };

  // تحديد أعلى بادج لدى المستخدم
  const getHighestBadge = (): BadgeType => {
    if (currentUser.badges.includes(BadgeType.ROYAL)) return BadgeType.ROYAL;
    if (currentUser.badges.includes(BadgeType.GOLD)) return BadgeType.GOLD;
    if (currentUser.badges.includes(BadgeType.SILVER)) return BadgeType.SILVER;
    return BadgeType.BASIC;
  };
  
  return (
    <div className="egyptian-profile-container w-full max-w-3xl mx-auto p-4 sm:p-6 rounded-lg relative overflow-hidden" dir="rtl">
      {/* خلفية بنمط مصري */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black to-purple-950 opacity-90 rounded-lg z-0"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0zMCA1IEw1NSA0NSBMNSBA0NSBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNhMTZiMjkiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')",
          backgroundSize: "60px 60px"
        }}
      />
      
      {/* إطار مزخرف */}
      <div className="absolute inset-0 z-0 rounded-lg border-4 border-amber-600/50"></div>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-800/0 via-amber-400 to-amber-800/0"></div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-800/0 via-amber-400 to-amber-800/0"></div>
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-800/0 via-amber-400 to-amber-800/0"></div>
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-amber-800/0 via-amber-400 to-amber-800/0"></div>
      
      {/* محتوى الملف الشخصي */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 text-amber-100">
        {/* القسم اليميني - الصورة والبادجات */}
        <div className="flex-shrink-0 flex flex-col items-center mx-auto sm:mx-0">
          {/* صورة المستخدم */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-amber-600 overflow-hidden bg-black/60">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-amber-800 to-amber-950">
                  <span className="text-3xl sm:text-4xl font-bold text-amber-300">
                    {currentUser.username.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* البادج على الصورة */}
            {getHighestBadge() !== BadgeType.BASIC && (
              <div className={`absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getBadgeColor(getHighestBadge())} border-2 border-white shadow-lg`}>
                <span className="text-white text-xs font-bold">
                  {getHighestBadge() === BadgeType.ROYAL ? '👑' : 
                   getHighestBadge() === BadgeType.GOLD ? '⭐' : '★'}
                </span>
              </div>
            )}
            
            {/* شارة وكيل الشحن */}
            <div className={`absolute -bottom-3 -left-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 border-white shadow-lg
                           ${currentUser.agentBadgeUnlocked ? 'bg-gradient-to-br from-green-600 to-green-400' : 'bg-gradient-to-br from-gray-700 to-gray-500'}`}>
              <span className="text-white text-xs">
                {currentUser.agentBadgeUnlocked ? '✓' : '🔒'}
              </span>
            </div>
          </div>
          
          {/* زر فتح شارة الوكيل إذا كانت قابلة للتعديل */}
          {editable && !currentUser.agentBadgeUnlocked && (
            <button 
              onClick={() => setShowAgentCodeDialog(true)}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 underline"
            >
              فتح شارة وكيل الشحن
            </button>
          )}
        </div>
        
        {/* القسم الأيسر - معلومات المستخدم */}
        <div className="flex-grow flex flex-col mt-4 sm:mt-0">
          {/* اسم المستخدم واللقب */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-300">{currentUser.username}</h2>
            {currentUser.title && (
              <span className="text-xs sm:text-sm inline-block px-2 py-1 bg-gradient-to-r from-amber-700 to-amber-800 rounded-md text-amber-200">
                {currentUser.title}
              </span>
            )}
            {editable && (
              <button 
                onClick={() => setShowTitleEditDialog(true)}
                className="text-amber-400 hover:text-amber-300"
                aria-label="تعديل اللقب"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* معرف المستخدم */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs sm:text-sm text-amber-200/80">الملف الشخصي رقم:</span>
            <span className="text-xs sm:text-sm text-amber-100">{currentUser.id}</span>
            <button 
              onClick={copyUserId}
              className="text-amber-400 hover:text-amber-300"
              aria-label="نسخ المعرف"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {/* المستوى */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs sm:text-sm text-amber-200/80">المستوى: {currentUser.level}</span>
              <span className="text-xs text-amber-100/70">{currentUser.experience} / {currentUser.level * 1000}</span>
            </div>
            <div className="w-full h-2 bg-amber-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                style={{ width: `${experiencePercentage()}%` }}
              ></div>
            </div>
          </div>
          
          {/* الرتبة والشارة المدفوعة */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs sm:text-sm text-amber-200/80">الرتبة:</span>
            <span className={`inline-block px-2 py-1 rounded-md text-white text-xs font-medium bg-gradient-to-r ${getBadgeColor(BadgeType.BASIC)}`}>
              {currentUser.rank}
            </span>
            
            {/* الشارة المدفوعة */}
            {currentUser.badges.some(b => b !== BadgeType.BASIC) && (
              <span className={`inline-block px-2 py-1 rounded-md text-white text-xs font-medium bg-gradient-to-r ${getBadgeColor(getHighestBadge())}`}>
                شاحن فابي {getBadgeRankName(getHighestBadge())}
              </span>
            )}
          </div>
          
          {/* معلومات العملات والرصيد */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 bg-black/30 rounded-md text-center">
              <div className="text-xs text-amber-200/80 mb-1">رقائق</div>
              <div className="text-xs sm:text-sm text-amber-100 font-medium">{currentUser.chips.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-black/30 rounded-md text-center">
              <div className="text-xs text-amber-200/80 mb-1">فابي</div>
              <div className="text-xs sm:text-sm text-amber-100 font-medium">{currentUser.fabChips.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-black/30 rounded-md text-center">
              <div className="text-xs text-amber-200/80 mb-1">ماس</div>
              <div className="text-xs sm:text-sm text-amber-100 font-medium">{currentUser.diamonds.toLocaleString()}</div>
            </div>
          </div>
          
          {/* معلومات إضافية */}
          <div className="text-xs sm:text-sm mb-3">
            <div className="text-amber-100/70">
              <span className="text-amber-300">✅</span> عدد مرات شحن الفابي: {currentUser.fabChargeCount}
            </div>
            
            {currentUser.agentBadgeUnlocked && currentUser.agentName && (
              <div className="text-amber-100/70 mt-1">
                <span className="text-amber-300">🛡️</span> وكيلك: {currentUser.agentName}
              </div>
            )}
          </div>
          
          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-auto">
            {editable && (
              <Button 
                variant="outline" 
                className="bg-amber-800/60 hover:bg-amber-700/80 border-amber-700 text-amber-100 text-xs sm:text-sm w-full sm:w-auto"
                size="sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 019.07 4h5.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                تغيير الصورة
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="bg-amber-800/60 hover:bg-amber-700/80 border-amber-700 text-amber-100 text-xs sm:text-sm w-full sm:w-auto"
              size="sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              عرض الإحصائيات
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-red-800/60 hover:bg-red-700/80 border-red-700 text-amber-100 text-xs sm:text-sm w-full sm:w-auto"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {logoutMutation.isPending ? "جاري الخروج..." : "تسجيل الخروج"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* مؤثرات زخرفية */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
          <path d="M50,10 L90,45 L50,90 L10,45 Z" fill="currentColor" />
          <circle cx="50" cy="50" r="15" fill="#170a29" />
          <circle cx="50" cy="50" r="10" fill="currentColor" />
        </svg>
      </div>
      
      {/* عناصر الزاوية الزخرفية */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-600/70 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-600/70 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-600/70 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-600/70 rounded-br-lg"></div>
      
      {/* نافذة حوار إدخال رمز الوكيل */}
      <Dialog open={showAgentCodeDialog} onOpenChange={setShowAgentCodeDialog}>
        <DialogContent dir="rtl" className="bg-gradient-to-b from-purple-950 to-black border-amber-600 w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-300 text-center text-lg sm:text-xl">إدخال رمز وكيل الشحن</DialogTitle>
          </DialogHeader>
          <div className="p-3 sm:p-4">
            <p className="text-amber-200 text-sm mb-4 text-center">
              أدخل رمز وكيل الشحن الخاص بك لفتح الشارة
            </p>
            <Input
              type="text"
              placeholder="أدخل الرمز هنا"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="mb-4 bg-black/50 border-amber-700 text-amber-100 text-right"
              dir="rtl"
            />
            <div className="flex justify-center">
              <Button
                onClick={verifyAgentCode}
                className="bg-amber-700 hover:bg-amber-600 text-white w-full sm:w-auto"
              >
                تحقق من الرمز
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* نافذة حوار تغيير اللقب */}
      <Dialog open={showTitleEditDialog} onOpenChange={setShowTitleEditDialog}>
        <DialogContent dir="rtl" className="bg-gradient-to-b from-purple-950 to-black border-amber-600 w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-amber-300 text-center text-lg sm:text-xl">تعديل اللقب</DialogTitle>
          </DialogHeader>
          <div className="p-3 sm:p-4">
            <Input
              type="text"
              placeholder="أدخل اللقب الجديد"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mb-4 bg-black/50 border-amber-700 text-amber-100 text-right"
              dir="rtl"
            />
            <div className="flex justify-center">
              <Button
                onClick={updateUserTitle}
                className="bg-amber-700 hover:bg-amber-600 text-white w-full sm:w-auto"
              >
                حفظ اللقب
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EgyptianProfile;