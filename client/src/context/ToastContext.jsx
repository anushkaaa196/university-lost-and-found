import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    timersRef.current[id] = setTimeout(() => {
      removeToast(id);
      delete timersRef.current[id];
    }, 4000);
    return id;
  }, [removeToast]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 dark:text-success-400" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 dark:text-red-400" />,
    info: <Info className="w-5 h-5 text-primary-600 flex-shrink-0 dark:text-primary-400" />,
  };

  const bgColors = {
    success: 'bg-success-50 border-success-200 dark:bg-success-900/30 dark:border-success-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    info: 'bg-primary-50 border-primary-200 dark:bg-primary-900/30 dark:border-primary-800',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none" id="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-xl min-w-[320px] max-w-[440px] ${
              bgColors[toast.type] || bgColors.info
            } ${toast.exiting ? 'animate-toast-out' : 'animate-toast-in'}`}
          >
            {icons[toast.type] || icons.info}
            <p className="text-sm text-slate-700 flex-1 dark:text-slate-200">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 dark:text-slate-500 dark:hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
