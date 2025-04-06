import EgyptRocketGame from '../games/egypt-rocket/egypt-rocket-page';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

// صفحة لعبة صاروخ مصر
const EgyptRocketPage = () => {
  const [pythonServerRunning, setPythonServerRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("جاري التحقق من خادم اللعبة...");

  // التحقق من حالة الخادم عند تحميل الصفحة
  useEffect(() => {
    checkPythonServer();
  }, []);
  
  const checkPythonServer = async () => {
    setLoading(true);
    try {
      // محاولة الاتصال بواجهة API لخادم بايثون
      const response = await fetch('/api/egypt-rocket/status');
      if (response.ok) {
        setPythonServerRunning(true);
        setMessage("خادم اللعبة يعمل بنجاح!");
      } else {
        setPythonServerRunning(false);
        setMessage("خادم اللعبة غير متاح. جاري استخدام الخادم الافتراضي.");
      }
    } catch (error) {
      console.error("خطأ في الاتصال بخادم بايثون:", error);
      setPythonServerRunning(false);
      setMessage("تعذر الاتصال بخادم اللعبة.");
    } finally {
      setLoading(false);
    }
  };

  // عرض رسالة حالة الخادم
  const serverStatus = (
    <div className="fixed bottom-24 right-4 bg-slate-800 text-white p-2 rounded-md text-xs z-50 opacity-80">
      حالة خادم اللعبة: {pythonServerRunning ? 'نشط ✅' : 'غير متاح ❌'}
    </div>
  );

  // عرض رسالة خطأ إذا كان الخادم غير متاح
  if (!pythonServerRunning && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-lg p-6 text-center bg-red-50 border-red-200">
          <div className="mb-4 text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-2">حدث خطأ!</h2>
            <p className="mb-4">فشل الاتصال بالخادم. يرجى تحديث الصفحة.</p>
            <Button 
              onClick={() => {
                window.location.reload();
              }}
              className="mx-auto"
              variant="destructive"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث الصفحة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <EgyptRocketGame />
      {serverStatus}
    </>
  );
};

export default EgyptRocketPage;