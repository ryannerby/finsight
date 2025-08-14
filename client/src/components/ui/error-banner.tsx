import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export function ErrorBanner({ 
  error, 
  onRetry, 
  onDismiss, 
  className,
  variant = 'destructive' 
}: ErrorBannerProps) {
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const iconClasses = {
    default: 'text-blue-500',
    destructive: 'text-red-500',
    warning: 'text-yellow-500'
  };

  return (
    <div className={cn(
      'border rounded-lg p-4 flex items-start gap-3',
      variantClasses[variant],
      className
    )}>
      <AlertTriangle className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconClasses[variant])} />
      
      <div className="flex-1 min-w-0">
        <p className="font-medium mb-1">Something went wrong</p>
        <p className="text-sm opacity-90">{error}</p>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className={cn(
              'h-8 px-3',
              variant === 'default' && 'border-blue-300 text-blue-700 hover:bg-blue-100',
              variant === 'destructive' && 'border-red-300 text-red-700 hover:bg-red-100',
              variant === 'warning' && 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
            )}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
        
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className={cn(
              'h-8 w-8 p-0',
              variant === 'default' && 'text-blue-600 hover:bg-blue-100',
              variant === 'destructive' && 'text-red-600 hover:bg-red-100',
              variant === 'warning' && 'text-yellow-600 hover:bg-yellow-100'
            )}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
