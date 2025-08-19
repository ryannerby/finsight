import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastProps } from '@/components/ui/toast';

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience functions for common toast types
export function useToastHelpers() {
  const { addToast } = useToast();
  
  return {
    success: (message: string, title?: string) => 
      addToast({ message, title, type: 'success', onClose: () => {} }),
    error: (message: string, title?: string) => 
      addToast({ message, title, type: 'error', onClose: () => {} }),
    warning: (message: string, title?: string) => 
      addToast({ message, title, type: 'warning', onClose: () => {} }),
    info: (message: string, title?: string) => 
      addToast({ message, title, type: 'info', onClose: () => {} }),
  };
}

// Export ToastContainer from the toast component
export { ToastContainer } from '@/components/ui/toast';
