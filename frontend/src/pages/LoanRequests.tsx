import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatStatus } from "@/lib/status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryState } from "@/components/shared/QueryState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useOceanToast } from "@/components/ui/ocean-toast";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function LoanRequests() {
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const requests = useQuery({ queryKey: ["loan-requests", status, page], queryFn: async () => api.requests.list(new URLSearchParams({ status, limit: "20", page: String(page) })) });
  const approve = useMutation({ mutationFn: (id: number) => api.requests.approve(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["loan-requests"] }); queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }); success("Pengajuan disetujui", "Peminjaman aktif berhasil dibuat."); }, onError: (mutationError) => error("Approval gagal", getApiErrorMessage(mutationError)) });
  const reject = useMutation({ mutationFn: ({ id, reason }: { id: number; reason: string }) => api.requests.reject(id, reason), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["loan-requests"] }); setRejectTarget(null); setRejectionReason(""); success("Pengajuan ditolak"); }, onError: (mutationError) => error("Penolakan gagal", getApiErrorMessage(mutationError)) });

  function submitRejection(event: React.FormEvent) {
    event.preventDefault();
    if (rejectTarget && rejectionReason.trim().length >= 3) reject.mutate({ id: rejectTarget, reason: rejectionReason.trim() });
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="page-header mb-0"><p className="text-sm font-medium text-primary">Approval petugas</p><h1 className="page-title">Pengajuan Peminjaman</h1><p className="page-subtitle">Tinjau pengajuan anggota sebelum buku diserahkan.</p></div><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="PENDING">Menunggu</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option><option value="CANCELLED">Dibatalkan</option></select></div><QueryState isLoading={requests.isLoading} error={requests.error} empty={!requests.isLoading && !requests.error && requests.data?.data.length === 0}><div className="table-container overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Anggota</th><th className="p-4">Buku yang diajukan</th><th className="p-4">Durasi</th><th className="p-4">Tanggal pengajuan</th><th className="p-4">Status</th><th className="p-4">Keterangan</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody>{requests.data?.data.map((item) => <tr key={item.id} className="border-b border-border last:border-0 align-top"><td className="p-4"><p className="font-medium">{item.member.user.name}</p><p className="text-xs text-muted-foreground">{item.member.user.email}</p></td><td className="p-4"><ul className="space-y-1">{item.items.map((loanItem) => <li key={loanItem.book.id}>{loanItem.book.title}</li>)}</ul></td><td className="p-4 whitespace-nowrap">{item.requestedDurationDays} hari</td><td className="p-4 whitespace-nowrap">{formatDate(item.createdAt)}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "PENDING" ? "bg-warning/10 text-warning" : item.status === "APPROVED" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{formatStatus(item.status)}</span></td><td className="max-w-xs p-4 text-sm text-muted-foreground">{item.rejectionReason || item.notes || "-"}</td><td className="p-4 text-right">{item.status === "PENDING" && <div className="flex justify-end gap-2"><Button size="sm" onClick={() => approve.mutate(item.id)} disabled={approve.isPending || reject.isPending}><Check size={15} />Setujui</Button><Button size="sm" variant="outline" onClick={() => { setRejectTarget(item.id); setRejectionReason(""); }} disabled={approve.isPending || reject.isPending}><X size={15} />Tolak</Button></div>}</td></tr>)}</tbody></table></div><PaginationControls page={page} totalPages={requests.data?.meta?.totalPages || 1} onPageChange={setPage} /></QueryState><Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}><DialogContent><DialogHeader><DialogTitle>Tolak pengajuan</DialogTitle><DialogDescription>Berikan alasan yang akan dilihat anggota.</DialogDescription></DialogHeader><form onSubmit={submitRejection} className="space-y-4"><div className="space-y-2"><Label htmlFor="rejection-reason">Alasan penolakan</Label><Input id="rejection-reason" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Contoh: buku sedang tidak tersedia" minLength={3} maxLength={1000} required /></div><DialogFooter><Button type="submit" disabled={reject.isPending || rejectionReason.trim().length < 3}>{reject.isPending ? "Memproses..." : "Konfirmasi Penolakan"}</Button></DialogFooter></form></DialogContent></Dialog></div>;
}
