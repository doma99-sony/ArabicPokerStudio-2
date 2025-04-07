// مكون خط الدفع للعبة صياد السمك
import React, { useEffect, useRef } from 'react';
import { Payline } from '../types';

interface PaylineOverlayProps {
  payline: Payline;
  color: string;
}

/**
 * مكون خط الدفع
 * يعرض خط الدفع الفائز على الشاشة
 */
const PaylineOverlay: React.FC<PaylineOverlayProps> = ({ payline, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // رسم خط الدفع على الشاشة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تعيين عرض وارتفاع الكانفاس
    const reelsContainer = canvas.parentElement;
    if (reelsContainer) {
      canvas.width = reelsContainer.clientWidth;
      canvas.height = reelsContainer.clientHeight;
    }
    
    // مسح الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم خط الدفع
    ctx.beginPath();
    
    // حساب موقع كل رمز في خط الدفع
    const positions = payline.positions.map(([reelIndex, rowIndex]) => {
      // حساب الموقع الفعلي على الشاشة
      const reelWidth = canvas.width / 5; // 5 بكرات
      const rowHeight = canvas.height / 3; // 3 صفوف
      
      const x = reelWidth * reelIndex + reelWidth / 2;
      const y = rowHeight * rowIndex + rowHeight / 2;
      
      return { x, y };
    });
    
    // إذا لم يوجد مواقع، نخرج
    if (positions.length === 0) return;
    
    // ضبط خصائص الخط
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    // رسم الخط
    ctx.moveTo(positions[0].x, positions[0].y);
    for (let i = 1; i < positions.length; i++) {
      ctx.lineTo(positions[i].x, positions[i].y);
    }
    
    ctx.stroke();
    
    // رسم نقاط على الخط
    ctx.fillStyle = color;
    positions.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // إنشاء التأثير البصري المتحرك
    let progress = 0;
    const animatePayline = () => {
      // مسح القماش
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // رسم الخط الأساسي
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.moveTo(positions[0].x, positions[0].y);
      for (let i = 1; i < positions.length; i++) {
        ctx.lineTo(positions[i].x, positions[i].y);
      }
      ctx.stroke();
      
      // إنشاء نبض على طول الخط
      const pulseWidth = 50;
      const pulsePosition = progress * (positions.length - 1);
      const segmentIndex = Math.floor(pulsePosition);
      const segmentProgress = pulsePosition - segmentIndex;
      
      if (segmentIndex < positions.length - 1) {
        const startPos = positions[segmentIndex];
        const endPos = positions[segmentIndex + 1];
        
        const pulseX = startPos.x + (endPos.x - startPos.x) * segmentProgress;
        const pulseY = startPos.y + (endPos.y - startPos.y) * segmentProgress;
        
        // رسم النبض
        const gradient = ctx.createRadialGradient(
          pulseX, pulseY, 0,
          pulseX, pulseY, pulseWidth
        );
        gradient.addColorStop(0, `${color}cc`);
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, pulseWidth, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // تقدم التأثير
      progress += 0.01;
      if (progress > 1) progress = 0;
      
      // استمرار التأثير
      requestAnimationFrame(animatePayline);
    };
    
    // بدء التأثير
    const animation = requestAnimationFrame(animatePayline);
    
    return () => cancelAnimationFrame(animation);
  }, [payline, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="payline-overlay" 
      data-payline-id={payline.id}
    />
  );
};

export default PaylineOverlay;