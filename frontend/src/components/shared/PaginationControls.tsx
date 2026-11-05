import { Button } from "@/components/ui/button";

export function PaginationControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  return <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm"><p className="text-muted-foreground">Halaman {page} dari {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Sebelumnya</Button><Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Berikutnya</Button></div></div>;
}
