/**
 * تعريف خطوط الدفع في لعبة صياد السمك
 */

import { Payline } from '../types';
import { PAYLINE_COLORS } from '../assets/images';

/**
 * تعريف خطوط الدفع الـ 20 في اللعبة
 * كل خط دفع يتكون من مواضع الرموز في كل عمود
 * القيم تمثل أرقام الصفوف (0-2) في كل عمود (0-4)
 */
export const PAYLINES: Payline[] = [
  { id: 1, positions: [1, 1, 1, 1, 1], color: PAYLINE_COLORS[0] }, // الخط الأفقي الأوسط
  { id: 2, positions: [0, 0, 0, 0, 0], color: PAYLINE_COLORS[1] }, // الخط الأفقي العلوي
  { id: 3, positions: [2, 2, 2, 2, 2], color: PAYLINE_COLORS[2] }, // الخط الأفقي السفلي
  { id: 4, positions: [0, 1, 2, 1, 0], color: PAYLINE_COLORS[3] }, // شكل V
  { id: 5, positions: [2, 1, 0, 1, 2], color: PAYLINE_COLORS[4] }, // شكل V مقلوب
  { id: 6, positions: [0, 0, 1, 2, 2], color: PAYLINE_COLORS[5] }, // خط مائل من أعلى اليسار إلى أسفل اليمين
  { id: 7, positions: [2, 2, 1, 0, 0], color: PAYLINE_COLORS[6] }, // خط مائل من أسفل اليسار إلى أعلى اليمين
  { id: 8, positions: [1, 0, 0, 0, 1], color: PAYLINE_COLORS[7] }, // شكل U مقلوب
  { id: 9, positions: [1, 2, 2, 2, 1], color: PAYLINE_COLORS[8] }, // شكل U
  { id: 10, positions: [1, 2, 1, 0, 1], color: PAYLINE_COLORS[9] }, // شكل زجزاج
  { id: 11, positions: [1, 0, 1, 2, 1], color: PAYLINE_COLORS[10] }, // شكل زجزاج عكسي
  { id: 12, positions: [0, 1, 1, 1, 0], color: PAYLINE_COLORS[11] }, // شكل عنق زجاجة علوي
  { id: 13, positions: [2, 1, 1, 1, 2], color: PAYLINE_COLORS[12] }, // شكل عنق زجاجة سفلي
  { id: 14, positions: [0, 1, 0, 1, 0], color: PAYLINE_COLORS[13] }, // خط زجزاج علوي
  { id: 15, positions: [2, 1, 2, 1, 2], color: PAYLINE_COLORS[14] }, // خط زجزاج سفلي
  { id: 16, positions: [1, 1, 0, 1, 1], color: PAYLINE_COLORS[15] }, // أعلى الوسط
  { id: 17, positions: [1, 1, 2, 1, 1], color: PAYLINE_COLORS[16] }, // أسفل الوسط
  { id: 18, positions: [0, 0, 2, 0, 0], color: PAYLINE_COLORS[17] }, // أعلى ثم أسفل ثم أعلى
  { id: 19, positions: [2, 2, 0, 2, 2], color: PAYLINE_COLORS[18] }, // أسفل ثم أعلى ثم أسفل
  { id: 20, positions: [0, 2, 0, 2, 0], color: PAYLINE_COLORS[19] }, // تبادل بين الأعلى والأسفل
];

/**
 * الحصول على خط الدفع حسب الرقم
 * @param id رقم خط الدفع
 * @returns خط الدفع المطلوب أو undefined إذا كان الرقم غير صحيح
 */
export const getPaylineById = (id: number): Payline | undefined => {
  return PAYLINES.find(payline => payline.id === id);
};

/**
 * الحصول على لون خط الدفع حسب الرقم
 * @param id رقم خط الدفع
 * @returns لون خط الدفع
 */
export const getPaylineColor = (id: number): string => {
  const payline = getPaylineById(id);
  return payline ? payline.color : PAYLINE_COLORS[0];
};

/**
 * الحصول على مواضع الرموز على خط الدفع معين
 * ترجع مصفوفة من أزواج [صف، عمود] لكل رمز على الخط
 * @param paylineId رقم خط الدفع
 * @returns مصفوفة من الإحداثيات [صف، عمود]
 */
export const getPaylinePositions = (paylineId: number): [number, number][] => {
  const payline = getPaylineById(paylineId);
  if (!payline) return [];
  
  return payline.positions.map((row, col) => [row, col] as [number, number]);
};

/**
 * فحص ما إذا كان الموضع [صف، عمود] موجوداً على خط الدفع المحدد
 * @param paylineId رقم خط الدفع
 * @param position موضع الرمز [صف، عمود]
 * @returns true إذا كان الموضع موجوداً على خط الدفع
 */
export const isPositionOnPayline = (paylineId: number, position: [number, number]): boolean => {
  const [row, col] = position;
  const payline = getPaylineById(paylineId);
  
  if (!payline) return false;
  
  return payline.positions[col] === row;
};