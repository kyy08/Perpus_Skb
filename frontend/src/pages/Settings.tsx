import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Settings2 } from "lucide-react";
import { api, getApiErrorMessage, type SystemSetting } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QueryState } from "@/components/shared/QueryState";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOceanToast } from "@/components/ui/ocean-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { success, error } = useOceanToast();
  const query = useQuery({ queryKey: ["settings"], queryFn: async () => (await api.settings.list()).data });
  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<SystemSetting | null>(null);
  useEffect(() => { if (query.data) setValues(Object.fromEntries(query.data.map((setting) => [setting.settingKey, setting.settingValue]))); }, [query.data]);
  const update = useMutation({ mutationFn: ({ key, value }: { key: string; value: string }) => api.settings.update(key, value), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); setEditing(null); success("Pengaturan disimpan"); }, onError: (mutationError) => error("Gagal menyimpan", getApiErrorMessage(mutationError)) });

  return <div className="space-y-6"><div className="page-header"><p className="text-sm font-medium text-primary">Konfigurasi sistem</p><h1 className="page-title">Pengaturan</h1><p className="page-subtitle">Atur batas peminjaman dan perhitungan denda.</p></div><QueryState isLoading={query.isLoading} error={query.error} empty={!query.isLoading && !query.error && query.data?.length === 0}><div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card"><div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Settings2 size={20} /></div><div><h2 className="font-semibold">Aturan peminjaman</h2><p className="text-sm text-muted-foreground">Perubahan berlaku untuk pengajuan baru.</p></div></div><div className="space-y-5">{query.data?.map((setting) => <div key={setting.settingKey} className="flex flex-col justify-between gap-3 border-b border-border pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center"><div><p className="font-medium">{setting.settingKey.replace(/_/g, " ")}</p><p className="text-xs text-muted-foreground">{setting.description}</p></div><Button variant="outline" size="sm" onClick={() => setEditing(setting)}><Save size={16} />Ubah</Button></div>)}</div></div></QueryState><Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>Ubah pengaturan</DialogTitle><DialogDescription>{editing?.description || "Perbarui nilai pengaturan sistem."}</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); if (editing) update.mutate({ key: editing.settingKey, value: values[editing.settingKey] ?? editing.settingValue }); }} className="space-y-4"><div className="space-y-2"><label className="text-sm font-medium">Nilai</label><Input value={editing ? values[editing.settingKey] ?? editing.settingValue : ""} onChange={(event) => editing && setValues((current) => ({ ...current, [editing.settingKey]: event.target.value }))} autoFocus required /></div><DialogFooter><Button type="submit" disabled={update.isPending}>{update.isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button></DialogFooter></form></DialogContent></Dialog></div>;
}
