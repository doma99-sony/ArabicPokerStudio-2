import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BadgeType } from '@/components/profile/EgyptianProfile';
import DominoProfileCard from '@/components/profile/DominoProfileCard';

// صفحة الملف الشخصي المصري
const ProfilePage: React.FC = () => {
  const [, navigate] = useLocation();
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-4 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* زر العودة إلى اللوبي */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="absolute top-2 right-2 z-20 p-1 rounded-full bg-amber-700/90 hover:bg-amber-600 text-white"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </Button>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
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