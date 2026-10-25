import React from 'react';
import { useUiStore } from '@/state/useUiStore';
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const ToastViewport: React.FC = () => {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconConfig = {
          info: { icon: <Info className="w-5 h-5 text-cyan-400" />, border: 'border-cyan-500/40 bg-[#131b26]' },
          success: { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, border: 'border-emerald-500/40 bg-[#131b26]' },
          warning: { icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, border: 'border-amber-500/40 bg-[#131b26]' },
          alert: { icon: <AlertOctagon className="w-5 h-5 text-rose-400" />, border: 'border-rose-500/50 bg-[#131b26]' },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-right duration-200 ${iconConfig.border}`}
          >
            <div className="shrink-0 mt-0.5">{iconConfig.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
              {toast.description && <p className="text-xs text-slate-400 mt-1">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
