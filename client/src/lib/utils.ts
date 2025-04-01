import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * تنسيق قيمة الرقائق (الشيبس) للعرض 
 * مثال: 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M, 1000000000 -> 1B
 */
export function formatChips(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(amount % 1000000000 === 0 ? 0 : 1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  } else {
    return amount.toString();
  }
}
