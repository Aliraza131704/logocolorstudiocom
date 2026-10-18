export function safeSponsorVideo(value: string | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('/__l5e/assets-v1/')) return value;
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

// Advancing the playhead alone is not evidence of watching the video.
export function watchedProgress(previous: number, current: number, elapsed: number, playing: boolean): number {
  if (!playing || current < previous || current - previous > 1.5 || elapsed < 0 || current - previous > elapsed + 0.35) return previous;
  return current;
}

export function rewardEarned(watched: number, duration: number, ended: boolean): boolean {
  return ended && Number.isFinite(duration) && duration > 0 && watched >= duration - 0.5;
}