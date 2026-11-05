import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, ClipboardList, Library, Users, WalletCards } from "lucide-react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/staff/StatCard";
import { QueryState } from "@/components/shared/QueryState";
import { useAuth } from "@/auth/AuthContext";

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default function Dashboard() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["dashboard-summary"], queryFn: async () => (await api.dashboard.summary()).data, enabled: user?.role !== "ANGGOTA" });

  return <QueryState isLoading={query.isLoading} error={query.error}>
    <div className="space-y-6">
      <div className="page-header"><p className="text-sm font-medium text-primary">Ringkasan perpustakaan</p><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Pantau koleksi dan aktivitas peminjaman SKB Kota Tegal.</p></div>
      {query.data && <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Judul Buku" value={query.data.totalBooks} subtitle={`${query.data.totalCopies} buku`} icon={BookOpen} variant="primary" />
          <StatCard title="Anggota Aktif" value={query.data.totalMembers} subtitle="Terdaftar di sistem" icon={Users} variant="secondary" />
          <StatCard title="Peminjaman Aktif" value={query.data.activeLoans} subtitle={`${query.data.availableCopies} buku tersedia`} icon={Library} variant="success" />
          <StatCard title="Menunggu Approval" value={query.data.pendingRequests} subtitle="Pengajuan baru" icon={ClipboardList} variant="warning" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="stat-card lg:col-span-2"><div className="flex items-center gap-4"><div className="stat-icon bg-destructive/10 text-destructive"><AlertTriangle size={24} /></div><div><p className="text-sm text-muted-foreground">Peminjaman terlambat</p><p className="text-3xl font-bold">{query.data.overdueLoans}</p><p className="text-xs text-muted-foreground">Perlu ditindaklanjuti petugas</p></div></div></div>
          <div className="stat-card"><div className="flex items-center gap-4"><div className="stat-icon bg-warning/10 text-warning"><WalletCards size={24} /></div><div><p className="text-sm text-muted-foreground">Denda belum lunas</p><p className="text-2xl font-bold">{currency.format(Number(query.data.unpaidFines.amount))}</p><p className="text-xs text-muted-foreground">{query.data.unpaidFines.count} catatan denda</p></div></div></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-card"><h2 className="font-semibold">Ketersediaan koleksi</h2><div className="mt-5 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${query.data.totalCopies ? (query.data.availableCopies / query.data.totalCopies) * 100 : 0}%` }} /></div><div className="mt-3 flex justify-between text-sm text-muted-foreground"><span>{query.data.availableCopies} tersedia</span><span>{query.data.borrowedCopies} sedang dipinjam</span></div></div>
      </>}
    </div>
  </QueryState>;
}
