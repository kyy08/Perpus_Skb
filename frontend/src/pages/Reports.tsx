import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileBarChart } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/shared/QueryState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOceanToast } from "@/components/ui/ocean-toast";

type ReportTab = "loans" | "fines";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

function downloadFile(buffer: ArrayBuffer, filename: string) {
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("loans");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { success, error } = useOceanToast();
  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const loans = useQuery({ queryKey: ["report-loans", startDate, endDate], queryFn: async () => (await api.reports.loans(params)).data, enabled: activeTab === "loans" && !invalidDateRange });
  const fines = useQuery({ queryKey: ["report-fines", startDate, endDate], queryFn: async () => (await api.reports.fines(params)).data, enabled: activeTab === "fines" && !invalidDateRange });

  async function exportReport(type: ReportTab) {
    try {
      const buffer = await (type === "loans" ? api.reports.exportLoans(params) : api.reports.exportFines(params));
      downloadFile(buffer, `laporan-${type}.xlsx`);
      success("Laporan siap", "File Excel berhasil diunduh.");
    } catch (requestError) {
      error("Export gagal", getApiErrorMessage(requestError, "Coba lagi."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <p className="text-sm font-medium text-primary">Insight sirkulasi</p>
        <h1 className="page-title">Laporan</h1>
        <p className="page-subtitle">Pilih jenis laporan dan unduh rekap dalam format Excel.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-end">
        <div className="space-y-2"><label className="text-sm font-medium">Dari tanggal</label><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Sampai tanggal</label><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} aria-invalid={invalidDateRange} />{invalidDateRange && <p className="text-xs text-destructive">Tanggal akhir tidak boleh sebelum tanggal mulai.</p>}</div>
        <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); }}>Reset</Button>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportTab)} className="w-full">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 rounded-xl bg-muted p-1">
          <TabsTrigger value="loans" className="py-2.5">Peminjaman</TabsTrigger>
          <TabsTrigger value="fines" className="py-2.5">Denda</TabsTrigger>
        </TabsList>
        <TabsContent value="loans">
          <div className="table-container">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileBarChart size={20} /></div><div><h2 className="font-semibold">Laporan peminjaman</h2><p className="mt-1 text-sm text-muted-foreground">{loans.data?.length || 0} transaksi pada periode ini.</p></div></div>
              <Button size="sm" onClick={() => exportReport("loans")}><Download size={15} />Excel</Button>
            </div>
            <QueryState isLoading={loans.isLoading} error={loans.error} empty={!loans.isLoading && !loans.error && loans.data?.length === 0}>
              <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Kode</th><th className="p-4">Anggota</th><th className="p-4">Buku</th><th className="p-4">Dipinjam</th><th className="p-4">Jatuh tempo</th><th className="p-4">Status</th></tr></thead><tbody>{loans.data?.slice(0, 8).map((loan) => <tr key={loan.id} className="border-b border-border last:border-0 align-top"><td className="p-4 font-mono text-xs text-primary">{loan.loanCode}</td><td className="p-4"><p className="font-medium">{loan.member.user.name}</p><p className="text-xs text-muted-foreground">{loan.member.user.email}</p></td><td className="p-4"><div className="space-y-2">{loan.items.map((item) => <div key={item.id}><p className="font-medium">{item.bookCopy.book.title}</p><p className="text-xs text-muted-foreground">{item.returnedAt ? `Dikembalikan ${formatDate(item.returnedAt)}` : "Belum dikembalikan"}</p></div>)}</div></td><td className="p-4 whitespace-nowrap">{formatDate(loan.borrowedAt)}</td><td className="p-4 whitespace-nowrap">{formatDate(loan.dueAt)}</td><td className="p-4"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{loan.status}</span></td></tr>)}</tbody></table></div>
            </QueryState>
          </div>
        </TabsContent>
        <TabsContent value="fines">
          <div className="table-container">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileBarChart size={20} /></div><div><h2 className="font-semibold">Laporan denda</h2><p className="mt-1 text-sm text-muted-foreground">{fines.data?.length || 0} denda pada periode ini.</p></div></div><Button size="sm" onClick={() => exportReport("fines")}><Download size={15} />Excel</Button></div>
            <QueryState isLoading={fines.isLoading} error={fines.error} empty={!fines.isLoading && !fines.error && fines.data?.length === 0}>
              <div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Anggota</th><th className="p-4">Buku</th><th className="p-4">Terlambat</th><th className="p-4">Nominal</th><th className="p-4">Status</th><th className="p-4">Tanggal</th></tr></thead><tbody>{fines.data?.slice(0, 8).map((fine) => <tr key={fine.id} className="border-b border-border last:border-0"><td className="p-4"><p className="font-medium">{fine.member.user.name}</p><p className="text-xs text-muted-foreground">{fine.member.user.email}</p></td><td className="p-4">{fine.loanItem.bookCopy.book.title}</td><td className="p-4">{fine.lateDays} hari</td><td className="p-4 font-semibold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(fine.amount))}</td><td className="p-4"><span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">{fine.status}</span></td><td className="p-4 whitespace-nowrap">{formatDate(fine.createdAt)}</td></tr>)}</tbody></table></div>
            </QueryState>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
