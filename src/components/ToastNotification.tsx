import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div
        className={`px-4 py-2.5 rounded-full shadow-xl border text-xs font-bold flex items-center space-x-2 ${
          type === 'success'
            ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
            : type === 'error'
            ? 'bg-slate-900 text-red-400 border-red-500/30'
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
