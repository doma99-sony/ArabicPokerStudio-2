/**
 * مكون زر الرجوع للخلف
 * يستخدم للتنقل إلى الصفحة السابقة
 */

import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to?: string;
  label?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'العودة',
  variant = 'outline',
  size = 'default',
  className,
  onClick
}) => {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      // إذا لم يتم تحديد وجهة محددة، ارجع للخلف في تاريخ التصفح
      window.history.back();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('flex items-center gap-2 rtl:flex-row-reverse', className)}
      onClick={handleClick}
    >
      <ArrowRight className="h-4 w-4" />
      {label}
    </Button>
  );
};

export { BackButton };
export default BackButton;