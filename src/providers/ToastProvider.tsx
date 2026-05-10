"use client";

import { createContext, useContext, useCallback, useState } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = `toast-${Date.now()}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 space-y-3 max-w-[min(100vw-2rem,24rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4"
        >
          {toast.type === "success" && (
            <CheckCircle size={18} className="text-green-400 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          {toast.type === "info" && (
            <Info size={18} className="text-blue-400 shrink-0" />
          )}
          <p className="text-sm text-white">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-4 text-white/40 hover:text-white/70 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
