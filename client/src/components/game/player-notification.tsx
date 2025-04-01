import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerPosition } from '../../types';

interface PlayerNotification {
  type: 'join' | 'leave' | 'fold' | 'win' | 'action';
  player: PlayerPosition | string;
  timestamp: number;
  message?: string;
}

interface PlayerNotificationsProps {
  gameStatus: string;
  players: PlayerPosition[];
  previousPlayers?: PlayerPosition[]; // للكشف عن تغييرات اللاعبين
}

export function PlayerNotifications({ gameStatus, players, previousPlayers = [] }: PlayerNotificationsProps) {
  const [notifications, setNotifications] = useState<PlayerNotification[]>([]);
  const [visible, setVisible] = useState(true);

  // تتبع تغييرات اللاعبين للكشف عن الانضمام أو المغادرة
  useEffect(() => {
    // لا تنفذ في المرة الأولى إذا كانت previousPlayers فارغة
    if (previousPlayers.length === 0) return;

    // العثور على اللاعبين الجدد الذين انضموا
    const newPlayers = players.filter(
      player => !previousPlayers.some(prevPlayer => prevPlayer.id === player.id)
    );

    // العثور على اللاعبين الذين غادروا
    const leftPlayers = previousPlayers.filter(
      prevPlayer => !players.some(player => player.id === prevPlayer.id)
    );

    // إضافة إشعارات للاعبين الجدد
    newPlayers.forEach(player => {
      addNotification({
        type: 'join',
        player,
        timestamp: Date.now(),
        message: `انضم ${player.username} إلى الطاولة`
      });
    });

    // إضافة إشعارات للاعبين الذين غادروا
    leftPlayers.forEach(player => {
      addNotification({
        type: 'leave',
        player,
        timestamp: Date.now(),
        message: `غادر ${player.username} الطاولة`
      });
    });

  }, [players, previousPlayers]);

  // إضافة إشعار جديد
  const addNotification = (notification: PlayerNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // الاحتفاظ بآخر 5 إشعارات فقط
    
    // إظهار الإشعارات لمدة 5 ثوانٍ
    setVisible(true);
    setTimeout(() => {
      // إخفاء الإشعارات بعد مرور 5 ثوانٍ
      setVisible(false);
    }, 5000);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-black/70 backdrop-blur-sm p-3 rounded-xl border border-gold/30 max-w-sm"
          >
            <div className="text-white text-sm">
              <h3 className="text-gold text-xs mb-1 font-bold">آخر الأحداث في اللعبة</h3>
              <ul className="space-y-1">
                {notifications.map((notification, index) => (
                  <motion.li
                    key={`${notification.timestamp}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      text-xs py-1 border-b border-white/10 last:border-0
                      ${notification.type === 'join' ? 'text-green-400' : ''}
                      ${notification.type === 'leave' ? 'text-red-400' : ''}
                      ${notification.type === 'fold' ? 'text-orange-400' : ''}
                      ${notification.type === 'win' ? 'text-gold' : ''}
                      ${notification.type === 'action' ? 'text-blue-400' : ''}
                    `}
                  >
                    {notification.message}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}