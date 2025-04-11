import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { BadgeType } from '@/components/profile/EgyptianProfile';
import DominoProfileCard from '@/components/profile/DominoProfileCard';

// صفحة الملف الشخصي المصري
const ProfilePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // استخدام بيانات مستخدم حسب نوع حساب المستخدم
  // توليد بيانات مناسبة لعرض الملف الشخصي والتعامل مع أنواع الاتصال المختلفة
  const getProfileData = () => {
    if (!user) {
      // حالة عدم وجود مستخدم نشط (عرض بيانات افتراضية)
      return {
        id: 1000,
        username: "زائر",
        chips: 5000,
        avatar: null,
        level: 1,
        experience: 0,
        rank: "مبتدئ",
        fabChips: 0,
        diamonds: 0,
        badges: [BadgeType.BASIC],
        title: "لاعب جديد",
        isGuest: true,
        authType: 'guest' as 'email' | 'facebook' | 'guest',
        userCode: '00000'
      };
    }
    
    // إعداد البيانات التي ستعرض في واجهة الملف الشخصي
    const displayData = {
      id: user.id,
      username: user.username,
      chips: user.chips || 0,
      diamonds: user.diamonds || 0,
      avatar: user.avatar || null,
      level: user.vipLevel || 1,
      experience: user.vipPoints || 0,
      rank: user.isGuest ? "زائر" : (user.role === 'vip' ? "VIP" : "لاعب"),
      fabChips: 0, // قيمة افتراضية حيث لا يوجد هذه الخاصية في النموذج الأصلي
      badges: [BadgeType.BASIC],
      title: "لاعب محترف",
      isGuest: user.isGuest || false,
      authType: user.authType as 'email' | 'facebook' | 'guest' || 'email',
      userCode: user.userCode || '00000'
    };
    
    return displayData;
  };
  
  const profileData = getProfileData();
  
  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-black w-full h-full flex items-center justify-center overflow-auto">
      <div className="w-full h-full flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <DominoProfileCard 
              user={profileData}
              onClose={() => navigate('/')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;