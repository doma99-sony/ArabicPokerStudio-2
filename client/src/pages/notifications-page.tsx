import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowRight, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useNotifications, Notification } from "@/components/ui/notifications-system";

export default function NotificationsPage() {
  const { messageId } = useParams();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // العثور على الإشعار النشط إذا تم تحديد معرف
  useEffect(() => {
    if (messageId) {
      const notification = notifications.find(n => n.id === messageId) || null;
      setActiveNotification(notification);
      
      // بدء تأثير الوميض إذا كان هناك إشعار محدد
      if (notification) {
        const blinkInterval = setInterval(() => {
          setIsBlinking(prev => !prev);
        }, 500);
        
        return () => clearInterval(blinkInterval);
      }
    } else if (notifications.length > 0) {
      // إذا لم يتم تحديد معرف، اختر أحدث إشعار
      setActiveNotification(notifications[notifications.length - 1]);
    }
  }, [messageId, notifications]);

  // تنسيق التاريخ للعرض
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ar-EG', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1708] text-white p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/lobby">
            <Button variant="ghost" className="mr-2">
              <ArrowRight className="h-5 w-5 ml-2" />
              <span>العودة للصفحة الرئيسية</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#D4AF37]">الإشعارات</h1>
          <Bell className="text-[#D4AF37] h-6 w-6 mr-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* قائمة الإشعارات */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#D4AF37]/80">جميع الإشعارات</h2>
              {notifications.some(n => !n.read) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-[#D4AF37]/50 text-[#D4AF37]/80 hover:bg-[#D4AF37]/20 text-xs"
                  onClick={markAllAsRead}
                >
                  <CheckCircle2 className="h-3 w-3 ml-1" />
                  تعليم الكل كمقروء
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="bg-black/30 rounded-lg p-4 text-center">
                لا توجد إشعارات حالياً
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                    activeNotification?.id === notification.id 
                      ? 'bg-[#D4AF37]/20 border-r-4 border-[#D4AF37]' 
                      : 'bg-black/30 hover:bg-black/50'
                  } ${!notification.read ? 'border-r-4 border-green-500/50' : ''}`}
                  onClick={() => setActiveNotification(notification)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={`font-bold ${!notification.read ? 'text-white' : 'text-white/70'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="bg-green-500 h-2 w-2 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 truncate">{notification.content}</p>
                  <p className="text-xs text-[#D4AF37]/70 mt-1">{formatDate(notification.timestamp)}</p>
                </div>
              ))
            )}
          </div>

          {/* محتوى الإشعار المحدد */}
          <div className="md:col-span-2">
            {activeNotification ? (
              <Card className={`bg-black/40 border ${
                isBlinking && !activeNotification.read 
                  ? 'border-[#FFD700]' 
                  : 'border-[#D4AF37]/30'
              }`}>
                <CardHeader>
                  <CardTitle className={`text-xl font-bold ${
                    isBlinking && !activeNotification.read 
                      ? 'text-[#FFD700]' 
                      : 'text-[#D4AF37]'
                  }`}>
                    {activeNotification.title}
                  </CardTitle>
                  <div className="text-sm text-white/60">
                    {formatDate(activeNotification.timestamp)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-md whitespace-pre-line leading-relaxed">
                    {activeNotification.content}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  {!activeNotification.read && (
                    <Button 
                      className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
                      onClick={() => markAsRead(activeNotification.id)}
                    >
                      تم قراءة الرسالة
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center bg-black/30 rounded-lg p-8">
                <p className="text-white/50 text-center">
                  اختر إشعارًا من القائمة لعرض تفاصيله
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}