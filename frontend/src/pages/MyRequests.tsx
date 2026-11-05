import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QueryState } from "@/components/shared/QueryState";
import { useOceanToast } from "@/components/ui/ocean-toast";

const statusLabels: Record<string, string> = { PENDING: "Menunggu", APPROVED: "Disetujui", REJECTED: "Ditolak", CANCELLED: "Dibatalkan" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function MyRequests() {
  const [status, setStatus] = useState("ALL");
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const requests = useQuery({ queryKey: ["my-requests"], queryFn: async () => (await api.requests.me(new URLSearchParams({ limit: "50" }))).data });
  const cancel = useMutation({ mutationFn: (id: number) => api.requests.cancel(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-requests"] }); setCancelTarget(null); success("Pengajuan dibatalkan"); }, onError: (mutationError) => error("Pembatalan gagal", getApiErrorMessage(mutationError)) });
  const filteredRequests = requests.data?.filter((item) => status === "ALL" || item.status === status);

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="page-header mb-0"><p className="text-sm font-medium text-primary">Aktivitas anggota</p><h1 className="page-title">Pengajuan Saya</h1><p className="page-subtitle">Lihat status pengajuan dan batalkan pengajuan yang belum diproses.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="ALL">Semua status</option><option value="PENDING">Menunggu</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option><option value="CANCELLED">Dibatalkan</option></select></div><QueryState isLoading={requests.isLoading} error={requests.error} empty={!requests.isLoading && !requests.error && filteredRequests?.length === 0}><div className="table-container overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Buku</th><th className="p-4">Durasi</th><th className="p-4">Tanggal</th><th className="p-4">Status</th><th className="p-4">Keterangan</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody>{filteredRequests?.map((item) => <tr key={item.id} className="border-b border-border last:border-0 align-top"><td className="p-4"><ul className="space-y-1">{item.items.map((loanItem) => <li key={loanItem.book.id} className="font-medium">{loanItem.book.title}</li>)}</ul></td><td className="p-4 whitespace-nowrap">{item.requestedDurationDays} hari</td><td className="p-4 whitespace-nowrap">{formatDate(item.createdAt)}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "PENDING" ? "bg-warning/10 text-warning" : item.status === "APPROVED" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{statusLabels[item.status] || item.status}</span></td><td className="max-w-xs p-4 text-sm text-muted-foreground">{item.rejectionReason || (item.status === "APPROVED" ? "Peminjaman dibuat setelah disetujui." : "-")}</td><td className="p-4 text-right">{item.status === "PENDING" && <Button size="sm" variant="outline" onClick={() => setCancelTarget(item.id)} disabled={cancel.isPending}><X size={15} />Batalkan</Button>}</td></tr>)}</tbody></table></div></QueryState><Dialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}><DialogContent><DialogHeader><DialogTitle>Batalkan pengajuan?</DialogTitle><DialogDescription>Pengajuan yang dibatalkan tidak dapat diproses oleh petugas.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setCancelTarget(null)}>Kembali</Button><Button variant="destructive" onClick={() => cancelTarget && cancel.mutate(cancelTarget)} disabled={cancel.isPending}>{cancel.isPending ? "Membatalkan..." : "Ya, Batalkan"}</Button></DialogFooter></DialogContent></Dialog></div>;
}
