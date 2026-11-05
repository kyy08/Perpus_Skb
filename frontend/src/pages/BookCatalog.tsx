import { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Check, Search } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/shared/QueryState";
import { useOceanToast } from "@/components/ui/ocean-toast";

export default function BookCatalog() {
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState(7);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const deferredSearch = useDeferredValue(search);
  const queryClient = useQueryClient();
  const { success, error, warning } = useOceanToast();
  const params = new URLSearchParams({ limit: "50", availableOnly: "true" });
  if (deferredSearch) params.set("search", deferredSearch);
  const books = useQuery({ queryKey: ["catalog", deferredSearch], queryFn: async () => (await api.books.list(params)).data });
  const request = useMutation({ mutationFn: () => api.requests.create({ bookIds: selectedBooks, requestedDurationDays: duration }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["catalog"] }); setSelectedBooks([]); success("Pengajuan terkirim", "Tunggu persetujuan petugas."); }, onError: (mutationError) => error("Pengajuan gagal", getApiErrorMessage(mutationError)) });

  function toggleBook(bookId: number) {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks((current) => current.filter((id) => id !== bookId));
      return;
    }
    if (selectedBooks.length >= 2) {
      warning("Maksimal 2 buku", "Hapus pilihan lain sebelum memilih buku baru.");
      return;
    }
    setSelectedBooks((current) => [...current, bookId]);
  }

  return <div className="space-y-6"><div className="page-header"><p className="text-sm font-medium text-primary">Koleksi tersedia</p><h1 className="page-title">Cari Buku</h1><p className="page-subtitle">Pilih sampai 2 buku untuk diajukan dalam satu permintaan.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative w-full max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, ISBN, atau penulis..." className="pl-10" /></div><div className="flex items-center gap-2"><label className="whitespace-nowrap text-sm text-muted-foreground">Durasi</label><Input type="number" min={1} max={14} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-24" /><span className="text-sm text-muted-foreground">hari</span></div></div><QueryState isLoading={books.isLoading} error={books.error} empty={!books.isLoading && !books.error && books.data?.length === 0}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{books.data?.map((book) => { const selected = selectedBooks.includes(book.id); return <article key={book.id} className={`rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lg ${selected ? "border-primary ring-1 ring-primary/20" : "border-border"}`}><button className="w-full text-left" onClick={() => toggleBook(book.id)}><div className="relative mb-5 flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">{book.coverUrl ? <img src={book.coverUrl} alt={`Cover ${book.title}`} className="h-full w-full object-cover" /> : <BookOpen size={42} />}{selected && <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check size={16} /></span>}</div><h2 className="font-semibold">{book.title}</h2><p className="mt-1 text-sm text-muted-foreground">{book.authors.map((author) => author.name).join(", ") || "Penulis belum diisi"}</p></button><div className="mt-4 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">{book.availability.available} tersedia</span><span className="text-xs font-medium text-primary">{selected ? "Dipilih" : "Pilih buku"}</span></div></article>; })}</div></QueryState>{selectedBooks.length > 0 && <div className="sticky bottom-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{selectedBooks.length} buku dipilih</p><p className="text-sm text-muted-foreground">Durasi peminjaman {duration} hari.</p></div><Button onClick={() => request.mutate()} disabled={request.isPending}>{request.isPending ? "Mengirim..." : "Ajukan Peminjaman"}</Button></div>}</div>;
}
