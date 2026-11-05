import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatStatus } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryState } from "@/components/shared/QueryState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useAuth } from "@/auth/AuthContext";
import { useOceanToast } from "@/components/ui/ocean-toast";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function Loans() {
  const { user } = useAuth();
  const [loanFilter, setLoanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const [returnTarget, setReturnTarget] = useState<{ loanId: number; itemId: number; bookTitle: string } | null>(null);
  const [returnStatus, setReturnStatus] = useState<"ON_TIME" | "LATE">("ON_TIME");
  const [lateDays, setLateDays] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const query = useQuery({ queryKey: ["loans", user?.role, loanFilter, page], queryFn: async () => { const params = new URLSearchParams({ limit: "20", page: String(page) }); if (loanFilter === "returned") params.set("status", "RETURNED"); if (user?.role === "ANGGOTA") return api.loans.me(params); if (loanFilter === "overdue") return api.loans.overdue(params); const response = await api.loans.list(params); return loanFilter === "active" ? { ...response, data: response.data.filter((loan) => loan.status === "BORROWED" || loan.status === "PARTIALLY_RETURNED") } : response; } });
  const returnItem = useMutation({ mutationFn: ({ loanId, itemId, returnStatus, lateDays, notes }: { loanId: number; itemId: number; returnStatus: "ON_TIME" | "LATE"; lateDays?: number; notes?: string }) => api.loans.returnItem(loanId, itemId, { returnStatus, lateDays, notes }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["loans"] }); queryClient.invalidateQueries({ queryKey: ["fines"] }); queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }); setReturnTarget(null); setReturnStatus("ON_TIME"); setLateDays(""); setReturnNotes(""); success("Buku dikembalikan"); }, onError: (mutationError) => error("Pengembalian gagal", getApiErrorMessage(mutationError)) });

  function openReturnDialog(loanId: number, itemId: number, bookTitle: string) {
    setReturnTarget({ loanId, itemId, bookTitle });
    setReturnStatus("ON_TIME");
    setLateDays("");
    setReturnNotes("");
  }

  function submitReturn(event: React.FormEvent) {
    event.preventDefault();

    if (!returnTarget) {
      return;
    }

    if (returnStatus === "LATE") {
      const parsedLateDays = Number(lateDays);
      if (!Number.isInteger(parsedLateDays) || parsedLateDays < 1) {
        error("Jumlah hari terlambat belum valid", "Masukkan jumlah hari terlambat yang benar.");
        return;
      }

      returnItem.mutate({ ...returnTarget, returnStatus, lateDays: parsedLateDays, notes: returnNotes || undefined });
      return;
    }

    returnItem.mutate({ ...returnTarget, returnStatus, notes: returnNotes || undefined });
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="page-header mb-0"><p className="text-sm font-medium text-primary">Sirkulasi koleksi</p><h1 className="page-title">{user?.role === "ANGGOTA" ? "Peminjaman Saya" : "Peminjaman"}</h1><p className="page-subtitle">Pantau buku yang sedang dipinjam dan tanggal jatuh temponya.</p></div>{user?.role !== "ANGGOTA" && <select value={loanFilter} onChange={(event) => { setLoanFilter(event.target.value); setPage(1); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="all">Semua peminjaman</option><option value="active">Sedang dipinjam</option><option value="overdue">Terlambat</option><option value="returned">Sudah dikembalikan</option></select>}</div><QueryState isLoading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error && query.data?.data.length === 0}><div className="table-container overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Kode</th><th className="p-4">Anggota</th><th className="p-4">Buku</th><th className="p-4">Dipinjam</th><th className="p-4">Jatuh tempo</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody>{query.data?.data.map((loan) => <tr key={loan.id} className="border-b border-border last:border-0 align-top"><td className="p-4 font-mono text-xs text-primary">{loan.loanCode}</td><td className="p-4"><p className="font-medium">{loan.member.user.name}</p><p className="text-xs text-muted-foreground">{loan.member.user.email}</p></td><td className="p-4"><div className="space-y-2">{loan.items.map((item) => <div key={item.id}><p className="font-medium">{item.bookCopy.book.title}</p><p className="text-xs text-muted-foreground">{item.returnedAt ? `Dikembalikan ${formatDate(item.returnedAt)}` : "Belum dikembalikan"}</p></div>)}</div></td><td className="p-4 whitespace-nowrap">{formatDate(loan.borrowedAt)}</td><td className="p-4 whitespace-nowrap">{formatDate(loan.dueAt)}</td><td className="p-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${loan.status === "RETURNED" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{formatStatus(loan.status)}</span></td><td className="p-4 text-right"><div className="space-y-2">{user?.role !== "ANGGOTA" && loan.items.filter((item) => !item.returnedAt).map((item) => <Button key={item.id} size="sm" variant="outline" onClick={() => openReturnDialog(loan.id, item.id, item.bookCopy.book.title)} disabled={returnItem.isPending}><RotateCcw size={15} />Kembalikan</Button>)}{loan.status === "RETURNED" && <span className="text-xs text-muted-foreground">Tidak ada aksi</span>}</div></td></tr>)}</tbody></table></div><PaginationControls page={page} totalPages={query.data?.meta?.totalPages || 1} onPageChange={setPage} /></QueryState><Dialog open={returnTarget !== null} onOpenChange={(open) => !open && setReturnTarget(null)}><DialogContent><DialogHeader><DialogTitle>Kembalikan buku</DialogTitle><DialogDescription>{returnTarget?.bookTitle || "Buku"}</DialogDescription></DialogHeader><form onSubmit={submitReturn} className="space-y-4"><div className="space-y-2"><Label>Pengembalian</Label><select value={returnStatus} onChange={(event) => setReturnStatus(event.target.value as "ON_TIME" | "LATE")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="ON_TIME">Tepat Waktu</option><option value="LATE">Terlambat</option></select></div>{returnStatus === "LATE" && <div className="space-y-2"><Label>Jumlah hari terlambat</Label><Input type="number" min={1} step={1} value={lateDays} onChange={(event) => setLateDays(event.target.value)} placeholder="Contoh: 3" /></div>}<div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">Denda akan dihitung otomatis berdasarkan jumlah hari keterlambatan.</div><div className="space-y-2"><Label>Catatan <span className="font-normal text-muted-foreground">(opsional)</span></Label><Input value={returnNotes} onChange={(event) => setReturnNotes(event.target.value)} maxLength={1000} placeholder="Tambahkan catatan pengembalian" /></div><DialogFooter><Button type="submit" disabled={returnItem.isPending}>{returnItem.isPending ? "Memproses..." : "Konfirmasi Pengembalian"}</Button></DialogFooter></form></DialogContent></Dialog></div>;
}
