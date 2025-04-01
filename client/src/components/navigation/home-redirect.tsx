import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

/**
 * مكون لإعادة التوجيه إلى صفحة اللوبي الرئيسية بشكل آمن
 * يمكن استخدامه في أي مكان في التطبيق حيث نحتاج إلى الانتقال السريع للصفحة الرئيسية
 */
export const HomeRedirect = () => {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // الانتظار حتى اكتمال عملية تحميل حالة المستخدم
    if (!isLoading) {
      if (user) {
        // إذا كان المستخدم مسجل الدخول، توجيه إلى اللوبي الرئيسي
        navigate('/');
      } else {
        // إذا لم يكن مسجل الدخول، توجيه إلى صفحة تسجيل الدخول
        navigate('/auth');
      }
    }
  }, [user, isLoading, navigate]);
  
  // عرض شاشة تحميل بسيطة أثناء إعادة التوجيه
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <div className="h-14 w-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-[#D4AF37] text-xl font-bold">جاري الانتقال إلى الصفحة الرئيسية...</h2>
      </div>
    </div>
  );
};

// تصدير دالة مساعدة للانتقال السريع إلى الصفحة الرئيسية
export const redirectToHome = (navigate: (to: string) => void, user: any | null) => {
  if (user) {
    navigate('/');
  } else {
    navigate('/auth');
  }
};