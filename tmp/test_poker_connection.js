// مولد اختبار اتصال WebSocket للبوكر
const WebSocket = require('ws');

// بروتوكول الاتصال
const protocol = 'ws'; // استخدم 'wss' للاتصالات الآمنة
const host = 'localhost:3000'; // عنوان الخادم المحلي
const endpoint = 'ws/poker'; // نقطة نهاية البوكر

// إنشاء اتصال WebSocket
const url = `${protocol}://${host}/${endpoint}`;
console.log(`محاولة الاتصال بـ: ${url}`);

const ws = new WebSocket(url);

// معالجة فتح الاتصال
ws.on('open', function open() {
  console.log('تم فتح الاتصال بنجاح!');
  
  // إرسال رسالة اختبار للانضمام إلى طاولة
  const joinMessage = {
    type: 'join_table',
    tableId: 1,
    playerId: 99,
    data: {
      username: 'لاعب_الاختبار',
      playerId: 99,
      chips: 1000,
      blindAmount: 10
    },
    timestamp: Date.now()
  };
  
  console.log('إرسال رسالة الانضمام للطاولة:', JSON.stringify(joinMessage));
  ws.send(JSON.stringify(joinMessage));
  
  // إرسال ping للتأكد من أن الاتصال مفتوح
  setInterval(() => {
    const pingMessage = {
      type: 'ping',
      timestamp: Date.now()
    };
    ws.send(JSON.stringify(pingMessage));
    console.log('إرسال نبض للخادم...');
  }, 10000);
  
  // إغلاق الاتصال بعد 60 ثانية
  setTimeout(() => {
    console.log('إغلاق الاتصال بعد 60 ثانية من الاختبار...');
    ws.close();
    process.exit(0);
  }, 60000);
});

// معالجة الرسائل الواردة
ws.on('message', function incoming(data) {
  console.log('رسالة واردة من الخادم:', data.toString());
  
  try {
    const message = JSON.parse(data.toString());
    
    // إذا كان الرد على الانضمام إلى الطاولة، أرسل إجراء لاعب
    if (message.type === 'game_state') {
      setTimeout(() => {
        const actionMessage = {
          type: 'player_action',
          action: 'check',
          amount: 0,
          tableId: 1,
          timestamp: Date.now()
        };
        console.log('إرسال إجراء لاعب:', JSON.stringify(actionMessage));
        ws.send(JSON.stringify(actionMessage));
      }, 3000);
    }
    
    // إذا كان الرد على إجراء، أرسل رسالة دردشة
    if (message.type === 'action_result') {
      setTimeout(() => {
        const chatMessage = {
          type: 'chat_message',
          message: 'مرحباً من اختبار الاتصال!',
          tableId: 1,
          timestamp: Date.now()
        };
        console.log('إرسال رسالة دردشة:', JSON.stringify(chatMessage));
        ws.send(JSON.stringify(chatMessage));
      }, 3000);
    }
  } catch (error) {
    console.error('خطأ في معالجة الرسالة:', error);
  }
});

// معالجة الأخطاء
ws.on('error', function error(error) {
  console.error('خطأ في اتصال WebSocket:', error);
});

// معالجة إغلاق الاتصال
ws.on('close', function close() {
  console.log('تم إغلاق اتصال WebSocket');
});

console.log('جاري تشغيل اختبار اتصال WebSocket للبوكر...');
