import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { BadgeType } from '@/components/profile/EgyptianProfile';
import DominoProfileCard from '@/components/profile/DominoProfileCard';

// واجهة البيانات المحدثة
interface UpdatedProfileData {
  username?: string;
  avatar?: string;
  chips?: number;
  diamonds?: number;
}

// صفحة الملف الشخصي المصري
const ProfilePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, updateUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
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
  
  // معالجة تحديثات الملف الشخصي
  const handleProfileUpdate = async (updatedData: UpdatedProfileData) => {
    if (!profileData) return;
    
    // تحديث البيانات محليًا أولاً للاستجابة السريعة
    const updatedProfileData = {
      ...profileData,
      ...updatedData
    };
    
    setProfileData(updatedProfileData);
    
    // استخدام دالة updateUserData من سياق المصادقة لتحديث البيانات عبر الـ API
    // هذه الدالة ستقوم بالتحديث المحلي والاتصال بالسيرفر واستلام النتائج وتحديث كاش البيانات
    if (updateUserData) {
      try {
        const result = await updateUserData(updatedData);
        if (result) {
          // تحديث البيانات المحلية بالقيم النهائية من السيرفر
          setProfileData(prev => ({
            ...prev,
            ...result,
            // نحتفظ ببعض الخصائص المضافة محلياً
            badges: prev.badges,
            fabChips: prev.fabChips,
            rank: prev.rank,
            title: prev.title
          }));
        }
      } catch (error) {
        console.error('حدث خطأ أثناء تحديث بيانات المستخدم:', error);
      }
    }
  };
  
  // تحديث البيانات عند تغير المستخدم
  useEffect(() => {
    if (user) {
      setProfileData(getProfileData());
    }
  }, [user]);
  
  // استخدام WebSocket لتحديث البيانات عند تلقي التحديثات الفورية
  useEffect(() => {
    if (!user) return;
    
    try {
      // إعداد مستمع لتحديثات WebSocket
      const ws = new WebSocket(`wss://${window.location.host}/ws`);
      
      ws.onopen = () => {
        console.log('تم فتح اتصال WebSocket لتحديثات الملف الشخصي');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // إذا كان التحديث متعلق بتحديث الملف الشخصي للمستخدم الحالي
          if (data.type === 'profile_update' && data.user_id === user.id) {
            // تحديث البيانات في الواجهة
            setProfileData(prev => ({
              ...prev,
              ...data.data
            }));
          }
          
          // وإذا كان هناك تحديث للرصيد من اللعبة
          if (data.type === 'user_update' && data.updateType === 'chips_update' && data.user?.id === user.id) {
            setProfileData(prev => ({
              ...prev,
              chips: data.user.chips
            }));
          }
        } catch (error) {
          console.error('خطأ في معالجة رسالة WebSocket:', error);
        }
      };
      
      return () => {
        ws.close();
      };
    } catch (wsError) {
      console.error('خطأ في إنشاء اتصال WebSocket:', wsError);
    }
  }, [user]);
  
  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // إضافة رقائق للمستخدم - نستخدم دالة updateUserData مباشرة
  const handleAddChips = async (amount: number) => {
    try {
      if (updateUserData) {
        const result = await updateUserData({ chips: amount });
        return !!result; // نرجع true إذا كان هناك نتيجة ناجحة
      }
      return false;
    } catch (error) {
      console.error('خطأ في إضافة الرقائق:', error);
      return false;
    }
  };
  
  if (!profileData) {
    return <div>جاري التحميل...</div>;
  }
  
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
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;