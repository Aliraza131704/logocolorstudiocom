import { describe, it, expect } from 'vitest';
import { INITIAL_CATALOG, parseCatalog, filterAssets, assetSchema } from '@/lib/download-catalog';
describe('Multiple download assets', () => {
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