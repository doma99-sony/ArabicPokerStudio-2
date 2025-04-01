import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Bell, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  read: boolean;
  type?: 'system' | 'game' | 'friend' | 'vip' | 'reward';
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  showInlineNotification: boolean;
  setShowInlineNotification: (show: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  showInlineNotification: true,
  setShowInlineNotification: () => {}
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showInlineNotification, setShowInlineNotification] = useState(true);
  
  useEffect(() => {
    // استرجاع الإشعارات من التخزين المحلي عند التحميل
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);
  
  // حفظ الإشعارات في التخزين المحلي عند تغييرها
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // إضافة إشعار جديد
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}`,
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [...prev, newNotification]);
  };
  
  // وضع علامة "مقروء" على إشعار معين
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // وضع علامة "مقروء" على جميع الإشعارات
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    showInlineNotification,
    setShowInlineNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationsDisplay />
    </NotificationsContext.Provider>
  );
}

// مكون مبسط بعد إزالة الإشعارات المنبثقة وشاشة التفاصيل
function NotificationsDisplay() {
  // تم إزالة كل منطق الإشعارات المنبثقة ومربع الحوار لعرض الإشعارات فقط في صفحة الإشعارات الخاصة
  return null; // لا يوجد شيء للعرض - الإشعارات ستظهر فقط في صفحة الإشعارات
}

// مكون زر الإشعارات لاستخدامه في شريط التنقل (لن يتم استخدامه بعد الآن)
export function NotificationsButton() {
  const { unreadCount, notifications } = useNotifications();
  const [, navigate] = useLocation();
  
  return (
    <div className="relative">
      <button 
        onClick={() => navigate("/notifications")}
        className="flex flex-col items-center justify-center p-2 min-w-[48px]"
      >
        <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
          <Bell className="h-5 w-5" />
        </div>
        <span className="text-[11px] text-white mt-1">الإشعارات</span>
      </button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center border border-black">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}

// مكون زر تعليمات اللعب الجديد ليستخدم بدلاً من زر الإشعارات
export function GameInstructionsButton({ onShowInstructions }: { onShowInstructions?: () => void }) {
  const [, navigate] = useLocation();
  
  // التعامل مع النقر على زر تعليمات اللعب
  const handleClick = () => {
    if (onShowInstructions) {
      onShowInstructions();
    } else {
      navigate("/how-to-play");
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={handleClick}
        className="flex flex-col items-center justify-center p-2 min-w-[48px]"
      >
        <div className="bg-yellow-500/70 rounded-full w-11 h-11 border-2 border-yellow-300 flex items-center justify-center text-black animate-pulse">
          <HelpCircle className="h-5 w-5" />
        </div>
        <span className="text-[11px] text-white mt-1">تعليمات اللعب</span>
      </button>
    </div>
  );
}