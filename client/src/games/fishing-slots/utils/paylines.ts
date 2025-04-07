/**
 * وحدة خطوط الدفع - تحديد مسارات خطوط الدفع في لعبة صياد السمك
 */

import { Payline } from '../types';
import { PAYLINE_COLORS } from '../assets/images';

/**
 * تعريف خطوط الدفع الـ 20 في اللعبة
 * كل خط دفع يحتوي على 5 مواضع (واحد لكل عمود)
 * القيم هي أرقام الصفوف (0، 1، 2)
 */
export const PAYLINES: Payline[] = [
  // خط 1: الصف الأوسط
  { id: 1, positions: [1, 1, 1, 1, 1], color: PAYLINE_COLORS[0] },
  
  // خط 2: الصف العلوي
  { id: 2, positions: [0, 0, 0, 0, 0], color: PAYLINE_COLORS[1] },
  
  // خط 3: الصف السفلي
  { id: 3, positions: [2, 2, 2, 2, 2], color: PAYLINE_COLORS[2] },
  
  // خط 4: V شكل
  { id: 4, positions: [0, 1, 2, 1, 0], color: PAYLINE_COLORS[3] },
  
  // خط 5: ^ شكل
  { id: 5, positions: [2, 1, 0, 1, 2], color: PAYLINE_COLORS[4] },
  
  // خط 6: متعرج من أعلى إلى أسفل
  { id: 6, positions: [0, 1, 0, 1, 0], color: PAYLINE_COLORS[5] },
  
  // خط 7: متعرج من أسفل إلى أعلى
  { id: 7, positions: [2, 1, 2, 1, 2], color: PAYLINE_COLORS[6] },
  
  // خط 8: W شكل
  { id: 8, positions: [0, 2, 0, 2, 0], color: PAYLINE_COLORS[7] },
  
  // خط 9: M شكل
  { id: 9, positions: [2, 0, 2, 0, 2], color: PAYLINE_COLORS[8] },
  
  // خط 10: V مع نهاية مستقيمة
  { id: 10, positions: [0, 1, 2, 2, 2], color: PAYLINE_COLORS[9] },
  
  // خط 11: ^ مع نهاية مستقيمة
  { id: 11, positions: [2, 1, 0, 0, 0], color: PAYLINE_COLORS[10] },
  
  // خط 12: V معكوس
  { id: 12, positions: [2, 2, 2, 1, 0], color: PAYLINE_COLORS[11] },
  
  // خط 13: ^ معكوس
  { id: 13, positions: [0, 0, 0, 1, 2], color: PAYLINE_COLORS[12] },
  
  // خط 14: متعرج مزدوج
  { id: 14, positions: [0, 2, 0, 2, 2], color: PAYLINE_COLORS[13] },
  
  // خط 15: متعرج مزدوج معكوس
  { id: 15, positions: [2, 0, 2, 0, 0], color: PAYLINE_COLORS[14] },
  
  // خط 16: خط متدرج من أعلى إلى أسفل
  { id: 16, positions: [0, 0, 1, 1, 2], color: PAYLINE_COLORS[15] },
  
  // خط 17: خط متدرج من أسفل إلى أعلى
  { id: 17, positions: [2, 2, 1, 1, 0], color: PAYLINE_COLORS[16] },
  
  // خط 18: منحنى
  { id: 18, positions: [1, 0, 0, 0, 1], color: PAYLINE_COLORS[17] },
  
  // خط 19: منحنى معكوس
  { id: 19, positions: [1, 2, 2, 2, 1], color: PAYLINE_COLORS[18] },
  
  // خط 20: شكل الماس
  { id: 20, positions: [1, 0, 1, 0, 1], color: PAYLINE_COLORS[19] }
];

/**
 * الحصول على لون خط الدفع المحدد
 * @param lineId معرف خط الدفع
 * @returns لون خط الدفع
 */
export const getPaylineColor = (lineId: number): string => {
  const payline = PAYLINES.find(line => line.id === lineId);
  return payline ? payline.color : '#FFFFFF';
};

/**
 * تحويل موضع في شبكة الرموز إلى إحداثيات السمكة
 * يستخدم لتحديد موضع الرموز في الرسم البياني
 * @param position موضع الرمز [صف، عمود]
 * @param gridSize حجم الشبكة الإجمالي
 * @returns إحداثيات x, y
 */
export const positionToCoordinates = (
  position: [number, number], 
  gridSize: { width: number; height: number }
): { x: number; y: number } => {
  // تقسيم الشبكة إلى 5 أعمدة و 3 صفوف
  const cellWidth = gridSize.width / 5;
  const cellHeight = gridSize.height / 3;
  
  // حساب الإحداثيات x, y المطلقة
  const x = position[1] * cellWidth + cellWidth / 2;
  const y = position[0] * cellHeight + cellHeight / 2;
  
  return { x, y };
};

/**
 * إنشاء مسار SVG لخط الدفع
 * @param payline خط الدفع
 * @param gridSize حجم الشبكة 
 * @returns سلسلة المسار SVG
 */
export const createPaylinePath = (
  payline: Payline,
  gridSize: { width: number; height: number }
): string => {
  const points: { x: number; y: number }[] = [];
  
  // تحويل كل موضع في خط الدفع إلى إحداثيات
  for (let col = 0; col < 5; col++) {
    const position: [number, number] = [payline.positions[col], col];
    const coord = positionToCoordinates(position, gridSize);
    points.push(coord);
  }
  
  // إنشاء مسار SVG
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return pathData;
};