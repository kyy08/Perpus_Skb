import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleDollarSign, ShieldOff } from "lucide-react";
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

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function Fines() {
  const { user } = useAuth();
  const [status, setStatus] = useState("UNPAID");
  const [page, setPage] = useState(1);
  const [waiveTarget, setWaiveTarget] = useState<number | null>(null);
  const [waiveNotes, setWaiveNotes] = useState("");
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const fines = useQuery({ queryKey: ["fines", user?.role, status, page], queryFn: async () => { const params = new URLSearchParams({ limit: "20", page: String(page) }); if (status !== "ALL") params.set("status", status); return user?.role === "ANGGOTA" ? api.fines.me(params) : api.fines.list(params); } });
  const pay = useMutation({ mutationFn: (id: number) => api.fines.pay(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["fines"] }); queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }); success("Denda ditandai lunas"); }, onError: (mutationError) => error("Gagal memproses denda", getApiErrorMessage(mutationError)) });
  const waive = useMutation({ mutationFn: ({ id, notes }: { id: number; notes: string }) => api.fines.waive(id, notes), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["fines"] }); queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }); setWaiveTarget(null); setWaiveNotes(""); success("Denda dibebaskan"); }, onError: (mutationError) => error("Gagal membebaskan denda", getApiErrorMessage(mutationError)) });

  function submitWaive(event: React.FormEvent) {
    event.preventDefault();
    if (waiveTarget && waiveNotes.trim().length >= 3) waive.mutate({ id: waiveTarget, notes: waiveNotes.trim() });
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="page-header mb-0"><p className="text-sm font-medium text-primary">Administrasi keterlambatan</p><h1 className="page-title">Denda</h1><p className="page-subtitle">Pantau dan proses denda keterlambatan pengembalian buku.</p></div>{user?.role !== "ANGGOTA" && <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="UNPAID">Belum lunas</option><option value="PAID">Lunas</option><option value="WAIVED">Dibebaskan</option><option value="ALL">Semua status</option></select>}</div><QueryState isLoading={fines.isLoading} error={fines.error} empty={!fines.isLoading && !fines.error && fines.data?.data.length === 0}><div className="table-container overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Anggota</th><th className="p-4">Buku</th><th className="p-4">Terlambat</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody>{fines.data?.data.map((fine) => <tr key={fine.id} className="border-b border-border last:border-0"><td className="p-4"><p className="font-medium">{fine.member.user.name}</p><p className="text-xs text-muted-foreground">{fine.member.user.email}</p></td><td className="p-4">{fine.loanItem.bookCopy.book.title}</td><td className="p-4">{fine.lateDays} hari</td><td className="p-4 font-semibold">{currency.format(Number(fine.amount))}</td><td className="p-4"><span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">{formatStatus(fine.status)}</span></td><td className="p-4"><div className="flex justify-end gap-2">{user?.role !== "ANGGOTA" && fine.status === "UNPAID" && <><Button size="sm" onClick={() => pay.mutate(fine.id)} disabled={pay.isPending || waive.isPending}><CircleDollarSign size={15} />Bayar</Button><Button size="sm" variant="outline" onClick={() => { setWaiveTarget(fine.id); setWaiveNotes(""); }} disabled={pay.isPending || waive.isPending}><ShieldOff size={15} />Bebaskan</Button></>}</div></td></tr>)}</tbody></table></div><PaginationControls page={page} totalPages={fines.data?.meta?.totalPages || 1} onPageChange={setPage} /></QueryState><Dialog open={waiveTarget !== null} onOpenChange={(open) => !open && setWaiveTarget(null)}><DialogContent><DialogHeader><DialogTitle>Bebaskan denda</DialogTitle><DialogDescription>Alasan pembebasan wajib diisi.</DialogDescription></DialogHeader><form onSubmit={submitWaive} className="space-y-4"><div className="space-y-2"><Label htmlFor="waive-notes">Alasan</Label><Input id="waive-notes" value={waiveNotes} onChange={(event) => setWaiveNotes(event.target.value)} placeholder="Contoh: dispensasi dari petugas" required minLength={3} maxLength={500} /></div><DialogFooter><Button type="submit" disabled={waive.isPending || waiveNotes.trim().length < 3}>{waive.isPending ? "Memproses..." : "Konfirmasi Pembebasan"}</Button></DialogFooter></form></DialogContent></Dialog></div>;
}
