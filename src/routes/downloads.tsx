import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listDownloadAssets } from '@/lib/content.functions';
import { filterAssets, sponsorReady, canContinueSponsor, type DownloadAsset } from '@/lib/download-catalog';
import { DownloadAd } from '@/components/site/DownloadAd';
import { Download, Play, Package, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useConsent } from '@/components/site/consent';
import { useSettings } from '@/lib/site-data';
import { pageHead } from '@/lib/seo';
import { getPublicSetting } from "@/lib/content.functions";
import { TOOL_CONTENT_KEY, toolOverride, withMeta } from "@/lib/tool-overrides";
import { PageExtras } from "@/components/site/PageExtras";
import { rewardEarned, watchedProgress, safeSponsorVideo } from '@/lib/download-reward';
const catalogQuery = queryOptions({ queryKey: ['download-catalog'], queryFn: () => listDownloadAssets(), staleTime: 30_000 });

export const Route = createFileRoute('/downloads')({
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(catalogQuery); return getPublicSetting({ data: { key: TOOL_CONTENT_KEY } }); },
  head: ({ loaderData }) => pageHead(withMeta(toolOverride(loaderData, "page-downloads"), { title: 'Free WordPress Themes Download — WoodMart, Newspaper & More', description: 'Download free WordPress themes and template kits: WooCommerce, magazine, food and portfolio themes like WoodMart, Newspaper, Frutin and Elito.', path: '/downloads' })),
  component: Downloads,
});

function Downloads() {
  const o = toolOverride(Route.useLoaderData(), "page-downloads");
  const { data: settings, isPending } = useSettings();
  const { consent, open: openConsent } = useConsent();
  const [show, setShow] = useState(false);
  const { data: items } = useSuspenseQuery(catalogQuery);
  const [selected, setSelected] = useState<DownloadAsset | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [websiteOpened, setWebsiteOpened] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const filtered = filterAssets(items, search, category);
  const categories = [...new Set(items.map(a => a.category))].sort();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const watched = useRef(0);
  const lastTick = useRef(0);
  const source = safeSponsorVideo(selected?.video_url || settings?.download_video_url);

  const start = (asset: DownloadAsset) => {
    if ((asset.sponsor_type === 'video' || asset.sponsor_type === 'website') && !consent.ads) { openConsent(); return; }
    if (!sponsorReady(asset, settings?.download_video_url, settings?.download_video_enabled)) return;
    setSelected(asset);
    setWebsiteOpened(false);
    watched.current = 0; lastTick.current = performance.now();
    setProgress(0); setError(''); setShow(true);
  };
  const visitWebsite = () => {
    if (!selected?.sponsor_url || !consent.ads) return;
    const tab = window.open(selected.sponsor_url, '_blank');
    if (!tab) { setError('Allow new tabs for this site, then try Visit sponsor again.'); return; }
    tab.opener = null;
    setWebsiteOpened(true);
    setError('');
  };
  const tick = () => {
    const v = video.current;
    if (!v) return;
    const now = performance.now();
    const next = watchedProgress(watched.current, v.currentTime, (now - lastTick.current) / 1000, !v.paused && !v.seeking && v.playbackRate === 1 && document.visibilityState === 'visible');
    if (v.currentTime > next + 0.5) v.currentTime = next;
    watched.current = next; lastTick.current = now;
    setProgress(Number.isFinite(v.duration) && v.duration > 0 ? Math.min(100, next / v.duration * 100) : 0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-green"><Package className="size-4" /> Website resources</div>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{o?.title ?? <>Free WordPress themes & template kits</>}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{o?.intro ?? <>Download free WordPress themes for WooCommerce stores, news sites, food brands and portfolios — plus Elementor template kits.</>}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Input aria-label="Search assets" placeholder="Search themes, plugins, resources…" value={search} onChange={e => setSearch(e.target.value)} className="sm:max-w-md" />
        <Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Filter category" className="w-full sm:w-60"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <p className="self-center text-sm text-muted-foreground">{filtered.length} assets</p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(asset => {
          const earned = unlocked.has(asset.id) || asset.sponsor_type === 'adsense';
          const available = sponsorReady(asset, settings?.download_video_url, settings?.download_video_enabled);
          return <article key={asset.id} className="flex flex-col overflow-hidden rounded-lg border bg-card">
            {asset.preview_url ? <img src={asset.preview_url} alt={`${asset.title} preview`} className="aspect-[4/3] w-full object-contain bg-muted" /> : <div className="flex aspect-[4/3] items-center justify-center bg-muted"><Package className="size-16 text-muted-foreground" /></div>}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold text-brand-green">{asset.category}</p>
              <div className="mt-2 flex flex-wrap items-start justify-between gap-2"><h2 className="break-words text-xl font-bold">{asset.title}</h2>{asset.version && <span className="rounded-md border px-2 py-1 font-mono text-xs">v{asset.version}</span>}</div>
              <p className="mt-3 break-words text-sm text-muted-foreground">{asset.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 border-y py-3 text-xs text-muted-foreground">{asset.size_mb > 0 && <span>{asset.size_mb.toFixed(1)} MB</span>}{asset.author && <span>{asset.author}</span>}</div>
              <div className="mt-auto pt-5">{earned ? <Button asChild className="w-full"><a href={asset.file_url} download={asset.filename} target={asset.file_url.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer"><Download /> Download {asset.title}</a></Button> : <Button onClick={() => start(asset)} disabled={isPending || !available} className="w-full"><Play /> {asset.sponsor_type === 'video' ? 'Watch & download' : 'Get download'}</Button>}
              <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">{earned ? 'Unlocked for this page visit.' : !available && !isPending ? 'Waiting for sponsor details.' : asset.sponsor_type === 'video' ? 'Complete one sponsor video for this asset. No ad click required.' : asset.sponsor_type === 'website' ? 'Visit the sponsor website to unlock this asset.' : 'Sponsor visits are optional.'}</p></div>
            </div>
          </article>;
        })}
      </div>
      {filtered.length === 0 && <p className="py-16 text-center text-muted-foreground">{items.length ? 'No assets match your search.' : 'New resources are coming soon.'}</p>}
      {items.filter(a => a.sponsor_type === 'adsense').map(a => <DownloadAd key={a.id} code={a.sponsor_code} />)}
      <section className="mt-10 space-y-3 border-t pt-6 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">How to choose the best free WordPress theme</h2>
        <p>These WordPress free themes cover common site types: WoodMart for WooCommerce shops, Newspaper for blogs and magazines, Frutin for organic food stores, and Elito as a free portfolio theme kit. Pick the theme that matches your content first, then check speed, mobile layout and plugin needs.</p>
        <h3 className="font-semibold text-foreground">Installing a downloaded theme</h3>
        <p>In WordPress go to Appearance → Themes → Add New → Upload Theme, choose the theme ZIP, then activate it. Install the child theme too if you plan to edit code, and install any bundled plugins the theme asks for.</p>
        <h3 className="font-semibold text-foreground">Before you go live</h3>
        <p>Test the theme on a staging site, scan files, keep a backup, and use our <a className="text-brand-blue underline" href="/tools/wordpress-theme-detector">WordPress Theme Detector</a> to see which themes similar sites use.</p>
      </section>
      <aside className="mt-10 space-y-3 border-t pt-6 text-sm text-muted-foreground"><h2 className="flex items-center gap-2 font-semibold text-foreground"><LockKeyhole className="size-4 text-brand-blue" /> Sponsored access</h2><p>Video sponsors require completed viewing. Website sponsors require opening their website. Banner visits are optional. AdSense does not restrict downloads.</p><p>Files are supplied by the site owner. Review licenses and scan files before installing. Vendor support, purchase codes and automatic updates are not promised.</p></aside>
      <Dialog open={show} onOpenChange={(v) => { setShow(v); if (!v) video.current?.pause(); }}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
          <DialogTitle>Advertisement</DialogTitle>
          <DialogDescription>{selected?.sponsor_type === 'video' ? `Complete this sponsor video to unlock ${selected.title}.` : selected?.sponsor_type === 'website' ? `Visit the sponsor website to unlock ${selected.title}.` : `Sponsored download: ${selected?.title}. Visiting the sponsor is optional.`}</DialogDescription>
          {selected?.sponsor_type !== 'video' && <>{consent.ads ? <div className="space-y-4">{selected?.sponsor_type === 'banner' && selected.banner_url && <img src={selected.banner_url} alt={selected.banner_url ? selected.sponsor_title || 'Sponsor banner' : ''} className="max-h-72 w-full object-contain" />}{selected?.sponsor_title && <p className="font-semibold">{selected.sponsor_title}</p>}{selected?.sponsor_url && (selected.sponsor_type === 'website' ? <Button variant="outline" onClick={visitWebsite}>Visit sponsor</Button> : <Button variant="outline" asChild><a href={selected.sponsor_url} target="_blank" rel="noopener noreferrer sponsored">Visit sponsor</a></Button>)}</div> : <><p className="text-sm text-muted-foreground">Sponsor content is hidden because advertising consent is off.</p>{selected?.sponsor_type === 'website' && <Button variant="outline" onClick={openConsent}>Cookie settings</Button>}</>}<Button disabled={!selected || !canContinueSponsor(selected, websiteOpened) || (selected.sponsor_type === 'website' && !consent.ads)} onClick={() => { if (!selected || !canContinueSponsor(selected, websiteOpened) || (selected.sponsor_type === 'website' && !consent.ads)) return; setUnlocked(previous => new Set([...previous, selected.id])); setShow(false); }}>Continue to download</Button></>}
          {selected?.sponsor_type === 'video' && source && consent.ads && <video ref={video} src={source} controls playsInline preload="metadata" className="aspect-video w-full rounded-md bg-muted" controlsList="nodownload noplaybackrate" disablePictureInPicture onPlay={() => { lastTick.current = performance.now(); }} onTimeUpdate={tick} onSeeking={() => { const v = video.current; if (v && v.currentTime > watched.current + 0.5) v.currentTime = watched.current; }} onRateChange={() => { const v = video.current; if (v) v.playbackRate = 1; }} onEnded={() => {
            const v = video.current;
            if (v && rewardEarned(watched.current, v.duration, v.ended)) { if (selected) setUnlocked(previous => new Set([...previous, selected.id])); setShow(false); }
            else setError('The video was not completed. Please replay it to unlock the download.');
          }} onError={() => setError('The sponsor video could not load. Please try again later.')} />}
          {selected?.sponsor_type === 'video' && <progress aria-label="Sponsor video progress" value={progress} max={100} className="h-2 w-full accent-primary" />}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
        </DialogContent>
      </Dialog>
      <PageExtras o={o} />
    </div>
  );
}