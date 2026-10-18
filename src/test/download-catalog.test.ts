import { describe, it, expect } from 'vitest';
import { INITIAL_CATALOG, parseCatalog, filterAssets, assetSchema, sponsorReady, canContinueSponsor } from '@/lib/download-catalog';
describe('Multiple download assets', () => {
  it('requires opening the website sponsor before continuing', () => {
    const first = INITIAL_CATALOG[0];
    if (!first) throw new Error('Missing initial asset');
    const website = { ...first, sponsor_type: 'website' as const, sponsor_url: 'https://example.com' };
    expect(canContinueSponsor(website, false)).toBe(false);
    expect(canContinueSponsor(website, true)).toBe(true);
    expect(canContinueSponsor({ ...website, sponsor_url: '' }, true)).toBe(false);
  });
  it('never requires an AdSense click to continue', () => {
    const first = INITIAL_CATALOG[0];
    if (!first) throw new Error('Missing initial asset');
    expect(canContinueSponsor({ ...first, sponsor_type: 'adsense' }, false)).toBe(true);
  });
  it('keeps AdSense downloads independent of ad configuration', () => {
    const first = INITIAL_CATALOG[0];
    if (!first) throw new Error('Missing initial asset');
    expect(sponsorReady({ ...first, sponsor_type: 'adsense' }, '', 'off')).toBe(true);
  });
  it('supports banner and website without requiring video', () => {
    const first = INITIAL_CATALOG[0];
    if (!first) throw new Error('Missing initial asset');
    expect(sponsorReady({ ...first, sponsor_type: 'banner', banner_url: 'https://example.com/banner.png' }, '', 'off')).toBe(true);
    expect(sponsorReady({ ...first, sponsor_type: 'website', sponsor_url: 'https://example.com' }, '', 'off')).toBe(true);
    expect(sponsorReady({ ...first, sponsor_type: 'banner', banner_url: '' }, '', 'off')).toBe(false);
  });
  it('keeps an intentionally empty library empty', () => { expect(parseCatalog('[]')).toEqual([]); });
  it('lists multiple published items and excludes drafts', () => {
    const first = INITIAL_CATALOG[0];
    if (!first) throw new Error('Missing initial asset');
    const rows = [first,{ ...first,id:'second',title:'Another theme' },{ ...first,id:'draft',published:false }];
    expect(filterAssets(rows,'','all').map(a => a.id)).toEqual(['woodmart-8-5-7','second']);
    expect(filterAssets(rows,'another','all').map(a => a.id)).toEqual(['second']);
  });
  it('requires distribution permission and safe URLs for each item', () => {
    const first = INITIAL_CATALOG[0];
    expect(assetSchema.safeParse({ ...first,rights_confirmed:false }).success).toBe(false);
    expect(assetSchema.safeParse({ ...first,file_url:'javascript:alert(1)' }).success).toBe(false);
  });
});