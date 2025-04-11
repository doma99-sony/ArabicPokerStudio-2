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
  
  // استخدام بيانات مستخدم تجريبية للعرض فقط
  // يمكن تغيير هذه البيانات لرؤية الاختلافات بين أنواع المستخدمين المختلفة
  const mockUser = {
    id: 10392845,
    username: "محمد المصري",
    chips: 15000,
    avatar: null,
    level: 37,
    experience: 36500,
    rank: "متقدم",
    fabChips: 950,
    diamonds: 250,
    badges: [BadgeType.BASIC, BadgeType.GOLD],
    title: "المحارب",
    agentBadgeUnlocked: true,
    agentName: "سارة - الرياض",
    fabChargeCount: 5,
    
    // تغيير هذه القيم لاختبار أنواع حسابات مختلفة:
    // للحساب العادي: isGuest: false, authType: 'email'
    // لحساب فيسبوك: isGuest: false, authType: 'facebook'
    // لحساب زائر: isGuest: true, authType: 'guest'
    isGuest: false,
    authType: 'email' as 'email' | 'facebook' | 'guest'
  };
  
  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-900 to-black w-full h-full flex items-start justify-center overflow-auto">
      <div className="w-full h-full px-0 sm:px-4 py-4 flex items-start justify-center">
        {loading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <DominoProfileCard 
            user={mockUser}
            onClose={() => navigate('/')}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;