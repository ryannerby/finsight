import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'border-success/20 bg-success/10 text-success-foreground',
    iconClassName: 'text-success'
  },
  error: {
    icon: AlertCircle,
    className: 'border-destructive/20 bg-destructive/10 text-destructive-foreground',
    iconClassName: 'text-destructive'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/20 bg-warning/10 text-warning-foreground',
    iconClassName: 'text-warning'
  },
  info: {
    icon: Info,
    className: 'border-info/20 bg-info/10 text-info-foreground',
    iconClassName: 'text-info'
  }
};

export function Toast({ id, title, message, type = 'info', duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const variant = toastVariants[type];
  const Icon = variant.icon;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={cn(
        'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-out',
        variant.className,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isExiting ? 'translate-x-full opacity-0 scale-95' : 'scale-100'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', variant.iconClassName)} />
      
      <div className="flex-1 space-y-1">
        {title && (
          <h4 className="text-sm font-medium leading-none">{title}</h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
