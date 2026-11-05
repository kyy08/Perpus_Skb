import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Icon mapping
const toastIcons: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string; progress: string }> = {
  success: {
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
    border: "border-emerald-200",
    progress: "bg-emerald-500",
  },
  error: {
    bg: "bg-rose-50",
    icon: "text-rose-500",
    border: "border-rose-200",
    progress: "bg-rose-500",
  },
  warning: {
    bg: "bg-amber-50",
    icon: "text-amber-500",
    border: "border-amber-200",
    progress: "bg-amber-500",
  },
  info: {
    bg: "bg-sky-50",
    icon: "text-sky-500",
    border: "border-sky-200",
    progress: "bg-sky-500",
  },
};

// Individual Toast Item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];
  const duration = toast.duration ?? 4000;

  React.useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border bg-white/95 backdrop-blur-md p-4 pr-8 shadow-card",
        styles.border
      )}
    >
      {/* Animated progress bar */}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-transparent">
        <motion.div
          className={cn("h-full rounded-full", styles.progress)}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </div>

      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          styles.bg
        )}
      >
        <Icon className={cn("h-5 w-5", styles.icon)} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            {toast.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// Provider Component
export function OceanToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Hook
export function useOceanToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useOceanToast must be used within OceanToastProvider");
  }

  return {
    success: (title: string, description?: string, duration?: number) =>
      context.addToast({ type: "success", title, description, duration }),
    error: (title: string, description?: string, duration?: number) =>
      context.addToast({ type: "error", title, description, duration }),
    warning: (title: string, description?: string, duration?: number) =>
      context.addToast({ type: "warning", title, description, duration }),
    info: (title: string, description?: string, duration?: number) =>
      context.addToast({ type: "info", title, description, duration }),
    dismiss: context.removeToast,
  };
}
