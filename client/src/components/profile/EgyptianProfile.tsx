import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
  const { user: authUser } = useAuth();
  
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
      {/* خلفية وعنوان */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-800 to-amber-700/90 rounded-lg z-0">
        <div className="w-full h-full" style={{ 
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0zMCA1IEw1NSA0NSBMNSBA0NSBaIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmQ3MDMiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIvPgo8L3N2Zz4=')",
          backgroundSize: "80px 80px",
          opacity: 0.2
        }}></div>
      </div>
      
      {/* شريط العنوان */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-amber-700/80 via-amber-600/90 to-amber-700/80 z-10 rounded-t-lg flex items-center justify-center">
        <h2 className="text-amber-100 font-bold text-lg">بيانات اللاعب</h2>
        {editable && (
          <button className="absolute left-2 text-amber-100 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* محتوى الملف الشخصي */}
      <div className="relative z-10 flex flex-col pt-14 pb-3 px-4 bg-gradient-to-b from-amber-50/90 to-amber-100/90 rounded-lg rounded-t-none shadow-inner">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* القسم الأيمن - البادجات والصورة */}
          <div className="flex flex-col items-center gap-3">
            {/* البادجات - قسم العلوي */}
            <div className="flex gap-4 justify-center">
              {/* بادج الرانك */}
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br border-2 border-amber-300 shadow-md overflow-hidden ${getBadgeColor(BadgeType.BASIC)}`}>
                  {getHighestBadge() === BadgeType.ROYAL ? (
                    <div className="text-center">
                      <div className="text-amber-100 text-xl">👑</div>
                      <div className="text-amber-100 text-xs mt-1">ملكي</div>
                    </div>
                  ) : getHighestBadge() === BadgeType.GOLD ? (
                    <div className="text-center">
                      <div className="text-amber-100 text-xl">⭐</div>
                      <div className="text-amber-100 text-xs mt-1">ذهبي</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-amber-100 text-xl">★</div>
                      <div className="text-amber-100 text-xs mt-1">أساسي</div>
                    </div>
                  )}
                </div>
                <div className="text-amber-700 text-xs mt-1 text-center font-bold">RANK</div>
              </div>
              
              {/* بادج وكيل الشحن / تاجر العملات */}
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br border-2 shadow-md ${currentUser.agentBadgeUnlocked ? 'from-blue-600 to-cyan-500 border-blue-300' : 'from-gray-500 to-gray-600 border-gray-400'}`}>
                  {currentUser.agentBadgeUnlocked ? (
                    <div className="text-center">
                      <div className="text-white text-xl">💎</div>
                      <div className="text-white text-xs mt-1">وكيل</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-200 text-xl">🔒</div>
                      <div className="text-gray-200 text-xs mt-1">مقفل</div>
                    </div>
                  )}
                </div>
                <div className="text-amber-700 text-xs mt-1 text-center font-bold">VIP</div>
              </div>
            </div>
            
            {/* صورة المستخدم */}
            <div className="relative mt-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-600 overflow-hidden bg-amber-800/40 mt-2">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-amber-100">
                      {currentUser.username.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* زر تعديل */}
              {editable && (
                <button className="absolute bottom-0 left-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white border-2 border-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 019.07 4h5.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* القسم الأيسر - معلومات المستخدم */}
          <div className="flex-grow flex flex-col mt-3 sm:mt-0">
            {/* معلومات المستخدم العلوية */}
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <path d="M10 9h4v6h-4"/>
                </svg>
                  <span className="text-sm text-amber-900 ml-1">{currentUser.id}</span>
                  <button 
                    onClick={copyUserId}
                    className="text-amber-600 hover:text-amber-800"
                    aria-label="نسخ المعرف"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs">
                    ✓
                  </div>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-amber-900 font-bold text-base mb-2">
                {currentUser.username}
                {editable && (
                  <button 
                    onClick={() => setShowTitleEditDialog(true)}
                    className="text-amber-600 hover:text-amber-800 mr-2"
                    aria-label="تعديل الاسم"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-800/80 text-xs">الحالة الخاصة: </span>
                <span className="text-amber-800 text-xs">{currentUser.title || 'فليكسي برو'}</span>
              </div>
            </div>
            
            {/* معلومات العملات والرصيد */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"/>
                  <path d="M12 6v12"/>
                  <path d="M6 12h12"/>
                </svg>
                <span className="text-amber-800 text-sm font-bold">{currentUser.chips.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 8h20L12 22 2 8Z"/>
                  <path d="M12 2l-3 6 3 14 3-14-3-6Z"/>
                </svg>
                <span className="text-blue-600 text-sm font-bold">{currentUser.diamonds.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M8 7v10"/>
                  <path d="M16 7v10"/>
                </svg>
                <span className="text-green-600 text-sm font-bold">{currentUser.fabChips.toLocaleString()}</span>
              </div>
            </div>
            
            {/* إحصائيات اللاعب */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-2 mb-3 text-xs">
              <div className="grid grid-cols-3 text-center py-1 border-b border-amber-100">
                <div className="text-amber-800">مجموع نقاط الفوز</div>
                <div className="text-amber-800">عدد المنافسات</div>
                <div className="text-amber-800">معدل الانتصارات</div>
              </div>
              <div className="grid grid-cols-3 text-center py-1">
                <div className="text-amber-700 font-medium">0</div>
                <div className="text-amber-700 font-medium">1</div>
                <div className="text-amber-700 font-medium">0%</div>
              </div>
            </div>
            
            {/* إحصائيات اللاعب 2 */}
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-2 mb-3 text-xs">
              <div className="grid grid-cols-3 text-center py-1 border-b border-amber-100">
                <div className="text-amber-800">مجموع نقاط الفوز</div>
                <div className="text-amber-800">عدد المنافسات</div>
                <div className="text-amber-800">معدل الانتصارات</div>
              </div>
              <div className="grid grid-cols-3 text-center py-1">
                <div className="text-amber-700 font-medium">0</div>
                <div className="text-amber-700 font-medium">0</div>
                <div className="text-amber-700 font-medium">0%</div>
              </div>
            </div>
            
            {/* معلومات إضافية */}
            {currentUser.agentBadgeUnlocked && currentUser.agentName && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 mb-2 text-xs">
                <div className="text-blue-800 flex items-center">
                  <span className="ml-1">💎</span>
                  وكيلك: {currentUser.agentName}
                </div>
              </div>
            )}
            
            {/* المستوى */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-amber-800">المستوى: {currentUser.level}</span>
                <span className="text-xs text-amber-700">{currentUser.experience} / {currentUser.level * 1000}</span>
              </div>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                  style={{ width: `${experiencePercentage()}%` }}
                ></div>
              </div>
            </div>
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
        <DialogContent dir="rtl" className="bg-gradient-to-b from-amber-50 to-amber-100 border-amber-400 w-[90vw] max-w-md mx-auto">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-amber-700/80 via-amber-600/90 to-amber-700/80 rounded-t-lg flex items-center justify-center">
            <DialogTitle className="text-amber-100 font-bold text-lg">إدخال رمز وكيل الشحن</DialogTitle>
            <button className="absolute left-2 text-amber-100 hover:text-white" onClick={() => setShowAgentCodeDialog(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="pt-16 p-4">
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-4">
              <p className="text-amber-800 text-sm mb-4 text-center">
                أدخل رمز وكيل الشحن الخاص بك لفتح البادج وتصبح وكيلاً معتمداً
              </p>
              <Input
                type="text"
                placeholder="أدخل الرمز هنا"
                value={agentCode}
                onChange={(e) => setAgentCode(e.target.value)}
                className="mb-4 bg-white border-amber-300 text-amber-900 text-right"
                dir="rtl"
              />
              <div className="flex justify-center">
                <Button
                  onClick={verifyAgentCode}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-full sm:w-auto"
                >
                  تحقق من الرمز
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* نافذة حوار تغيير اللقب */}
      <Dialog open={showTitleEditDialog} onOpenChange={setShowTitleEditDialog}>
        <DialogContent dir="rtl" className="bg-gradient-to-b from-amber-50 to-amber-100 border-amber-400 w-[90vw] max-w-md mx-auto">
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-amber-700/80 via-amber-600/90 to-amber-700/80 rounded-t-lg flex items-center justify-center">
            <DialogTitle className="text-amber-100 font-bold text-lg">تعديل الحالة الخاصة</DialogTitle>
            <button className="absolute left-2 text-amber-100 hover:text-white" onClick={() => setShowTitleEditDialog(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="pt-16 p-4">
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-4">
              <p className="text-amber-800 text-sm mb-4 text-center">
                أدخل الحالة الخاصة التي تريد إظهارها بجوار اسمك
              </p>
              <Input
                type="text"
                placeholder="أدخل الحالة الخاصة"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mb-4 bg-white border-amber-300 text-amber-900 text-right"
                dir="rtl"
              />
              <div className="flex justify-center">
                <Button
                  onClick={updateUserTitle}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-full sm:w-auto"
                >
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EgyptianProfile;