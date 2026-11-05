import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Library, Lock, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOceanToast } from "@/components/ui/ocean-toast";
import { useAuth } from "@/auth/AuthContext";
import { getApiErrorMessage } from "@/lib/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useOceanToast();
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    try { await register(form); success("Registrasi berhasil", "Akun anggota Anda sudah aktif."); navigate("/catalog", { replace: true }); }
    catch (requestError) { error("Registrasi gagal", getApiErrorMessage(requestError, "Periksa data Anda.")); }
    finally { setIsLoading(false); }
  }

  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[0.9fr_1.1fr]">
    <div className="gradient-ocean relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="relative z-10 flex items-center gap-3"><div className="rounded-xl bg-white/15 p-3"><Library size={24} /></div><span className="text-xl font-semibold">Perpus SKB</span></div><div className="relative z-10 max-w-md pb-8"><p className="mb-4 text-sm uppercase tracking-[0.25em] text-white/65">SKB Kota Tegal</p><h1 className="text-5xl font-bold leading-tight">Satu tempat untuk merawat pengetahuan.</h1><p className="mt-5 text-lg leading-relaxed text-white/75">Kelola koleksi, anggota, dan peminjaman perpustakaan dengan alur yang sederhana.</p></div><div className="absolute -right-24 top-1/4 h-72 w-72 rounded-full border border-white/15" /><div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" /></div>
    <div className="flex items-center justify-center p-6 sm:p-10"><div className="w-full max-w-md"><div className="mb-10 text-center lg:text-left"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary lg:mx-0"><Library size={27} /></div><h2 className="text-3xl font-bold">Daftar anggota</h2><p className="mt-2 text-muted-foreground">Buat akun untuk mengajukan peminjaman buku.</p></div><form onSubmit={handleSubmit} className="space-y-5"><div className="space-y-2"><Label htmlFor="name">Nama lengkap</Label><div className="relative"><UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input id="name" value={form.name} onChange={update("name")} placeholder="Nama lengkap" className="pl-10" required /></div></div><div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="nama@email.com" className="pl-10" required /></div></div><div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Minimal 8 karakter" className="px-10" minLength={8} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div><div className="space-y-2"><Label htmlFor="address">Alamat <span className="font-normal text-muted-foreground">(opsional)</span></Label><Input id="address" value={form.address} onChange={update("address")} placeholder="Alamat tempat tinggal" /></div><Button type="submit" className="h-11 w-full" disabled={isLoading}>{isLoading ? "Mendaftarkan..." : "Buat akun"}</Button></form><p className="mt-8 text-center text-sm text-muted-foreground">Sudah punya akun? <Link to="/login" className="font-medium text-primary hover:underline">Masuk</Link></p></div></div>
  </div>;
}
