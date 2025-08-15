import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from './toast';
import { Copy, X } from 'lucide-react';
import { Button } from './button';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  requestId?: string;
  details?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 8000 : 5000),
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const copyDetails = useCallback(async (toast: ToastMessage) => {
    const details = [
      `Error: ${toast.message}`,
      toast.requestId && `Request ID: ${toast.requestId}`,
      toast.details && `Details: ${toast.details}`,
    ].filter(Boolean).join('\n');
    
    try {
      await navigator.clipboard.writeText(details);
      // Show a brief success indicator
      const originalMessage = toast.message;
      setToasts(prev => 
        prev.map(t => 
          t.id === toast.id 
            ? { ...t, message: 'Details copied to clipboard!' }
            : t
        )
      );
      
      setTimeout(() => {
        setToasts(prev => 
          prev.map(t => 
            t.id === toast.id 
              ? { ...t, message: originalMessage }
              : t
          )
        );
      }, 1500);
    } catch (error) {
      console.error('Failed to copy details:', error);
    }
  }, []);

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              bg-card text-card-foreground border rounded-lg shadow-lg p-4 transition-all duration-300
              ${toast.type === 'success' ? 'border-green-200 bg-green-50' : ''}
              ${toast.type === 'error' ? 'border-red-200 bg-red-50' : ''}
              ${toast.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
              ${toast.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' ? 'text-green-800' : 
                  toast.type === 'error' ? 'text-red-800' : 
                  toast.type === 'warning' ? 'text-yellow-800' : 
                  'text-blue-800'
                }`}>
                  {toast.message}
                </p>
                
                {toast.requestId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Request ID: {toast.requestId}
                  </p>
                )}
                
                {/* Action buttons for error toasts */}
                {toast.type === 'error' && (toast.requestId || toast.details) && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyDetails(toast)}
                      className="h-7 px-2 text-xs flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Details
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeToast(toast.id)}
                className="h-6 w-6 p-0 flex-shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
