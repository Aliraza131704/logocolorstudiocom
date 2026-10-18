import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ExternalLink, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CATALOG_KEY, parseCatalog, assetSchema, type DownloadAsset } from '@/lib/download-catalog';

type Draft = Omit<DownloadAsset, 'rights_confirmed'> & { rights_confirmed: boolean };
export function DownloadManager() {
  const qc = useQueryClient();
  const { data: items, isPending, error } = useQuery({ queryKey: ['admin-downloads'], queryFn: async () => {
    const { data, error } = await supabase.from('site_settings').select('value').eq('key', CATALOG_KEY).maybeSingle();
    if (error) throw error;
    return parseCatalog(data?.value ?? '');
  }});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const persist = async (rows: DownloadAsset[]) => {
    setBusy(true);
    try {
      const { error } = await supabase.from('site_settings').upsert({ key: CATALOG_KEY, value: JSON.stringify(rows), updated_at: new Date().toISOString() });
      if (error) throw error;
      await Promise.all([qc.invalidateQueries({ queryKey: ['admin-downloads'] }), qc.invalidateQueries({ queryKey: ['download-catalog'] })]);
      toast.success('Downloads saved'); return true;
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save downloads'); return false; }
    finally { setBusy(false); }
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!draft || !items) return;
    const result = assetSchema.safeParse(draft);
    if (!result.success) { toast.error(result.error.issues[0]?.message ?? 'Check asset details'); return; }
    const rows = items.some(a => a.id === draft.id) ? items.map(a => a.id === draft.id ? result.data : a) : [...items, result.data];
    if (await persist(rows)) setDraft(null);
  };
  if (error) return <p role="alert" className="text-destructive">Could not load downloads. Refresh and try again.</p>;
  if (isPending) return <p className="text-muted-foreground">Loading downloads…</p>;
  if (draft) {
    const update = (key: keyof Draft, value: string | number | boolean) => setDraft({ ...draft, [key]: value });
    const fields: [keyof Draft, string][] = [['title','Asset title'],['category','Category'],['version','Version'],['author','Author'],['file_url','File URL (HTTPS)'],['filename','Download filename'],['preview_url','Preview image URL (optional)'],['video_url','Sponsor video URL (optional; uses shared video if empty)']];
    return <form onSubmit={save} className="space-y-5">
      <h2 className="text-lg font-semibold">{items?.some(a => a.id === draft.id) ? 'Edit asset' : 'Add asset'}</h2>
      <div className="grid gap-4 lg:grid-cols-2">{fields.map(([key,label]) => <div key={key}><label htmlFor={`asset-${key}`} className="text-sm font-medium">{label}</label><Input id={`asset-${key}`} className="mt-1" value={String(draft[key])} onChange={e => update(key,e.target.value)} required={['title','category','file_url','filename'].includes(key)} /></div>)}</div>
      <div><label htmlFor="asset-description" className="text-sm font-medium">Description</label><Textarea id="asset-description" className="mt-1" rows={3} value={draft.description} onChange={e => update('description',e.target.value)} /></div>
      <div className="max-w-xs"><label htmlFor="asset-size" className="text-sm font-medium">File size (MB; 0 if unknown)</label><Input id="asset-size" type="number" min="0" step="any" value={draft.size_mb} onChange={e => update('size_mb',Number(e.target.value))} /></div>
      <div className="space-y-4 border-t pt-5">
        <label className="block text-sm font-medium">Sponsor format<Select value={draft.sponsor_type} onValueChange={v => update('sponsor_type',v)}><SelectTrigger aria-label="Sponsor format" className="mt-1 max-w-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="banner">Banner</SelectItem><SelectItem value="website">Website link</SelectItem><SelectItem value="adsense">AdSense code</SelectItem></SelectContent></Select></label>
        {(draft.sponsor_type === 'banner' || draft.sponsor_type === 'website') && <><label className="block text-sm">Sponsor name<Input value={draft.sponsor_title} onChange={e => update('sponsor_title',e.target.value)} /></label><label className="block text-sm">Sponsor website URL<Input value={draft.sponsor_url} onChange={e => update('sponsor_url',e.target.value)} required={draft.sponsor_type === 'website'} /></label><p className="text-sm text-muted-foreground">{draft.sponsor_type === 'website' ? 'Opening the sponsor website is required before continuing. External page loading cannot be verified.' : 'Visiting the banner sponsor is optional.'}</p></>}
        {draft.sponsor_type === 'banner' && <label className="block text-sm">Banner image URL<Input value={draft.banner_url} onChange={e => update('banner_url',e.target.value)} required /></label>}
        {draft.sponsor_type === 'adsense' && <><label className="block text-sm">AdSense placement code<Textarea rows={6} className="font-mono text-xs" value={draft.sponsor_code} onChange={e => update('sponsor_code',e.target.value)} /></label><p className="text-sm text-muted-foreground">Regular advertisement below the library, after consent. Downloads never require viewing or clicking AdSense. Keep the global script in Ads Manager.</p></>}
      </div>
      <label className="flex items-center gap-3 text-sm"><Switch checked={draft.published} onCheckedChange={v => update('published',v)} /> Published</label>
      <label className="flex items-start gap-3 text-sm"><Checkbox checked={draft.rights_confirmed} onCheckedChange={v => update('rights_confirmed',v === true)} /> I have permission to distribute this file.</label>
      <div className="flex gap-2"><Button disabled={busy} type="submit">{busy ? 'Saving…' : 'Save asset'}</Button><Button disabled={busy} variant="outline" type="button" onClick={() => setDraft(null)}>Cancel</Button></div>
    </form>;
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{items?.length ?? 0} assets · {items?.filter(a => a.published).length ?? 0} published</p><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to="/downloads"><ExternalLink /> View library</Link></Button><Button onClick={() => setDraft({ id: crypto.randomUUID(), title:'', description:'', category:'WordPress themes', version:'', author:'', file_url:'', filename:'', preview_url:'', video_url:'', size_mb:0, published:false, rights_confirmed:false, sponsor_type:"video", sponsor_title:"", sponsor_url:"", banner_url:"", sponsor_code:"" })}><Plus /> Add asset</Button></div></div>
    <div className="divide-y border-y">{items?.map(a => <div key={a.id} className="flex flex-wrap items-center gap-3 py-4">{a.preview_url ? <img src={a.preview_url} alt="" className="h-14 w-20 rounded-md object-cover" /> : <Package className="size-8 text-muted-foreground" />}<div className="min-w-0 flex-1"><p className="break-words font-semibold">{a.title} {a.version && `· ${a.version}`}</p><p className="text-xs text-muted-foreground">{a.category} · {a.published ? 'Published' : 'Draft'}</p></div><Button variant="outline" size="sm" disabled={busy} onClick={() => persist((items ?? []).map(x => x.id === a.id ? { ...x,published:!x.published } : x))}>{a.published ? 'Hide' : 'Publish'}</Button><Button variant="ghost" size="icon" aria-label={`Edit ${a.title}`} onClick={() => setDraft(a)}><Pencil /></Button><Button variant="ghost" size="icon" disabled={busy} aria-label={`Delete ${a.title}`} onClick={() => { if (confirm(`Delete ${a.title} from the library?`)) persist((items ?? []).filter(x => x.id !== a.id)); }}><Trash2 /></Button></div>)}</div>
    {items?.length === 0 && <p className="py-8 text-center text-muted-foreground">No assets yet.</p>}
  </div>;
}