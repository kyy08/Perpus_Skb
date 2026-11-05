import { useDeferredValue, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, BookOpen, CheckCircle2, ImagePlus, MoreVertical, Pencil, Search, UploadCloud, X } from "lucide-react";
import { api, getApiErrorMessage, type Book, type BookCopy, type BookPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QueryState } from "@/components/shared/QueryState";
import { OceanConfirmDialog } from "@/components/ui/ocean-confirm-dialog";
import { useOceanToast } from "@/components/ui/ocean-toast";

const emptyBookForm: BookPayload = { title: "", language: "Indonesia", authorIds: [], copyCount: 1 };

export default function Books() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Book | null>(null);
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [authorInput, setAuthorInput] = useState("");
  const [publisherInput, setPublisherInput] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<BookPayload>(emptyBookForm);
  const deferredSearch = useDeferredValue(search);
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const params = new URLSearchParams({ limit: "50" });
  if (deferredSearch) params.set("search", deferredSearch);

  const books = useQuery({ queryKey: ["books", deferredSearch], queryFn: async () => (await api.books.list(params)).data });
  const categories = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.categories.list()).data });
  const authors = useQuery({ queryKey: ["authors"], queryFn: async () => (await api.authors.list()).data });
  const publishers = useQuery({ queryKey: ["publishers"], queryFn: async () => (await api.publishers.list()).data });
  const copies = useQuery({ queryKey: ["book-copies", selectedBookId], queryFn: async () => (await api.books.copies(selectedBookId as number)).data, enabled: selectedBookId !== null });
  const createBook = useMutation({
    mutationFn: (payload: BookPayload) => api.books.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); setForm(emptyBookForm); setAuthorInput(""); setPublisherInput(""); setShowForm(false); success("Buku ditambahkan", "Judul dan jumlah buku berhasil masuk ke katalog."); },
    onError: (mutationError) => error("Gagal menambah buku", getApiErrorMessage(mutationError)),
  });
  const updateBook = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BookPayload }) => api.books.update(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); setEditingBook(null); success("Buku diperbarui"); },
    onError: (mutationError) => error("Gagal memperbarui buku", getApiErrorMessage(mutationError)),
  });
  const uploadCover = useMutation({
    mutationFn: (file: File) => api.books.uploadCover(file),
    onSuccess: (response) => { updateForm("coverUrl", response.data.url); success("Cover berhasil diunggah"); },
    onError: (mutationError) => error("Gagal mengunggah cover", getApiErrorMessage(mutationError)),
  });
  const archiveBook = useMutation({
    mutationFn: (id: number) => api.books.remove(id),
    onSuccess: (_, id) => { queryClient.invalidateQueries({ queryKey: ["books"] }); if (selectedBookId === id) setSelectedBookId(null); setArchiveTarget(null); success("Buku diarsipkan", "Buku tidak lagi tampil di katalog."); },
    onError: (mutationError) => error("Gagal mengarsipkan buku", getApiErrorMessage(mutationError)),
  });
  const updateCopy = useMutation({
    mutationFn: ({ id, availabilityStatus }: { id: number; availabilityStatus: string }) => api.books.updateCopy(id, { availabilityStatus }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["books"] }); queryClient.invalidateQueries({ queryKey: ["book-copies", selectedBookId] }); setEditingCopy(null); success("Status buku diperbarui"); },
    onError: (mutationError) => error("Gagal memperbarui status", getApiErrorMessage(mutationError)),
  });

  function updateForm(field: keyof BookPayload, value: string | number | null) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function chooseCover(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      error("Format cover tidak valid", "Gunakan file JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error("Ukuran cover terlalu besar", "Ukuran maksimal cover adalah 5 MB.");
      return;
    }
    uploadCover.mutate(file);
  }

  async function resolveAuthorAndPublisherIds() {
    const authorNames = authorInput.split(",").map((value) => value.trim()).filter(Boolean);
    const publisherName = publisherInput.trim();

    let authorIds: number[] = [];
    let publisherId: number | null = null;

    if (authorNames.length > 0) {
      for (const name of authorNames) {
        const match = authors.data?.find((author) => author.name.toLowerCase() === name.toLowerCase());
        if (match) {
          authorIds.push(match.id);
          continue;
        }

        const created = await api.authors.create({ name });
        authorIds.push(created.data.id);
      }
    }

    if (publisherName) {
      const match = publishers.data?.find((publisher) => publisher.name.toLowerCase() === publisherName.toLowerCase());
      if (match) {
        publisherId = match.id;
      } else {
        const created = await api.publishers.create({ name: publisherName });
        publisherId = created.data.id;
      }
    }

    return { authorIds, publisherId };
  }

  function openCreateForm() {
    setEditingBook(null);
    setForm(emptyBookForm);
    setAuthorInput("");
    setPublisherInput("");
    setShowForm(true);
  }

  function openEditForm(book: Book) {
    setEditingBook(book);
    setForm({ title: book.title, publicationYear: book.publicationYear, language: book.language, categoryId: book.category?.id, publisherId: book.publisher?.id, authorIds: book.authors.map((author) => author.id) });
    setAuthorInput(book.authors.map((author) => author.name).join(", "));
    setPublisherInput(book.publisher?.name || "");
  }

  function closeBookForm(open: boolean) {
    if (!open) {
      setShowForm(false);
      setEditingBook(null);
      setAuthorInput("");
      setPublisherInput("");
    }
  }

  async function submitBook(event: React.FormEvent) {
    event.preventDefault();

    try {
      const { authorIds, publisherId } = await resolveAuthorAndPublisherIds();
      const payload = {
        ...form,
        authorIds,
        publisherId,
      };

      if (editingBook) {
        const { copyCount, ...metadata } = payload;
        updateBook.mutate({ id: editingBook.id, payload: metadata });
      } else {
        createBook.mutate(payload);
      }
    } catch (mutationError) {
      error("Gagal menyimpan buku", getApiErrorMessage(mutationError));
    }
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    try {
      await archiveBook.mutateAsync(archiveTarget.id);
    } catch {
      // The mutation toast already explains the failure.
    }
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="page-header mb-0"><p className="text-sm font-medium text-primary">Koleksi perpustakaan</p><h1 className="page-title">Data Buku</h1><p className="page-subtitle">Kelola judul, kategori, dan ketersediaan buku.</p></div><Button onClick={openCreateForm}>Tambah Buku</Button></div>
    <Dialog open={showForm || editingBook !== null} onOpenChange={closeBookForm}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{editingBook ? "Edit data buku" : "Tambah judul buku"}</DialogTitle><DialogDescription>{editingBook ? "Perbarui informasi judul, penulis, kategori, dan penerbit." : "Isi data buku dan jumlah buku. Kode inventaris akan dibuat otomatis."}</DialogDescription></DialogHeader><form onSubmit={submitBook} className="space-y-5"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2 md:col-span-2"><Label>Judul buku</Label><Input value={form.title || ""} onChange={(event) => updateForm("title", event.target.value)} maxLength={255} required /></div><div className="space-y-2 md:col-span-2"><Label>Cover buku</Label><div onDragOver={(event) => { event.preventDefault(); setIsDraggingCover(true); }} onDragLeave={() => setIsDraggingCover(false)} onDrop={(event) => { event.preventDefault(); setIsDraggingCover(false); chooseCover(event.dataTransfer.files[0]); }} className={`rounded-xl border-2 border-dashed p-4 transition-colors ${isDraggingCover ? "border-primary bg-primary/5" : "border-border"}`}><input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => chooseCover(event.target.files?.[0])} />{form.coverUrl ? <div className="flex items-center gap-4"><img src={form.coverUrl} alt="Preview cover buku" className="h-24 w-16 rounded-md object-cover" /><div className="flex-1"><p className="text-sm font-medium">Cover siap digunakan</p><p className="text-xs text-muted-foreground">Anda dapat mengganti gambar dengan upload baru.</p></div><Button type="button" variant="outline" size="icon" onClick={() => updateForm("coverUrl", null)} aria-label="Hapus cover"><X size={16} /></Button></div> : <button type="button" className="flex w-full flex-col items-center gap-2 py-5 text-center text-muted-foreground" onClick={() => coverInputRef.current?.click()}><UploadCloud size={28} className="text-primary" /><span className="text-sm font-medium text-foreground">Klik untuk upload atau tarik gambar ke sini</span><span className="text-xs">JPG, PNG, WebP maksimal 5 MB</span></button>}</div></div><div className="space-y-2"><Label>Tahun terbit</Label><Input type="number" min={1000} max={2200} value={form.publicationYear || ""} onChange={(event) => updateForm("publicationYear", event.target.value ? Number(event.target.value) : null)} /></div><div className="space-y-2"><Label>Kategori</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.categoryId || ""} onChange={(event) => updateForm("categoryId", event.target.value ? Number(event.target.value) : null)}><option value="">Pilih kategori</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div><div className="space-y-2"><Label>Penulis</Label><Input value={authorInput} onChange={(event) => setAuthorInput(event.target.value)} placeholder="Nama penulis" maxLength={255} /></div><div className="space-y-2"><Label>Penerbit</Label><Input value={publisherInput} onChange={(event) => setPublisherInput(event.target.value)} placeholder="Nama penerbit" maxLength={255} /></div>{!editingBook && <div className="space-y-2"><Label>Jumlah buku</Label><Input type="number" min={1} max={100} value={form.copyCount || 1} onChange={(event) => updateForm("copyCount", event.target.value ? Number(event.target.value) : 1)} required /><p className="text-xs text-muted-foreground">Kode inventaris dibuat otomatis oleh sistem.</p></div>}</div><DialogFooter><Button type="submit" disabled={createBook.isPending || updateBook.isPending || uploadCover.isPending}>{createBook.isPending || updateBook.isPending ? "Menyimpan..." : uploadCover.isPending ? "Mengunggah cover..." : editingBook ? "Simpan Perubahan" : "Simpan Buku"}</Button></DialogFooter></form></DialogContent></Dialog>
    <div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari judul, ISBN, atau penulis..." className="pl-10" /></div>
    <QueryState isLoading={books.isLoading} error={books.error} empty={!books.isLoading && !books.error && books.data?.length === 0}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{books.data?.map((book) => <article key={book.id} className={`relative rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lg ${selectedBookId === book.id ? "border-primary" : "border-border"}`}><button className="w-full text-left" onClick={() => setSelectedBookId(book.id)}><div className="mb-5 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 text-primary">{book.coverUrl ? <img src={book.coverUrl} alt={`Cover ${book.title}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <BookOpen size={38} />}</div><div className="flex items-start justify-between gap-3 pr-8"><div><h2 className="font-semibold leading-snug">{book.title}</h2><p className="mt-1 text-xs text-muted-foreground">{book.authors.map((author) => author.name).join(", ") || "Penulis belum diisi"}</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{book.availability.available} tersedia</span></div></button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="absolute right-3 top-3" aria-label={`Aksi untuk ${book.title}`}><MoreVertical size={18} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-[190px]"><DropdownMenuItem onSelect={() => setSelectedBookId(book.id)}>Kelola inventaris</DropdownMenuItem><DropdownMenuItem onSelect={() => openEditForm(book)}><Pencil size={15} />Edit data buku</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => setArchiveTarget(book)}><Archive size={15} />Arsipkan buku</DropdownMenuItem></DropdownMenuContent></DropdownMenu><div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"><span>{book.category?.name || "Tanpa kategori"}</span><span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-success" />{book.availability.total} buku</span></div></article>)}</div></QueryState>
    {selectedBookId !== null && <section className="rounded-xl border border-border bg-card p-5 shadow-card"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs uppercase tracking-wider text-primary">Inventaris fisik</p><h2 className="mt-1 font-semibold">Buku fisik</h2><p className="mt-1 text-sm text-muted-foreground">Kode inventaris dibuat otomatis saat buku ditambahkan.</p></div></div><QueryState isLoading={copies.isLoading} error={copies.error} empty={!copies.isLoading && !copies.error && copies.data?.length === 0}><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{copies.data?.map((copy) => <div key={copy.id} className="rounded-lg border border-border p-3"><div className="flex items-center justify-between"><Archive size={17} className="text-primary" /><span className="font-mono text-xs">{copy.inventoryCode}</span></div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{copy.availabilityStatus}</span><Button size="sm" variant="outline" onClick={() => { setEditingCopy(copy); setCopyStatus(copy.availabilityStatus); }}>Ubah</Button></div></div>)}</div></QueryState></section>}
    <Dialog open={editingCopy !== null} onOpenChange={(open) => !open && setEditingCopy(null)}><DialogContent><DialogHeader><DialogTitle>Ubah status buku</DialogTitle><DialogDescription>{editingCopy?.inventoryCode || "Buku"}</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); if (editingCopy) updateCopy.mutate({ id: editingCopy.id, availabilityStatus: copyStatus }); }} className="space-y-4"><div className="space-y-2"><Label>Status ketersediaan</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={copyStatus} onChange={(event) => setCopyStatus(event.target.value)}><option>AVAILABLE</option><option>BORROWED</option><option>MAINTENANCE</option><option>LOST</option></select></div><DialogFooter><Button type="submit" disabled={updateCopy.isPending}>{updateCopy.isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button></DialogFooter></form></DialogContent></Dialog>
    <OceanConfirmDialog open={archiveTarget !== null} onOpenChange={(open) => !open && setArchiveTarget(null)} title="Arsipkan buku ini?" description={`${archiveTarget?.title || "Buku ini"} tidak akan tampil lagi di katalog, tetapi riwayat peminjamannya tetap disimpan.`} confirmLabel="Ya, Arsipkan" loading={archiveBook.isPending} onConfirm={confirmArchive} />
  </div>;
}
