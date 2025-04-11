import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import EgyptianProfile from '@/components/profile/EgyptianProfile';
import { BadgeType } from '@/components/profile/EgyptianProfile';

// صفحة الملف الشخصي المصري
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // استخدام بيانات مستخدم تجريبية للعرض فقط
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
    fabChargeCount: 5
  };
  
  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center text-amber-300 mb-8" dir="rtl">
          الملف الشخصي
        </h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <EgyptianProfile 
            user={mockUser} 
            editable={true}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;