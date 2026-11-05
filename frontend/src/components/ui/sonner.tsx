import { Toaster as Sonner, toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const CustomToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors={false}
      closeButton
      className="toaster group"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: cn(
            "group toast",
            "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-8",
            "bg-white/95 backdrop-blur-md shadow-card",
            "transition-all duration-300",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-5",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
            "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full"
          ),
          title: "text-sm font-semibold leading-tight",
          description: "text-xs leading-relaxed opacity-80 mt-0.5",
          actionButton: cn(
            "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium",
            "bg-ocean-soft text-white hover:bg-ocean-deep transition-colors"
          ),
          cancelButton: cn(
            "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium",
            "bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          ),
          closeButton: cn(
            "absolute right-2 top-2 rounded-md p-1 text-muted-foreground/60",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:text-foreground hover:bg-muted/50"
          ),
        },
      }}
      style={{
        // Override default sonner styles for our custom look
        // We want the toast to be elegant
      }}
      {...props}
    />
  );
};

// Custom styled toasts with icons
interface ToastStyle {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  progressColor: string;
}

const toastStyles: Record<string, ToastStyle> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-200",
    progressColor: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    borderColor: "border-rose-200",
    progressColor: "bg-rose-500",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-200",
    progressColor: "bg-amber-500",
  },
  info: {
    icon: Info,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    borderColor: "border-sky-200",
    progressColor: "bg-sky-500",
  },
};

function customToast(
  type: "success" | "error" | "warning" | "info",
  title: string,
  description?: string,
  options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }
) {
  const style = toastStyles[type];
  const Icon = style.icon;

  toast.custom(
    (t) => (
      <div
        className={cn(
          "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border bg-white/95 backdrop-blur-md p-4 pr-8 shadow-card",
          style.borderColor
        )}
        style={{
          animation: "fade-in 0.3s ease-out, slide-in 0.3s ease-out",
        }}
      >
        {/* Progress bar */}
        <div
          className={cn("absolute bottom-0 left-0 h-0.5 rounded-full", style.progressColor)}
          style={{
            width: "100%",
            animation: `shrink ${options?.duration ?? 4000}ms linear forwards`,
          }}
        />

        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            style.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", style.iconColor)} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {description}
            </p>
          )}
          {options?.action && (
            <button
              onClick={() => {
                options.action!.onClick();
                toast.dismiss(t);
              }}
              className="mt-2 text-xs font-medium text-ocean-soft hover:text-ocean-deep transition-colors underline underline-offset-2"
            >
              {options.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => toast.dismiss(t)}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    ),
    {
      duration: options?.duration ?? 4000,
    }
  );
}

export const oceanToast = {
  success: (title: string, description?: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
    customToast("success", title, description, options),
  error: (title: string, description?: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
    customToast("error", title, description, options),
  warning: (title: string, description?: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
    customToast("warning", title, description, options),
  info: (title: string, description?: string, options?: { duration?: number; action?: { label: string; onClick: () => void } }) =>
    customToast("info", title, description, options),
  dismiss: toast.dismiss,
};

export { CustomToaster as Toaster, toast };
