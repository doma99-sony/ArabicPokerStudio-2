import React from 'react';
import { Payline, Win } from '../types';
import { PAYLINE_COLORS } from '../assets/images';

interface PaylineOverlayProps {
  payline: Payline;
  visible: boolean;
  gridSize: { cols: number, rows: number };
  color?: string;
}

/**
 * مكون يعرض خط دفع مع الرسومات المتحركة
 */
const PaylineOverlay: React.FC<PaylineOverlayProps> = ({
  payline,
  visible,
  gridSize,
  color
}) => {
  if (!visible) return null;

  const { cols, rows } = gridSize;
  const lineColor = color || PAYLINE_COLORS[payline.id % PAYLINE_COLORS.length];
  
  // إنشاء نقاط المسار لرسم خط الدفع
  const createPathPoints = () => {
    const points: [number, number][] = [];
    
    // تحويل مواقع خط الدفع إلى إحداثيات
    for (let i = 0; i < payline.positions.length; i++) {
      const rowIndex = payline.positions[i];
      
      // مركز الخلية
      const x = (i + 0.5) * (100 / cols);  // النسبة المئوية للعرض
      const y = (rowIndex + 0.5) * (100 / rows);  // النسبة المئوية للارتفاع
      
      points.push([x, y]);
    }
    
    return points;
  };
  
  // تحويل النقاط إلى مسار SVG
  const pathPoints = createPathPoints();
  let pathD = '';
  
  if (pathPoints.length > 0) {
    pathD = `M${pathPoints[0][0]},${pathPoints[0][1]}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      pathD += ` L${pathPoints[i][0]},${pathPoints[i][1]}`;
    }
  }

  return (
    <div className="payline-overlay">
      <svg width="100%" height="100%" style={{ pointerEvents: 'none' }}>
        {/* خط الدفع الأساسي */}
        <path
          d={pathD}
          stroke={lineColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
          style={{ 
            animation: 'dashoffset 2s linear infinite',
            filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.7))'
          }}
        />
        
        {/* تأثير خط الدفع الإضافي */}
        <path
          d={pathD}
          stroke="white"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5,5"
          style={{ 
            animation: 'dashoffset 1.5s linear infinite reverse',
            opacity: 0.7
          }}
        />
        
        {/* نقاط الاتصال عند كل رمز */}
        {pathPoints.map((point, index) => (
          <circle
            key={index}
            cx={point[0] + '%'}
            cy={point[1] + '%'}
            r="6"
            fill={lineColor}
            stroke="white"
            strokeWidth="1"
            opacity="0.8"
            style={{
              animation: 'pulse 1s ease-in-out infinite alternate'
            }}
          />
        ))}
        
        {/* رقم خط الدفع */}
        {pathPoints.length > 0 && (
          <text
            x={pathPoints[0][0] + '%'}
            y={pathPoints[0][1] + '%'}
            fill={lineColor}
            stroke="white"
            strokeWidth="0.5"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {payline.id + 1}
          </text>
        )}
      </svg>
    </div>
  );
};

/**
 * مكون يعرض كل خطوط الدفع النشطة
 */
interface WinPaylinesProps {
  wins: Win[];
  gridSize: { cols: number, rows: number };
  activePaylines: number;
}

export const WinPaylines: React.FC<WinPaylinesProps> = ({
  wins,
  gridSize,
  activePaylines
}) => {
  if (!wins || wins.length === 0) return null;
  
  return (
    <>
      {wins.map((win, index) => (
        win.payline && (
          <PaylineOverlay
            key={`win-${index}-${win.payline.id}`}
            payline={win.payline}
            visible={true}
            gridSize={gridSize}
            color={PAYLINE_COLORS[win.payline.id % PAYLINE_COLORS.length]}
          />
        )
      ))}
    </>
  );
};

export default PaylineOverlay;