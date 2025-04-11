import React, { useState } from 'react';
import { X, Copy, Home, Coins, PenSquare, Camera, Save, XCircle } from "lucide-react";
import { BadgeType } from './EgyptianProfile';

// واجهة بيانات المستخدم الممتدة
interface DominoUserProfile {
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
  agentBadgeUnlocked?: boolean;
  agentName?: string;
  fabChargeCount?: number;
  isGuest?: boolean;  // إضافة خاصية لتحديد ما إذا كان المستخدم ضيفاً
  authType?: 'facebook' | 'guest' | 'email'; // نوع التسجيل
  userCode?: string; // رمز المستخدم المختصر المكون من 5 أرقام
}

// مكون بطاقة اللاعب (مثل دومينو كافيه)
const DominoProfileCard: React.FC<{
  user: DominoUserProfile; 
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  // توليد اسم المستخدم بناءً على نوع التسجيل
  const displayName = user.isGuest 
    ? `ضيف_${user.userCode || user.id}`
    : (user.authType === 'facebook' 
        ? `${user.username} ⓕ` // إضافة رمز فيسبوك للتمييز
        : (user.authType === 'email' 
            ? user.username  // اسم مستخدم عادي للتسجيل بالبريد
            : user.username));

  // حفظ الاسم الجديد
  const saveNewUsername = () => {
    // هنا يمكن إضافة رمز إرسال البيانات إلى الخادم
    alert(`تم تغيير الاسم إلى: ${newUsername}`);
    setEditingUsername(false);
    // في الوضع الحقيقي، سنحتاج لتحديث قيمة user.username
  };

  // تحميل صورة جديدة
  const handleAvatarUpload = () => {
    // هنا يمكن فتح مربع حوار لتحميل الصورة
    alert('مربع حوار تحميل الصورة سيظهر هنا');
    setShowAvatarOptions(false);
  };

  // اختيار أفاتار افتراضي
  const selectDefaultAvatar = (index: number) => {
    alert(`تم اختيار الأفاتار رقم: ${index}`);
    setShowAvatarOptions(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-2xl border-2 border-amber-500" dir="rtl">
      {/* شريط العنوان */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-center relative">
        <h2 className="text-amber-100 text-2xl font-bold">بطاقة اللاعب</h2>
        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-100 hover:text-white flex items-center"
          onClick={onClose}
        >
          <Home className="h-6 w-6 ml-2" />
          <span className="text-sm">العودة للوبي</span>
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* القسم الأيمن - الصورة والمعلومات الشخصية */}
        <div className="lg:w-1/3 p-6 flex flex-col items-center border-l border-amber-300/50">
          {/* صورة اللاعب */}
          <div className="relative w-36 h-36 mb-6">
            <div className="absolute inset-0 rounded-full overflow-hidden bg-amber-800/20 border-3 border-amber-600 shadow-xl">
              {user.avatar ? (
                <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-amber-700/50 to-amber-900/50">
                  <span className="text-6xl font-bold text-amber-200">{displayName.charAt(0)}</span>
                </div>
              )}
            </div>
            {/* زر تغيير الصورة */}
            <button 
              onClick={() => setShowAvatarOptions(!showAvatarOptions)} 
              className="absolute -left-2 bottom-5 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 shadow-lg"
              title="تغيير الصورة"
            >
              <Camera className="h-5 w-5" />
            </button>
            {showAvatarOptions && (
              <div className="absolute -left-40 -bottom-2 bg-amber-50 border border-amber-300 rounded-lg p-3 shadow-lg z-10 w-36">
                <div className="text-amber-800 font-bold text-sm mb-2">اختر صورة</div>
                <button 
                  onClick={handleAvatarUpload} 
                  className="w-full mb-2 text-sm bg-amber-500 text-white p-1 rounded hover:bg-amber-600 flex items-center justify-center"
                >
                  <Camera className="h-4 w-4 ml-1" />
                  تحميل صورة
                </button>
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div 
                      key={i} 
                      onClick={() => selectDefaultAvatar(i)}
                      className="w-8 h-8 bg-amber-200 rounded-full cursor-pointer hover:bg-amber-300 flex items-center justify-center text-amber-800"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowAvatarOptions(false)} 
                  className="w-full mt-1 text-xs text-amber-700 p-1 rounded hover:bg-amber-200 flex items-center justify-center"
                >
                  <XCircle className="h-3 w-3 ml-1" />
                  إلغاء
                </button>
              </div>
            )}
            {/* شارة مستوى اللاعب */}
            <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white text-sm rounded-full w-10 h-10 flex items-center justify-center border-2 border-amber-200 shadow-lg">
              {user.level}
            </div>
          </div>
          
          {/* معرف اللاعب */}
          <div className="text-center mb-6 bg-amber-50 p-3 rounded-lg border border-amber-300 w-full shadow-sm">
            {/* رمز المستخدم (ID) */}
            <div className="flex items-center justify-center mb-2">
              <span className="text-amber-800 text-base ml-2">رقم العضوية:</span>
              <span className="text-base text-amber-900">{user.userCode || '53639'}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.userCode?.toString() || '53639');
                  alert('تم نسخ رقم العضوية');
                }}
                className="text-amber-600 hover:text-amber-800 ml-2"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            
            {/* تحرير اسم المستخدم */}
            <div className="relative">
              {editingUsername ? (
                <div className="flex items-center justify-center">
                  <input 
                    type="text" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="border border-amber-300 rounded py-1 px-2 text-lg text-amber-900 text-center w-full"
                    autoFocus
                  />
                  <div className="absolute left-0 flex">
                    <button 
                      onClick={saveNewUsername} 
                      className="bg-green-500 text-white p-1 rounded-full mr-1 hover:bg-green-600"
                      title="حفظ"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingUsername(false);
                        setNewUsername(user.username);
                      }} 
                      className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      title="إلغاء"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-xl font-bold text-amber-800">{displayName}</div>
                  <button 
                    onClick={() => setEditingUsername(true)} 
                    className="absolute -left-4 top-1 text-amber-600 hover:text-amber-800"
                    title="تعديل الاسم"
                  >
                    <PenSquare className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            
            {/* نوع الحساب */}
            <div className="mt-1 text-xs text-amber-700">
              {user.isGuest ? 'حساب زائر' : user.authType === 'facebook' ? 'متصل عبر فيسبوك' : user.authType === 'email' ? 'حساب مسجل بالبريد الإلكتروني' : 'حساب عادي'}
            </div>
          </div>
          
          {/* الرصيد والعملات */}
          <div className="grid grid-cols-1 gap-4 w-full mb-6">
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 text-center shadow-md">
              <div className="text-amber-800 text-sm mb-2 font-medium">الرقائق</div>
              <div className="text-amber-900 font-bold flex items-center justify-center text-xl">
                {user.chips.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNy41IiBmaWxsPSIjRkZEMTAwIiBzdHJva2U9IiNBMDgwMjkiLz48dGV4dCB4PSI4IiB5PSIxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI4IiBmaWxsPSIjQTg3OTFGIj4kPC90ZXh0PjwvY2lyY2xlPjwvc3ZnPg==" alt="عملة" className="ml-2 w-6 h-6" />
              </div>
            </div>
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 text-center shadow-md">
              <div className="text-amber-800 text-sm mb-2 font-medium">الفابي</div>
              <div className="text-amber-900 font-bold flex items-center justify-center text-xl">
                {user.fabChips.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNy41IiBmaWxsPSIjMDBCMEZGIiBzdHJva2U9IiMwMDc3QjUiLz48dGV4dCB4PSI4IiB5PSIxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI4IiBmaWxsPSIjRkZGRkZGIj5GPC90ZXh0PjwvY2lyY2xlPjwvc3ZnPg==" alt="فابي" className="ml-2 w-6 h-6" />
              </div>
            </div>
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 text-center shadow-md">
              <div className="text-amber-800 text-sm mb-2 font-medium">الماس</div>
              <div className="text-amber-900 font-bold flex items-center justify-center text-xl">
                {user.diamonds.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAxLjVMMTQuNSA4TDggMTQuNUwxLjUgOEw4IDEuNVoiIGZpbGw9IiM0M0M0RkYiIHN0cm9rZT0iIzAwN0RCNSIvPjwvc3ZnPg==" alt="ماس" className="ml-2 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
        
        {/* القسم الأيسر - البيانات والإحصائيات */}
        <div className="lg:w-2/3 p-6">
          {/* البادجات والرتب */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="text-center mb-2 text-amber-800 text-sm">الرتبة</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMkw0IDhWMTZDNCAxOS43MzkgNi4xMDcxNSAyMy4xNzE1IDkuNjU2ODUgMjUuNjU2OUwxNiAzMEwyMi4zNDMxIDI1LjY1NjlDMjUuODkyOSAyMy4xNzE1IDI4IDE5LjczOSAyOCAxNlY4TDE2IDJaIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIxOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0ZGRkZGRiI+UjwvdGV4dD48L3N2Zz4=" alt="رتبة" width="38" height="38" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">{user.rank}</div>
            </div>
            
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="text-center mb-2 text-amber-800 text-sm">الحالة</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMkwzMCAyMkgyTDE2IDJaIiBmaWxsPSIjOEM3REZGIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIxOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0ZGRkZGRiI+VklQPC90ZXh0PjwvdGV4dD48L3N2Zz4=" alt="VIP" width="38" height="38" />
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">نشط</div>
            </div>
            
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="text-center mb-2 text-amber-800 text-sm">لاعب رقم</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#9C27B0" stroke="#FFFFFF" strokeWidth="2"/>
                      <text x="20" y="25" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="16" fill="#FFFFFF">{user.id || 2}</text>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">لاعب مبكر</div>
            </div>
            
            {/* صف جديد من البادجات */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-500 rounded-lg p-3 flex flex-col items-center shadow-xl">
              <div className="text-center mb-2 text-amber-800 text-sm font-medium">تاجر العملات</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center p-1">
                    <svg width="50" height="50" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.5 4C12.835 4 5 11.835 5 21.5C5 31.165 12.835 39 22.5 39C32.165 39 40 31.165 40 21.5C40 11.835 32.165 4 22.5 4Z" fill="#FFD700" stroke="#8B4513" strokeWidth="1.5"/>
                      <path d="M22.5 14L26 18H19L22.5 14Z" fill="#FFFFFF"/>
                      <path d="M22.5 8L26 12H19L22.5 8Z" fill="#FFFFFF"/>
                      <path d="M22.5 20L26 24H19L22.5 20Z" fill="#FFFFFF"/>
                      <path d="M28 22C28 24.7614 25.7614 27 23 27C20.2386 27 18 24.7614 18 22" stroke="#8B4513" strokeWidth="1.5"/>
                      <path d="M12 21H15V28H12V21Z" fill="#8B4513"/>
                      <path d="M10 29H17L15 33H12L10 29Z" fill="#8B4513"/>
                      <path d="M12 15C12 14.4477 12.4477 14 13 14H15C15.5523 14 16 14.4477 16 15V21H12V15Z" fill="#8B4513"/>
                      <path d="M31 20H33C33.5523 20 34 20.4477 34 21V28C34 28.5523 33.5523 29 33 29H31C30.4477 29 30 28.5523 30 28V21C30 20.4477 30.4477 20 31 20Z" fill="#8B4513"/>
                      <path d="M29 17L33 13L36 17H29Z" fill="#FFFFFF"/>
                      <path d="M31 13C31 12.4477 31.4477 12 32 12H34C34.5523 12 35 12.4477 35 13V17H31V13Z" fill="#8B4513"/>
                      <circle cx="22.5" cy="21.5" r="7.5" fill="#FFC700" stroke="#8B4513"/>
                      <path d="M22.5 25V18" stroke="#8B4513" strokeWidth="1.5"/>
                      <path d="M19 21.5H26" stroke="#8B4513" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">لاعب مميز</div>
            </div>

            {/* بادج التاج الملكي */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="text-center mb-2 text-amber-800 text-sm">التاج الملكي</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                    <svg width="45" height="45" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 10L30 20L40 15L35 30H15L10 15L20 20L25 10Z" fill="#FFD700" stroke="#8B4513" strokeWidth="2"/>
                      <path d="M15 33H35V36C35 37.1046 34.1046 38 33 38H17C15.8954 38 15 37.1046 15 36V33Z" fill="#FFD700" stroke="#8B4513" strokeWidth="2"/>
                      <circle cx="10" cy="15" r="3" fill="#FF0000" stroke="#8B4513"/>
                      <circle cx="25" cy="10" r="3" fill="#00FF00" stroke="#8B4513"/>
                      <circle cx="40" cy="15" r="3" fill="#0000FF" stroke="#8B4513"/>
                      <path d="M20 24L23 27H27L30 24" stroke="#8B4513" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">لاعب ملكي</div>
            </div>

            {/* بادج الأجنحة */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-3 flex flex-col items-center shadow-sm">
              <div className="text-center mb-2 text-amber-800 text-sm">أجنحة</div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg width="45" height="45" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 15C20 15 10 10 5 25C15 20 20 20 25 25C30 20 35 20 45 25C40 10 30 15 25 15Z" fill="white" stroke="#4F46E5" strokeWidth="1.5"/>
                      <path d="M25 25C20 25 10 30 5 40C15 35 20 30 25 32C30 30 35 35 45 40C40 30 30 25 25 25Z" fill="white" stroke="#4F46E5" strokeWidth="1.5"/>
                      <circle cx="25" cy="25" r="5" fill="#FFD700" stroke="#8B4513"/>
                      <path d="M25 21V29" stroke="#8B4513" strokeWidth="1.5"/>
                      <path d="M21 25H29" stroke="#8B4513" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 text-amber-900 text-sm font-bold">ملاك اللعبة</div>
            </div>
          </div>
          
          {/* المستوى والخبرة */}
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 shadow-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-amber-800 font-bold">المستوى: {user.level}</span>
              <span className="text-amber-700 font-medium text-sm">{user.experience} / {user.level * 1000} XP</span>
            </div>
            <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400" 
                style={{ width: `${Math.min(user.experience / (user.level * 1000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* إحصائيات اللاعب */}
          <div className="space-y-4 mb-6">
            {/* دومينو شاميه 4 أعضاء 1 لاعب */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 shadow-md">
              <div className="text-center text-amber-900 text-base font-bold border-b border-amber-300 pb-2 mb-3">دومينو شاميه 4 أعضاء 1 لاعب</div>
              <div className="grid grid-cols-3 gap-4 text-base">
                <div className="text-center">
                  <div className="text-amber-800 mb-1">مجموع نقاط الفوز</div>
                  <div className="text-amber-900 font-bold text-xl">1</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-800 mb-1">عدد المنافسات</div>
                  <div className="text-amber-900 font-bold text-xl">0</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-800 mb-1">معدل الانتصارات</div>
                  <div className="text-amber-900 font-bold text-xl">0%</div>
                </div>
              </div>
            </div>
            
            {/* دومينو شاميه 2 لاعب */}
            <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-400 rounded-lg p-4 shadow-md">
              <div className="text-center text-amber-900 text-base font-bold border-b border-amber-300 pb-2 mb-3">دومينو شاميه 2 لاعب</div>
              <div className="grid grid-cols-3 gap-4 text-base">
                <div className="text-center">
                  <div className="text-amber-800 mb-1">مجموع نقاط الفوز</div>
                  <div className="text-amber-900 font-bold text-xl">0</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-800 mb-1">عدد المنافسات</div>
                  <div className="text-amber-900 font-bold text-xl">0</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-800 mb-1">معدل الانتصارات</div>
                  <div className="text-amber-900 font-bold text-xl">0%</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* الحالة الخاصة */}
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-400 rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="text-amber-800 font-bold text-lg">الحالة الخاصة</div>
              <div className="text-amber-900 font-bold text-lg">{user.title || "فلسطين حرة"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DominoProfileCard;