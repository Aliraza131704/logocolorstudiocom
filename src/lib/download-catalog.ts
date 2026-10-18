import { z } from 'zod';
import archive from '@/assets/woodmart.zip.asset.json';
import preview from '@/assets/woodmart-preview.png.asset.json';

export const CATALOG_KEY = 'download_catalog';
export function assetUrl(value: string): boolean {
  if (/^\/__l5e\/assets-v1\/[^\s]+$/.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
export const assetSchema = z.object({
  id: z.string().min(1), title: z.string().trim().min(1).max(200),
  description: z.string().max(2000), category: z.string().trim().min(1).max(80),
  version: z.string().max(80), author: z.string().max(200),
  file_url: z.string().refine(assetUrl, 'Enter a valid HTTPS file URL'),
  preview_url: z.string().refine(v => !v || assetUrl(v), 'Enter a valid HTTPS image URL'),
  video_url: z.string().refine(v => !v || assetUrl(v), 'Enter a valid HTTPS video URL'),
  filename: z.string().min(1).max(200).regex(/^[^/\\]+$/, 'Filename must not contain slashes'),
  size_mb: z.number().nonnegative(), published: z.boolean(), rights_confirmed: z.literal(true),
});
export type DownloadAsset = z.infer<typeof assetSchema>;
export const INITIAL_CATALOG: DownloadAsset[] = [{
  id: 'woodmart-8-5-7', title: 'WoodMart', description: 'WoodMart theme archive by XTemos. Requires WordPress and PHP 7.4 or newer.',
  category: 'WordPress themes', version: '8.5.7', author: 'XTemos', file_url: archive.url,
  preview_url: preview.url, video_url: '', filename: 'woodmart-8.5.7.zip', size_mb: archive.size / 1024 / 1024,
  published: true, rights_confirmed: true,
}];
export function parseCatalog(raw: string): DownloadAsset[] {
  if (!raw) return INITIAL_CATALOG;
  const parsed = z.array(assetSchema).parse(JSON.parse(raw));
  if (new Set(parsed.map(a => a.id)).size !== parsed.length) throw new Error('Duplicate asset IDs');
  return parsed;
}
export function filterAssets(items: DownloadAsset[], search: string, category: string): DownloadAsset[] {
  const q = search.trim().toLowerCase();
  return items.filter(a => a.published && (category === 'all' || a.category === category) && `${a.title} ${a.description} ${a.author}`.toLowerCase().includes(q));
}