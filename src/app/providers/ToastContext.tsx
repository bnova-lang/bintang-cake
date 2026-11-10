import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    showToast(message, type);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        maxWidth: '90vw',
      }}>
        {toasts.map(toast => {
          let bg = 'var(--brown-900)';
          let color = 'var(--text-on-dark)';
          let borderColor = 'var(--gold-500)';

          if (toast.type === 'success') {
            bg = 'var(--success-600)';
            borderColor = 'var(--success-500)';
          } else if (toast.type === 'warning') {
            bg = 'var(--gold-600)';
            color = 'var(--brown-900)';
            borderColor = 'var(--gold-500)';
          } else if (toast.type === 'danger' || toast.type === 'error') {
            bg = 'var(--danger-500)';
            borderColor = 'var(--danger-500)';
          } else if (toast.type === 'info') {
            bg = 'var(--brown-800)';
            borderColor = 'var(--gold-500)';
          }

          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: bg,
                color,
                border: `1px solid ${borderColor}`,
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
                animation: 'fadeIn 0.2s ease-out',
                pointerEvents: 'auto',
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
