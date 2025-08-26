import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = ++toastIdCounter;
    const duration = toast.duration ?? 3500;
    const item = { id, ...toast };
    setToasts((prev) => [...prev, item]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    success: (message, options = {}) => push({ type: 'success', message, ...options }),
    error: (message, options = {}) => push({ type: 'error', message, ...options }),
    info: (message, options = {}) => push({ type: 'info', message, ...options }),
    warning: (message, options = {}) => push({ type: 'warning', message, ...options }),
    remove,
  }), [push, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              minWidth: 280,
              maxWidth: 420,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderLeftWidth: 6,
              borderLeftColor:
                t.type === 'success' ? '#22c55e' :
                t.type === 'error' ? '#ef4444' :
                t.type === 'warning' ? '#f59e0b' : '#3b82f6',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
              borderRadius: 8,
              padding: '10px 12px',
              color: '#111827',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {t.title || t.type}
              </div>
              <button
                onClick={() => remove(t.id)}
                style={{
                  marginLeft: 'auto',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            {t.message && (
              <div style={{ marginTop: 4, color: '#374151' }}>{t.message}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};


