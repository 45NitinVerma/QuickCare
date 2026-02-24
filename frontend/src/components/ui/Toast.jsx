import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} className="shrink-0" />,
  error:   <XCircle    size={18} className="shrink-0" />,
  warning: <AlertTriangle size={18} className="shrink-0" />,
  info:    <Info       size={18} className="shrink-0" />,
};

const STYLES = {
  success: "bg-[var(--success-light)] text-[var(--accent)] border-green-200 dark:border-green-900/40",
  error:   "bg-[var(--danger-light)] text-[var(--danger)] border-red-200 dark:border-red-900/40",
  warning: "bg-[var(--warning-light)] text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
  info:    "bg-[var(--info-light)] text-[var(--info)] border-blue-200 dark:border-blue-900/40",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Portal */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm ${STYLES[t.type]}`}
            >
              <span className="mt-0.5">{ICONS[t.type]}</span>
              <div className="flex-1 min-w-0">
                {t.title && <p className="font-semibold text-sm">{t.title}</p>}
                {t.message && <p className="text-xs mt-0.5 opacity-80">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="p-1 rounded-lg hover:opacity-70 transition-opacity shrink-0 pointer-events-auto"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
