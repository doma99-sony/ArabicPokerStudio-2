/**
 * مكون التحميل
 * يعرض مؤشر تحميل متحرك للمستخدم أثناء انتظار البيانات
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  text?: string;
  className?: string;
  variant?: 'default' | 'centered' | 'inline' | 'page';
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({
  text,
  className,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderDefault = () => (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );

  const renderCentered = () => (
    <div className={cn('flex flex-col items-center justify-center py-8 space-y-4', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'lg'], 'text-primary')} />
      {text && <p className="text-muted-foreground text-center font-medium">{text}</p>}
    </div>
  );

  const renderInline = () => (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </span>
  );

  const renderPage = () => (
    <div className={cn('w-full h-[50vh] flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses['lg'], 'text-primary')} />
      {text && <p className="text-muted-foreground mt-4 text-lg">{text}</p>}
    </div>
  );

  switch (variant) {
    case 'centered':
      return renderCentered();
    case 'inline':
      return renderInline();
    case 'page':
      return renderPage();
    default:
      return renderDefault();
  }
};

export { Loading };
export default Loading;