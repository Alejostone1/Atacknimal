/**
 * Varias resoluciones de una misma foto para que el navegador elija según el tamaño en pantalla
 * y la densidad del dispositivo (un celular necesita 2–3 píxeles por píxel CSS). Las fotos
 * siguen enlazadas al proveedor: aquí solo se derivan URLs que él mismo publica.
 */
import type { AnimalImage } from '@atacknimal/content';

/** Anchos estándar que Wikimedia sirve sin generar miniaturas nuevas (otros redondean a estos). */
const COMMONS_WIDTHS = [330, 500, 960, 1280, 1920] as const;

/** Tamaños que publica iNaturalist para cada foto. */
const INATURALIST_SIZES = [
  { name: 'medium', width: 500 },
  { name: 'large', width: 1024 },
  { name: 'original', width: 2048 },
] as const;

/** Lo mínimo de una foto para derivar sus resoluciones (vale para animales y hábitats). */
export type PhotoSource = Pick<AnimalImage, 'provider' | 'imageUrl' | 'thumbnailUrl' | 'width'>;

export interface PhotoSet {
  readonly src: string;
  readonly srcSet: string | undefined;
  readonly sizes: string;
}

function commons(image: PhotoSource): string[] {
  const match = /\/(\d+)px-/.exec(image.imageUrl);
  if (match === null) return [];
  return COMMONS_WIDTHS.filter((w) => w <= image.width).map(
    (w) => `${image.imageUrl.replace(match[0], `/${String(w)}px-`)} ${String(w)}w`,
  );
}

function inaturalist(image: PhotoSource): string[] {
  const match = /\/(medium|large|original)\.(jpe?g|png)$/i.exec(image.imageUrl);
  if (match === null) return [];
  return INATURALIST_SIZES.filter((s) => s.width <= Math.max(image.width, 500)).map(
    (s) =>
      `${image.imageUrl.replace(match[0], `/${s.name}.${match[2] ?? 'jpeg'}`)} ${String(s.width)}w`,
  );
}

/**
 * `sizes` describe el ancho con que se mostrará la foto (sintaxis HTML), por ejemplo
 * `"(min-width: 720px) 240px, 45vw"`.
 */
export function photoSet(image: PhotoSource, sizes: string): PhotoSet {
  const candidates =
    image.provider === 'wikimedia-commons'
      ? commons(image)
      : image.provider === 'inaturalist'
        ? inaturalist(image)
        : [];
  return {
    src: image.thumbnailUrl,
    srcSet: candidates.length > 0 ? candidates.join(', ') : undefined,
    sizes,
  };
}
