import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3, BookOpen, ChevronLeft, ClipboardList, Database, FileBarChart, LayoutDashboard,
  LogOut, Menu, Settings, Users, WalletCards, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";

const staffItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/petugas" },
  { icon: BookOpen, label: "Data Buku", path: "/petugas/books" },
  { icon: Database, label: "Data Master", path: "/petugas/master-data" },
  { icon: Users, label: "Anggota", path: "/petugas/members" },
  { icon: ClipboardList, label: "Pengajuan", path: "/petugas/requests" },
  { icon: BarChart3, label: "Peminjaman", path: "/petugas/loans" },
  { icon: WalletCards, label: "Denda", path: "/petugas/fines" },
  { icon: FileBarChart, label: "Laporan", path: "/petugas/reports" },
  { icon: Settings, label: "Pengaturan", path: "/petugas/settings" },
];

const memberItems = [
  { icon: BookOpen, label: "Cari Buku", path: "/catalog" },
  { icon: ClipboardList, label: "Pengajuan Saya", path: "/my-requests" },
  { icon: BarChart3, label: "Peminjaman Saya", path: "/my-loans" },
  { icon: WalletCards, label: "Denda Saya", path: "/my-fines" },
];

export function StaffSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.role === "ANGGOTA" ? memberItems : staffItems;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      <button className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Buka menu">
        <Menu size={20} />
      </button>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Tutup menu" />}
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && <div className="flex items-center gap-3"><div className="gradient-ocean flex h-9 w-9 items-center justify-center rounded-xl"><BookOpen size={19} className="text-white" /></div><span className="font-semibold text-sidebar-primary">Perpus SKB</span></div>}
          <button onClick={() => (window.innerWidth < 768 ? setMobileOpen(false) : setCollapsed(!collapsed))} className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent" aria-label="Ubah menu">
            {mobileOpen ? <X size={20} /> : collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <div className="px-4 py-5">
          {!collapsed && <><p className="text-xs uppercase tracking-wider text-sidebar-foreground/50">Menu utama</p><p className="mt-1 text-sm text-sidebar-foreground/80">{user?.role === "ANGGOTA" ? "Area Anggota" : "Panel Pengelola"}</p></>}
        </div>
        <nav className="flex-1 overflow-hidden px-3">
          <ul className="space-y-1">
            {items.map((item) => <li key={item.path}><NavLink to={item.path} onClick={() => setMobileOpen(false)} end={item.path === "/petugas"} className={({ isActive }) => cn("nav-item", isActive && "nav-item-active", collapsed && "justify-center px-2")}><item.icon size={20} />{!collapsed && <span>{item.label}</span>}</NavLink></li>)}
          </ul>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && user && <div className="mb-2 truncate px-3 text-xs text-sidebar-foreground/60">{user.name}</div>}
          <button onClick={handleLogout} className={cn("nav-item w-full text-sidebar-foreground/70 hover:text-sidebar-foreground", collapsed && "justify-center px-2")}><LogOut size={20} />{!collapsed && <span>Keluar</span>}</button>
        </div>
      </aside>
    </>
  );
}
