/**
 * مكون عرض الأخطاء
 * يعرض رسالة خطأ بتصميم متناسق مع النظام
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  variant?: 'default' | 'centered' | 'card' | 'simple';
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'حدث خطأ',
  message,
  action,
  variant = 'default',
  className
}) => {
  const renderDefault = () => (
    <Alert variant="destructive" className={cn('max-w-2xl', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mr-2">{title}</AlertTitle>
      <AlertDescription className="mt-2">{message}</AlertDescription>
      {action && <div className="mt-4">{action}</div>}
    </Alert>
  );

  const renderCentered = () => (
    <div className={cn('flex flex-col items-center justify-center py-8 space-y-4', className)}>
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );

  const renderCard = () => (
    <Card className={cn('max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );

  const renderSimple = () => (
    <div className={cn('text-destructive flex items-start gap-2', className)}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );

  switch (variant) {
    case 'centered':
      return renderCentered();
    case 'card':
      return renderCard();
    case 'simple':
      return renderSimple();
    default:
      return renderDefault();
  }
};

export interface RetryErrorProps extends ErrorDisplayProps {
  onRetry: () => void;
  retryText?: string;
}

const RetryError: React.FC<RetryErrorProps> = ({
  onRetry,
  retryText = 'إعادة المحاولة',
  ...props
}) => {
  const retryButton = (
    <Button onClick={onRetry} variant="outline" size="sm" className="gap-1">
      <RefreshCw className="h-3 w-3" />
      {retryText}
    </Button>
  );

  return <ErrorDisplay {...props} action={props.action || retryButton} />;
};

export { ErrorDisplay, RetryError };
export default ErrorDisplay;