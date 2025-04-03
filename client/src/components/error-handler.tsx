import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { useGlobalWebSocket } from '@/hooks/use-global-websocket';

// أنواع الأخطاء
export enum ErrorType {
  CONNECTION = 'connection',
  SERVER = 'server',
  CLIENT = 'client',
  GAME = 'game',
  AUTH = 'auth',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

// واجهة الخطأ
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: number;
  fatal?: boolean;
  code?: string;
  retryable?: boolean;
}

// Context للأخطاء العامة
export const ErrorContext = React.createContext<{
  error: AppError | null;
  setError: (error: AppError | null) => void;
  clearError: () => void;
}>({
  error: null,
  setError: () => {},
  clearError: () => {}
});

export function useError() {
  return React.useContext(ErrorContext);
}

// مزود الأخطاء العامة
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<AppError | null>(null);
  
  const clearError = () => setError(null);
  
  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
      <ErrorDialog />
    </ErrorContext.Provider>
  );
}

// مكون معالجة الأخطاء
function ErrorDialog() {
  const { error, clearError } = useError();
  const [open, setOpen] = useState(false);
  const { isConnected, connect } = useGlobalWebSocket();
  
  useEffect(() => {
    if (error) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [error]);
  
  const handleRetry = () => {
    // تعتمد إجراءات إعادة المحاولة على نوع الخطأ
    if (error?.type === ErrorType.CONNECTION && !isConnected) {
      // محاولة إعادة الاتصال
      connect(JSON.parse(localStorage.getItem('auth_user') || '{}')?.id || 0);
    }
    
    clearError();
    setOpen(false);
  };
  
  const handleClose = () => {
    clearError();
    setOpen(false);
  };
  
  // إذا لم يكن هناك خطأ، لا تعرض شيئًا
  if (!error) return null;
  
  // تحديد أيقونة الخطأ بناءً على نوعه
  let ErrorIcon = AlertCircle;
  let errorColor = 'text-red-500';
  let errorTitle = 'خطأ';
  
  switch (error.type) {
    case ErrorType.CONNECTION:
      ErrorIcon = WifiOff;
      errorTitle = 'خطأ في الاتصال';
      break;
    case ErrorType.TIMEOUT:
      ErrorIcon = AlertTriangle;
      errorColor = 'text-amber-500';
      errorTitle = 'انتهت المهلة';
      break;
    case ErrorType.AUTH:
      errorTitle = 'خطأ في المصادقة';
      break;
    case ErrorType.GAME:
      errorTitle = 'خطأ في اللعبة';
      break;
    case ErrorType.SERVER:
      errorTitle = 'خطأ في الخادم';
      break;
    case ErrorType.CLIENT:
      errorTitle = 'خطأ في التطبيق';
      break;
    case ErrorType.UNKNOWN:
    default:
      errorTitle = 'خطأ غير معروف';
      break;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ErrorIcon className={`h-5 w-5 ${errorColor}`} />
            {errorTitle}
          </DialogTitle>
          <DialogDescription>
            {error.message}
          </DialogDescription>
        </DialogHeader>
        
        {error.details && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">{error.details}</p>
          </div>
        )}
        
        <DialogFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            إغلاق
          </Button>
          
          {(error.retryable !== false) && (
            <Button
              onClick={handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// مكون لصفحة الخطأ العامة (على مستوى التطبيق)
export function GlobalErrorPage({ error }: { error: AppError }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{error.message}</h1>
      
      {error.details && (
        <p className="text-gray-500 mb-6 text-center max-w-md">{error.details}</p>
      )}
      
      <div className="flex space-x-4">
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          تحديث الصفحة
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          العودة للصفحة الرئيسية
        </Button>
      </div>
    </div>
  );
}

// مكون أخطاء محددة للواجهة
export function ErrorDisplay({ 
  title, 
  message,
  retryAction,
  closeAction
}: { 
  title: string;
  message: string;
  retryAction?: () => void;
  closeAction?: () => void;
}) {
  return (
    <div className="rounded-md bg-red-50 p-4 mt-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="mr-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          
          {(retryAction || closeAction) && (
            <div className="mt-4 flex space-x-3">
              {retryAction && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retryAction}
                  className="flex items-center gap-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  إعادة المحاولة
                </Button>
              )}
              
              {closeAction && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={closeAction}
                  className="text-xs"
                >
                  إغلاق
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}