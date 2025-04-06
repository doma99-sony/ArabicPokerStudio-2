import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
