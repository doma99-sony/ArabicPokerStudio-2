import { useState, useEffect } from 'react';

// استخدام نوع عام للقيمة
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // استخدام دالة مؤجلة للحصول على القيمة الأولية من التخزين المحلي
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // الحصول على القيمة من التخزين المحلي إذا كانت موجودة
      const item = window.localStorage.getItem(key);
      // تحويل البيانات المخزنة إذا كانت موجودة، وإلا استخدام القيمة الأولية
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // إذا حدث خطأ، استخدم القيمة الأولية
      console.error("خطأ في قراءة التخزين المحلي:", error);
      return initialValue;
    }
  });

  // تعريف وظيفة تحديث قيمة التخزين المحلي
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // تحديد القيمة إما مباشرة أو باستخدام دالة رد المستدعاة
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // تحديث حالة الريكت
      setStoredValue(valueToStore);
      // تحديث التخزين المحلي
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("خطأ في حفظ القيمة في التخزين المحلي:", error);
    }
  };

  // مراقبة التغييرات في المفتاح وتحديث القيمة المخزنة
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          // تحديث الحالة عندما يتغير التخزين من مكان آخر
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error("خطأ في معالجة تغيير التخزين:", error);
        }
      }
    };

    // إضافة مستمع لأحداث التخزين
    window.addEventListener('storage', handleStorageChange);

    // التنظيف عند إلغاء التثبيت
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}