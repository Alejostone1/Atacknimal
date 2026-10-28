import type { LicenseId } from '@atacknimal/content';

/**
 * Traduce el código de licencia de Commons (`extmetadata.License`, por ejemplo "cc-by-sa-4.0")
 * a una licencia permitida, o `null` si no está en la lista blanca (NC, ND, desconocidas…).
 */
export function commonsLicense(code: string | undefined): LicenseId | null {
  const value = (code ?? '').toLowerCase().trim();
  if (value === 'cc0' || value.startsWith('cc0-')) return 'cc0';
  if (value === 'pd' || value.startsWith('pd-') || value === 'public domain')
    return 'public-domain';
  if (/-(nc|nd)\b|-nc-|-nd-/.test(value)) return null;
  if (/^cc-by-sa-\d/.test(value)) return 'cc-by-sa';
  if (/^cc-by-\d/.test(value)) return 'cc-by';
  return null;
}

/** Traduce `license_code` de iNaturalist; NC y ND se rechazan. */
export function inaturalistLicense(code: string | null | undefined): LicenseId | null {
  switch (code) {
    case 'cc0':
      return 'cc0';
    case 'cc-by':
      return 'cc-by';
    case 'cc-by-sa':
      return 'cc-by-sa';
    case null:
    case undefined:
    default:
      return null;
  }
}

/** Convierte un fragmento HTML de atribución en texto plano y su primer enlace. */
export function plainAuthor(html: string | undefined): { name: string; url?: string } {
  const source = html ?? '';
  const href = /href="([^"]+)"/.exec(source)?.[1];
  const name = source
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  const url = href === undefined ? undefined : href.startsWith('//') ? `https:${href}` : href;
  return url !== undefined && url.startsWith('https://') ? { name, url } : { name };
}
