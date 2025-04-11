import React from 'react';
import { X, Copy } from "lucide-react";
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
}

// مكون بطاقة اللاعب (مثل دومينو كافيه)
const DominoProfileCard: React.FC<{
  user: DominoUserProfile; 
  onClose: () => void;
}> = ({ user, onClose }) => {
  return (
    <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg overflow-hidden shadow-xl" dir="rtl">
      {/* شريط العنوان */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-3 text-center relative">
        <h2 className="text-amber-100 text-xl font-bold">بيانات اللاعب</h2>
        <button 
          className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-100 hover:text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* القسم الأيمن - البادجات والصورة */}
        <div className="md:w-1/3 p-4 flex flex-col items-center">
          {/* صورة اللاعب */}
          <div className="relative w-24 h-24 mb-2">
            <div className="absolute inset-0 rounded-full overflow-hidden bg-amber-800/20 border-2 border-amber-600 shadow-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-800">{user.username.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* معرف اللاعب */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center">
              <span className="text-amber-800 text-sm ml-1">ID:</span>
              <span className="text-sm text-amber-900">{user.id}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(user.id.toString());
                  alert('تم نسخ معرف المستخدم');
                }}
                className="text-amber-600 hover:text-amber-800 ml-1"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <div className="text-lg font-bold text-amber-800">{user.username}</div>
          </div>
          
          {/* البادجات (كالرتبة ووضع VIP) */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-2 flex flex-col items-center">
              <div className="text-center mb-1">RANK</div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMkw0IDhWMTZDNCAxOS43MzkgNi4xMDcxNSAyMy4xNzE1IDkuNjU2ODUgMjUuNjU2OUwxNiAzMEwyMi4zNDMxIDI1LjY1NjlDMjUuODkyOSAyMy4xNzE1IDI4IDE5LjczOSAyOCAxNlY4TDE2IDJaIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIxOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0ZGRkZGRiI+UjwvdGV4dD48L3N2Zz4=" alt="رتبة" width="32" height="32" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-2 flex flex-col items-center">
              <div className="text-center mb-1">VIP</div>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMkwzMCAyMkgyTDE2IDJaIiBmaWxsPSIjOEM3REZGIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjE2IiB5PSIxOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0ZGRkZGRiI+VklQPC90ZXh0PjwvdGV4dD48L3N2Zz4=" alt="VIP" width="32" height="32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* القسم الأيسر - البيانات والإحصائيات */}
        <div className="md:w-2/3 p-4">
          {/* الرصيد والعملات */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-2 text-center">
              <div className="text-amber-600 text-xs mb-1">الرقائق</div>
              <div className="text-amber-800 font-bold flex items-center justify-center">
                {user.chips.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNy41IiBmaWxsPSIjRkZEMTAwIiBzdHJva2U9IiNBMDgwMjkiLz48dGV4dCB4PSI4IiB5PSIxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI4IiBmaWxsPSIjQTg3OTFGIj4kPC90ZXh0PjwvY2lyY2xlPjwvc3ZnPg==" alt="عملة" className="ml-1 w-5 h-5" />
              </div>
            </div>
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-2 text-center">
              <div className="text-amber-600 text-xs mb-1">الفابي</div>
              <div className="text-amber-800 font-bold flex items-center justify-center">
                {user.fabChips.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iNy41IiBmaWxsPSIjMDBCMEZGIiBzdHJva2U9IiMwMDc3QjUiLz48dGV4dCB4PSI4IiB5PSIxMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSI4IiBmaWxsPSIjRkZGRkZGIj5GPC90ZXh0PjwvY2lyY2xlPjwvc3ZnPg==" alt="فابي" className="ml-1 w-5 h-5" />
              </div>
            </div>
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-2 text-center">
              <div className="text-amber-600 text-xs mb-1">الماس</div>
              <div className="text-amber-800 font-bold flex items-center justify-center">
                {user.diamonds.toLocaleString()}
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAxLjVMMTQuNSA4TDggMTQuNUwxLjUgOEw4IDEuNVoiIGZpbGw9IiM0M0M0RkYiIHN0cm9rZT0iIzAwN0RCNSIvPjwvc3ZnPg==" alt="ماس" className="ml-1 w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* إحصائيات اللاعب */}
          <div className="space-y-3">
            {/* دومينو شاميه 4 أعضاء 1 لاعب */}
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-3">
              <div className="text-center text-amber-900 text-sm font-bold border-b border-amber-300 pb-1 mb-2">دومينو شاميه 4 أعضاء 1 لاعب</div>
              <div className="flex justify-between items-center text-sm">
                <div className="text-amber-800">مجموع نقاط الفوز</div>
                <div className="text-amber-800">1</div>
                <div className="text-amber-800">عدد المنافسات</div>
                <div className="text-amber-800">0</div>
                <div className="text-amber-800">معدل الانتصارات</div>
                <div className="text-amber-800">0%</div>
              </div>
            </div>
            
            {/* دومينو شاميه 2 لاعب */}
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-3">
              <div className="text-center text-amber-900 text-sm font-bold border-b border-amber-300 pb-1 mb-2">دومينو شاميه 2 لاعب</div>
              <div className="flex justify-between items-center text-sm">
                <div className="text-amber-800">مجموع نقاط الفوز</div>
                <div className="text-amber-800">0</div>
                <div className="text-amber-800">عدد المنافسات</div>
                <div className="text-amber-800">0</div>
                <div className="text-amber-800">معدل الانتصارات</div>
                <div className="text-amber-800">0%</div>
              </div>
            </div>
            
            {/* دومينو اوركيشن 1 لاعب */}
            <div className="bg-amber-100 border border-amber-500 rounded-lg p-3">
              <div className="text-center text-amber-900 text-sm font-bold border-b border-amber-300 pb-1 mb-2">دومينو اوركيشن 1 لاعب</div>
              <div className="flex justify-between items-center text-sm">
                <div className="text-amber-800">مجموع نقاط الفوز</div>
                <div className="text-amber-800">0</div>
                <div className="text-amber-800">عدد المنافسات</div>
                <div className="text-amber-800">0</div>
                <div className="text-amber-800">معدل الانتصارات</div>
                <div className="text-amber-800">0%</div>
              </div>
            </div>
          </div>
          
          {/* الحالة الخاصة */}
          <div className="mt-3 bg-amber-100 border border-amber-500 rounded-lg p-2">
            <div className="flex justify-between items-center">
              <div className="text-amber-800 font-bold">الحالة الخاصة</div>
              <div className="text-amber-800">{user.title || "فلسطين حرة"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DominoProfileCard;