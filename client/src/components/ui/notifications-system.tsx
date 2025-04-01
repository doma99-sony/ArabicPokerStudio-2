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

function NotificationsDisplay() {
  const { notifications, unreadCount, markAsRead, showInlineNotification } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [, navigate] = useLocation();
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // بدء تأثير الوميض إذا كانت هناك إشعارات غير مقروءة
  useEffect(() => {
    if (unreadCount > 0 && !blinkIntervalRef.current) {
      blinkIntervalRef.current = setInterval(() => {
        setBlinking(prev => !prev);
      }, 500);
    } else if (unreadCount === 0 && blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
      setBlinking(false);
    }
    
    return () => {
      if (blinkIntervalRef.current) {
        clearInterval(blinkIntervalRef.current);
      }
    };
  }, [unreadCount]);
  
  // الحصول على أحدث إشعار غير مقروء
  const latestUnreadNotification = notifications.filter(n => !n.read).slice(-1)[0];
  
  // فتح الإشعار
  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setOpenDialog(true);
    
    // إيقاف الوميض عند فتح الإشعار
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
      setBlinking(false);
    }
  };
  
  // تأكيد قراءة الإشعار
  const handleMarkAsRead = () => {
    if (selectedNotification) {
      markAsRead(selectedNotification.id);
      setOpenDialog(false);
    }
  };
  
  // التنقل إلى صفحة الإشعارات
  const navigateToNotificationsPage = () => {
    navigate('/notifications');
    setOpenDialog(false);
  };
  
  return (
    <>
      {/* عرض أحدث إشعار غير مقروء كتنبيه منبثق إذا تم تمكين الخيار */}
      {showInlineNotification && latestUnreadNotification && (
        <div 
          className={`fixed left-4 bottom-20 cursor-pointer flex items-center gap-2 bg-black/70 p-2 rounded-lg border-2 transition-all duration-300 ${blinking ? 'border-[#FFD700] text-[#FFD700]' : 'border-[#D4AF37]/50 text-white'} z-50`}
          onClick={() => openNotification(latestUnreadNotification)}
        >
          <Bell className={`h-5 w-5 ${blinking ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`} />
          <div className="overflow-hidden text-sm">
            <p className="font-bold truncate" style={{maxWidth: '200px'}}>{latestUnreadNotification.title}</p>
            <p className="text-xs opacity-80 truncate" style={{maxWidth: '200px'}}>رسالة جديدة! انقر للعرض</p>
          </div>
        </div>
      )}

      {/* مربع حوار تفاصيل الإشعار */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-[#D4AF37]">
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-md leading-relaxed">{selectedNotification?.content}</p>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              className="bg-transparent border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20"
              onClick={navigateToNotificationsPage}
            >
              عرض كل الإشعارات
            </Button>
            <Button 
              className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
              onClick={handleMarkAsRead}
            >
              تم قراءة الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
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