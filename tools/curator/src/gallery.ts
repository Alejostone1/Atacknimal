import type { Animal, AnimalImage } from '@atacknimal/content';
import type { Candidate } from './candidates.ts';

const PER_ANIMAL = 6;

const escape = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => `&#${String(c.charCodeAt(0))};`);

/**
 * Página local para revisar candidatas: la elegida aparece marcada.
 * Las miniaturas se cargan directamente del proveedor (sin descargar nada).
 */
export function renderGallery(
  animals: readonly Animal[],
  candidates: Readonly<Record<string, readonly Candidate[]>>,
  chosen: readonly AnimalImage[],
): string {
  const sections = animals.map((animal) => {
    const pick = chosen.find((i) => i.animalId === animal.id && i.status !== 'retired');
    const list = (candidates[animal.id] ?? []).slice(0, PER_ANIMAL);
    const cards = list.map((c, index) => {
      const selected = pick?.sourceId === c.image.sourceId;
      return `<figure class="${selected ? 'selected' : ''}">
  <img src="${escape(c.image.thumbnailUrl)}" alt="${escape(c.image.title)}" loading="lazy">
  <figcaption>
    <b>#${String(index)}</b> · ${selected ? `<span class="tag">${escape(pick.status)}</span> · ` : ''}puntos ${c.score.toFixed(1)}${c.quality ? ' · calidad' : ''}<br>
    ${escape(c.image.license)} · ${escape(c.image.author)} · ${String(c.image.width)}×${String(c.image.height)}<br>
    ${c.warnings.length > 0 ? `<span class="warn">⚠ ${escape(c.warnings.join(', '))}</span><br>` : ''}
    <a href="${escape(c.image.sourceUrl)}">${escape(c.image.title)}</a>
  </figcaption>
</figure>`;
    });
    return `<section><h2>${escape(animal.name)} <small>${escape(animal.scientificName)} · ${escape(animal.id)}</small></h2>
<div class="grid">${cards.join('\n') || '<p>Sin candidatas con licencia abierta.</p>'}</div></section>`;
  });

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Curación de fotos</title>
<style>
  :root { color-scheme: dark; --bg:#0f1512; --panel:#18211c; --text:#e8efe9; --muted:#9db0a3; --accent:#f5b72a; --warn:#ff8a65; }
  body { margin:0; padding:16px; background:var(--bg); color:var(--text); font:14px/1.4 system-ui, sans-serif; }
  h1 { margin:0 0 4px; } p.help { color:var(--muted); margin:0 0 16px; }
  h2 { margin:24px 0 8px; } small { color:var(--muted); font-weight:normal; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:12px; }
  figure { margin:0; background:var(--panel); border:2px solid transparent; border-radius:8px; overflow:hidden; }
  figure.selected { border-color:var(--accent); }
  img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; background:#000; }
  figcaption { padding:8px; color:var(--muted); font-size:12px; word-break:break-word; }
  figcaption b, .tag { color:var(--accent); } .warn { color:var(--warn); } a { color:var(--text); }
</style></head><body>
<h1>Curación de fotos · ATACKNIMAL</h1>
<p class="help">El borde amarillo marca la foto elegida. Para cambiarla: <code>npm run curate -- pick &lt;animal&gt; &lt;#&gt;</code>. Para aprobarla tras revisarla: <code>npm run curate -- approve &lt;animal&gt;</code> (o <code>all</code>).</p>
${sections.join('\n')}
</body></html>
`;
}
