import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Download, Play, Package, CheckCircle2, LockKeyhole, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useConsent } from '@/components/site/consent';
import { useSettings } from '@/lib/site-data';
import { pageHead } from '@/lib/seo';
import { rewardEarned, watchedProgress, safeSponsorVideo } from '@/lib/download-reward';
import archive from '@/assets/woodmart.zip.asset.json';
import preview from '@/assets/woodmart-preview.png.asset.json';

export const Route = createFileRoute('/downloads')({
  head: () => pageHead({ title: 'Asset Downloads — LogoColorStudio', description: 'Browse website assets including the WoodMart WordPress theme, with sponsored-video download access.', path: '/downloads' }),
  component: Downloads,
});

function Downloads() {
  const { data: settings, isPending } = useSettings();
  const { consent, open: openConsent } = useConsent();
  const [show, setShow] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const watched = useRef(0);
  const lastTick = useRef(0);
  const source = safeSponsorVideo(settings?.download_video_url);
  const ready = !!source && settings?.download_video_enabled === 'on';

  const start = () => {
    if (!consent.ads) { openConsent(); return; }
    if (!ready) return;
    watched.current = 0; lastTick.current = performance.now();
    setProgress(0); setError(''); setShow(true);
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
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Asset downloads</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Themes and resources for your next website.</p>
      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <article className="overflow-hidden rounded-lg border bg-card">
          <img src={preview.url} alt="WoodMart theme preview showing its furniture shop layouts" className="aspect-[4/3] w-full object-contain bg-muted" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase text-brand-green">WordPress theme</p><h2 className="mt-2 text-2xl font-bold">WoodMart</h2></div><span className="rounded-md border px-3 py-1 font-mono text-xs">v8.5.7</span></div>
            <p className="mt-3 text-sm text-muted-foreground">WoodMart theme archive by XTemos. Requires WordPress and PHP 7.4 or newer.</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y py-3 text-xs text-muted-foreground"><span>ZIP archive</span><span>{(archive.size / 1024 / 1024).toFixed(1)} MB</span><span>Author: XTemos</span></div>
            <div className="mt-5">
              {unlocked ? <Button asChild className="w-full sm:w-auto"><a href={archive.url} download="woodmart-8.5.7.zip"><Download /> Download WoodMart</a></Button> : <Button onClick={start} disabled={isPending || !ready} className="w-full sm:w-auto">{isPending ? <Loader2 className="animate-spin" /> : <Play />} Watch sponsor video &amp; download</Button>}
              <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">{unlocked ? 'Your download is unlocked for this page visit.' : !ready && !isPending ? 'Downloads open when a sponsor video is available.' : 'Complete one sponsor video to unlock this ZIP. No ad click required.'}</p>
            </div>
          </div>
        </article>
        <aside className="space-y-6 py-2">
          <div className="flex items-center gap-3"><LockKeyhole className="size-5 text-brand-blue" /><h2 className="font-semibold">Sponsored access</h2></div>
          <p className="text-sm leading-relaxed text-muted-foreground">Choose to watch a sponsor video in exchange for this download. You can close the video at any time; incomplete viewing will not unlock the file.</p>
          <div className="border-t pt-5"><h2 className="font-semibold">Before you install</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This archive is supplied by the site owner. Vendor support, automatic updates and a purchase code are not included or promised. Review its license and scan the ZIP before installing.</p></div>
          {unlocked && <p className="flex items-center gap-2 text-sm text-brand-green"><CheckCircle2 className="size-4" /> Ready to download</p>}
        </aside>
      </div>
      <Dialog open={show} onOpenChange={(v) => { setShow(v); if (!v) video.current?.pause(); }}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
          <DialogTitle>Advertisement</DialogTitle>
          <DialogDescription>Complete this sponsor video to unlock WoodMart 8.5.7.</DialogDescription>
          {source && consent.ads && <video ref={video} src={source} controls playsInline preload="metadata" className="aspect-video w-full rounded-md bg-muted" controlsList="nodownload noplaybackrate" disablePictureInPicture onPlay={() => { lastTick.current = performance.now(); }} onTimeUpdate={tick} onSeeking={() => { const v = video.current; if (v && v.currentTime > watched.current + 0.5) v.currentTime = watched.current; }} onRateChange={() => { const v = video.current; if (v) v.playbackRate = 1; }} onEnded={() => {
            const v = video.current;
            if (v && rewardEarned(watched.current, v.duration, v.ended)) { setUnlocked(true); setShow(false); }
            else setError('The video was not completed. Please replay it to unlock the download.');
          }} onError={() => setError('The sponsor video could not load. Please try again later.')} />}
          <progress aria-label="Sponsor video progress" value={progress} max={100} className="h-2 w-full accent-primary" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button variant="outline" onClick={() => setShow(false)}>Cancel</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}