import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface OceanConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

const variantStyles = {
  danger: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    ring: "ring-rose-200",
    confirmClass:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-200",
    confirmClass:
      "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25",
  },
  info: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    ring: "ring-sky-200",
    confirmClass:
      "gradient-ocean text-primary-foreground shadow-lg",
  },
};

export function OceanConfirmDialog({
  open,
  onOpenChange,
  title = "Hapus data?",
  description = "Tindakan ini tidak dapat dibatalkan. Data yang sudah dihapus tidak bisa dikembalikan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  loading = false,
  onConfirm,
  children,
}: OceanConfirmDialogProps) {
  const styles = variantStyles[variant];

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Trigger asChild>{children}</AlertDialogPrimitive.Trigger>
      <AnimatePresence>
        {open && (
          <AlertDialogPrimitive.Portal forceMount>
            <AlertDialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm"
              />
            </AlertDialogPrimitive.Overlay>
            <AlertDialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "calc(-50% + 16px)" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "calc(-50% + 16px)" }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
                className={cn(
                  "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
                  "rounded-2xl border border-border bg-card p-0 shadow-2xl",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {/* Decorative top gradient line */}
                <div
                  className={cn(
                    "h-1.5 w-full rounded-t-2xl",
                    variant === "danger" && "bg-rose-500",
                    variant === "warning" && "bg-amber-500",
                    variant === "info" && "gradient-ocean"
                  )}
                />

                <div className="p-6 sm:p-8">
                  {/* Close button */}
                  <button
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                    className="absolute right-4 top-5 rounded-full p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Tutup"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Icon */}
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
                        styles.iconBg,
                        styles.iconColor,
                        styles.ring
                      )}
                    >
                      <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Text */}
                  <AlertDialogPrimitive.Title className="text-xl font-semibold tracking-tight text-foreground">
                    {title}
                  </AlertDialogPrimitive.Title>
                  <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </AlertDialogPrimitive.Description>

                  {/* Actions */}
                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                      className="w-full rounded-xl border-border bg-card px-6 text-foreground hover:bg-muted hover:text-foreground sm:w-auto"
                    >
                      {cancelLabel}
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={loading}
                      className={cn(
                        "w-full rounded-xl px-6 transition-all duration-200 sm:w-auto",
                        styles.confirmClass
                      )}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Memproses…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          {confirmLabel}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AlertDialogPrimitive.Content>
          </AlertDialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </AlertDialogPrimitive.Root>
  );
}

export function useOceanConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<OceanConfirmDialogProps>>({});

  const show = React.useCallback((newConfig: Omit<OceanConfirmDialogProps, "open" | "onOpenChange">) => {
    setConfig(newConfig);
    setOpen(true);
  }, []);

  const hide = React.useCallback(() => setOpen(false), []);

  const dialog = (
    <OceanConfirmDialog
      open={open}
      onOpenChange={setOpen}
      {...(config as OceanConfirmDialogProps)}
    />
  );

  return { show, hide, dialog, open, setOpen };
}
