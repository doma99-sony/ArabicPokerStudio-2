/**
 * دالة لتنسيق عدد الرقائق بطريقة مقروءة
 * مثال: 1000 -> 1K, 1500000 -> 1.5M
 */
export function formatChips(chips: number): string {
  if (chips >= 1000000000) {
    return `${(chips / 1000000000).toFixed(1)}B`;
  }
  if (chips >= 1000000) {
    return `${(chips / 1000000).toFixed(1)}M`;
  }
  if (chips >= 1000) {
    return `${(chips / 1000).toFixed(1)}K`;
  }
  return chips.toString();
}