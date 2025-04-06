import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * معالجة استجابة الخادم بشكل آمن
 * تتعامل مع الحالات التي يعود فيها HTML بدلاً من JSON المتوقع
 *  
 * @param response استجابة الخادم من fetch
 * @param defaultErrorMessage رسالة خطأ افتراضية إذا لم تتمكن من استخراج رسالة من الاستجابة
 * @returns وعد يحل إلى البيانات أو يرفض مع رسالة خطأ محسنة
 */
export async function handleApiResponse(response: Response, defaultErrorMessage = "حدث خطأ في الاتصال بالخادم") {
  if (!response.ok) {
    if (response.status === 404) {
      // حالة خاصة لعدم العثور على المورد
      throw new Error("المورد غير موجود. يرجى التحقق من الرابط والمحاولة مرة أخرى.");
    }
    
    if (response.status === 401 || response.status === 403) {
      // حالة خاصة لمشاكل المصادقة
      throw new Error("يجب تسجيل الدخول للوصول إلى هذا المورد.");
    }
    
    // محاولة الحصول على رسالة الخطأ من الاستجابة
    const contentType = response.headers.get("content-type");
    
    try {
      if (contentType && contentType.includes("application/json")) {
        // الاستجابة من نوع JSON - محاولة قراءتها
        const errorData = await response.json();
        throw new Error(errorData.message || defaultErrorMessage);
      } else {
        // إذا لم تكن الاستجابة من نوع JSON، نقرأ النص
        const errorText = await response.text();
        
        // فحص ما إذا كان النص يبدو وكأنه HTML (قد يكون صفحة خطأ)
        if (errorText.includes("<!DOCTYPE html>") || errorText.includes("<html")) {
          // هذه الاستجابة هي HTML وليست JSON كما هو متوقع
          console.error("تم استلام استجابة HTML غير متوقعة:", errorText.substring(0, 200));
          throw new Error("الخادم أرجع صفحة HTML بدلاً من البيانات المتوقعة. قد تكون جلستك قد انتهت صلاحيتها.");
        }
        
        // إذا كان النص مقروءًا، استخدمه كرسالة خطأ
        throw new Error(errorText || defaultErrorMessage);
      }
    } catch (jsonError) {
      // إذا فشلت محاولة قراءة الاستجابة، نستخدم رسالة الخطأ الافتراضية
      if (jsonError instanceof Error && jsonError.message !== defaultErrorMessage) {
        throw jsonError; // استخدام الخطأ الذي تم إنشاؤه في الكتلة المحاولة
      }
      throw new Error(defaultErrorMessage);
    }
  }
  
  // إذا وصلنا إلى هنا، فإن الاستجابة ناجحة - محاولة قراءة البيانات
  try {
    // للاستجابات الناجحة، نتوقع دائمًا JSON
    return await response.json();
  } catch (jsonError) {
    console.error("خطأ في تحليل استجابة JSON ناجحة:", jsonError);
    throw new Error("تم استلام استجابة غير صالحة من الخادم");
  }
}

/**
 * تنسيق قيمة الرقائق (الشيبس) للعرض باستخدام الأرقام الإنجليزية
 * مثال: 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M, 1000000000 -> 1B
 */
export function formatChips(amount: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    notation: 'compact',
    compactDisplay: 'short'
  });
  
  return formatter.format(amount);
}

/**
 * تنسيق الرقم ليظهر بالأرقام الإنجليزية
 * هذه الدالة تضمن أن جميع الأرقام تظهر بالإنجليزية بدلاً من العربية
 */
export function formatToEnglishNumbers(value: number | string): string {
  if (value === undefined || value === null) return '';
  
  // تحويل القيمة إلى نص
  const strValue = value.toString();
  
  // تنسيق النص باستخدام أرقام إنجليزية
  const formatted = new Intl.NumberFormat('en-US').format(
    parseFloat(strValue.replace(/,/g, ''))
  );
  
  return formatted;
}

/**
 * تنسيق المبلغ النقدي باستخدام رمز الدولار $ والأرقام الإنجليزية
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
