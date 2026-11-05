import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export function StaffHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6">
      <div className="flex h-full items-center justify-between gap-4 pl-10 md:pl-0">
        <div className="relative hidden w-full max-w-md sm:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input placeholder="Cari data perpustakaan..." className="border-0 bg-muted/50 pl-10 focus-visible:ring-primary" /></div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="relative"><Bell size={19} className="text-muted-foreground" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3"><div className="gradient-ocean flex h-8 w-8 items-center justify-center rounded-full"><User size={16} className="text-white" /></div><div className="hidden text-left md:block"><p className="text-sm font-medium">{user?.name || "Pengguna"}</p><p className="text-xs text-muted-foreground">{user?.role || "-"}</p></div></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>Akun Saya</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => navigate("/petugas/settings")}>Pengaturan</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => { logout(); navigate("/login"); }}>Keluar</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
