import { AlertCircle, Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";

export function QueryState({ isLoading, error, empty, children }: { isLoading?: boolean; error?: unknown; empty?: boolean; children: React.ReactNode }) {
  if (isLoading) return <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12 text-muted-foreground"><Loader2 className="mr-2 animate-spin" size={18} /> Memuat data...</div>;
  if (error) return <div className="flex items-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-destructive"><AlertCircle className="mr-2" size={18} /> {getApiErrorMessage(error, "Gagal memuat data. Pastikan backend aktif.")}</div>;
  if (empty) return <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">Belum ada data.</div>;
  return <>{children}</>;
}
