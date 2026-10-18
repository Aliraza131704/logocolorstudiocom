import { describe, expect, it } from 'vitest';
import { rewardEarned, watchedProgress, safeSponsorVideo } from '@/lib/download-reward';

describe('Rewarded asset downloads', () => {
  it('unlocks only after full video completion', () => {
    expect(rewardEarned(30, 30, true)).toBe(true);
    expect(rewardEarned(30, 30, false)).toBe(false);
    expect(rewardEarned(10, 30, true)).toBe(false);
    expect(rewardEarned(0, Infinity, true)).toBe(false);
  });
  it('does not count skipped or paused footage', () => {
    expect(watchedProgress(2, 30, 0.25, true)).toBe(2);
    expect(watchedProgress(2, 2.25, 0.25, false)).toBe(2);
    expect(watchedProgress(2, 2.25, 0.25, true)).toBe(2.25);
  });
  it('rejects non-HTTPS external sponsor URLs', () => {
    expect(safeSponsorVideo('javascript:alert(1)')).toBeNull();
    expect(safeSponsorVideo('http://example.com/ad.mp4')).toBeNull();
    expect(safeSponsorVideo('https://example.com/ad.mp4')).toBe('https://example.com/ad.mp4');
  });
});