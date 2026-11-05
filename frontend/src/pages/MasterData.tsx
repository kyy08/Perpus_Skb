import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Database, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/shared/QueryState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { OceanConfirmDialog } from "@/components/ui/ocean-confirm-dialog";
import { useOceanToast } from "@/components/ui/ocean-toast";

type ResourceName = "categories";
type ResourceItem = { id: number; name: string };

function ResourcePanel({ title, resource, items, loading, value, onValueChange, onCreate, onUpdate, onRemove }: {
  title: string;
  resource: ResourceName;
  items: ResourceItem[];
  loading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  onCreate: (resource: ResourceName, name: string) => void;
  onUpdate: (resource: ResourceName, id: number, name: string) => Promise<void>;
  onRemove: (resource: ResourceName, id: number) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ResourceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
  const [editValue, setEditValue] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    onCreate(resource, value.trim());
    setShowForm(false);
  }

  async function submitEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !editValue.trim()) return;
    try {
      await onUpdate(resource, editing.id, editValue.trim());
      setEditing(null);
    } catch {
      // The mutation toast already explains the failure.
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await onRemove(resource, deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // The mutation toast already explains the failure.
    }
  }

  const form = <form className="flex gap-2" onSubmit={submit}><Input value={value} onChange={(event) => onValueChange(event.target.value)} placeholder={`Tambah ${title.toLowerCase()}`} autoFocus /><Button type="submit" size="icon" aria-label={`Tambah ${title}`}><Plus size={16} /></Button></form>;

  return <div className="max-w-2xl rounded-xl border border-border bg-card p-5 shadow-card sm:p-6"><div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Database size={19} /></div><div><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">Data yang digunakan pada katalog buku.</p></div></div><Button onClick={() => setShowForm(true)}><Plus size={16} />Tambah</Button></div><div className="mb-5">{form}</div><QueryState isLoading={loading} empty={!loading && items.length === 0}><ul className="space-y-2">{items.map((item) => <li key={item.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"><span>{item.name}</span><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Aksi untuk ${item.name}`}><MoreVertical size={16} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => { setEditing(item); setEditValue(item.name); }}><Pencil size={15} />Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive" onSelect={() => setDeleteTarget(item)}><Trash2 size={15} />Hapus</DropdownMenuItem></DropdownMenuContent></DropdownMenu></li>)}</ul></QueryState><Dialog open={showForm} onOpenChange={setShowForm}><DialogContent><DialogHeader><DialogTitle>Tambah {title.toLowerCase()}</DialogTitle><DialogDescription>Masukkan nama data yang akan digunakan pada katalog buku.</DialogDescription></DialogHeader>{form}<DialogFooter><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button></DialogFooter></DialogContent></Dialog><Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Edit {title.toLowerCase()}</DialogTitle><DialogDescription>Perbarui nama data katalog.</DialogDescription></DialogHeader><form onSubmit={submitEdit} className="space-y-4"><Input value={editValue} onChange={(event) => setEditValue(event.target.value)} minLength={2} required autoFocus /><DialogFooter><Button type="submit">Simpan Perubahan</Button></DialogFooter></form></DialogContent></Dialog><OceanConfirmDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)} title={`Hapus ${title.toLowerCase()} ini?`} description="Kategori yang masih digunakan buku tetap aman, tetapi relasinya mungkin perlu diperbarui." confirmLabel="Ya, Hapus" onConfirm={confirmDelete} /></div>;
}

export default function MasterData() {
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const [values, setValues] = useState<Record<ResourceName, string>>({ categories: "" });
  const categories = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.categories.list()).data });

  const create = useMutation({
    mutationFn: ({ resource, name }: { resource: ResourceName; name: string }) => resource === "categories" ? api.categories.create({ name }) : Promise.reject(new Error("Resource tidak valid")),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: [variables.resource] }); setValues((current) => ({ ...current, [variables.resource]: "" })); success("Data master ditambahkan"); },
    onError: (mutationError) => error("Gagal menambah data", getApiErrorMessage(mutationError))
  });

  const update = useMutation({
    mutationFn: ({ resource, id, name }: { resource: ResourceName; id: number; name: string }) => resource === "categories" ? api.categories.update(id, { name }) : Promise.reject(new Error("Resource tidak valid")),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: [variables.resource] }); success("Data master diperbarui"); },
    onError: (mutationError) => error("Gagal memperbarui data", getApiErrorMessage(mutationError))
  });

  const remove = useMutation({
    mutationFn: ({ resource, id }: { resource: ResourceName; id: number }) => resource === "categories" ? api.categories.remove(id) : Promise.reject(new Error("Resource tidak valid")),
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: [variables.resource] }); success("Data master dihapus"); },
    onError: (mutationError) => error("Gagal menghapus data", getApiErrorMessage(mutationError))
  });

  const groups = {
    categories: { title: "Kategori", items: categories.data?.map((item) => ({ id: item.id, name: item.name })) || [], loading: categories.isLoading },
  };

  function renderPanel(resource: ResourceName) {
    const group = groups[resource];
    return <ResourcePanel title={group.title} resource={resource} items={group.items} loading={group.loading} value={values[resource]} onValueChange={(value) => setValues((current) => ({ ...current, [resource]: value }))} onCreate={(key, name) => create.mutate({ resource: key, name })} onUpdate={async (key, id, name) => { await update.mutateAsync({ resource: key, id, name }); }} onRemove={async (key, id) => { await remove.mutateAsync({ resource: key, id }); }} />;
  }

  return <div className="space-y-6"><div className="page-header"><p className="text-sm font-medium text-primary">Katalog pendukung</p><h1 className="page-title">Data Master</h1><p className="page-subtitle">Kelola data pendukung untuk katalog buku.</p></div><Tabs defaultValue="categories" className="w-full"><TabsList className="grid h-auto w-full max-w-2xl grid-cols-1 rounded-xl bg-muted p-1"><TabsTrigger value="categories" className="py-2.5">Kategori</TabsTrigger></TabsList><TabsContent value="categories">{renderPanel("categories")}</TabsContent></Tabs></div>;
}
