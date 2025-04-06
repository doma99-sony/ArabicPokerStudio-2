import EgyptRocketGame from '../games/egypt-rocket/egypt-rocket-page';
import { useEffect, useState } from 'react';

// صفحة لعبة صاروخ مصر
const EgyptRocketPage = () => {
  const [pythonServerRunning, setPythonServerRunning] = useState(false);
  const [message, setMessage] = useState("جاري التحقق من خادم بايثون...");

  // التحقق من حالة الخادم عند تحميل الصفحة
  useEffect(() => {
    const checkPythonServer = async () => {
      try {
        // محاولة الاتصال بواجهة API لخادم بايثون
        const response = await fetch('/api/egypt-rocket/status');
        if (response.ok) {
          setPythonServerRunning(true);
          setMessage("خادم بايثون يعمل بنجاح!");
        } else {
          setPythonServerRunning(false);
          setMessage("خادم بايثون غير متاح. جاري استخدام الخادم الافتراضي.");
        }
      } catch (error) {
        console.error("خطأ في الاتصال بخادم بايثون:", error);
        setPythonServerRunning(false);
        setMessage("تعذر الاتصال بخادم بايثون. جاري استخدام الخادم الافتراضي.");
      }
    };

    checkPythonServer();
  }, []);

  // عرض رسالة حالة الخادم في الوضع التطويري
  const devMessage = import.meta.env.DEV ? (
    <div className="fixed bottom-24 right-4 bg-slate-800 text-white p-2 rounded-md text-xs z-50 opacity-80">
      حالة خادم بايثون: {pythonServerRunning ? 'نشط ✅' : 'غير متاح ❌'}
    </div>
  ) : null;

  return (
    <>
      <EgyptRocketGame />
      {devMessage}
    </>
  );
};

export default EgyptRocketPage;