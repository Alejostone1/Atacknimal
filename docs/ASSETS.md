# ATACKNIMAL · Imágenes y datos reales

> Estado: Fase 4b. Condiciones de los proveedores revisadas el **2026-10-28**. Hay que revisarlas de nuevo antes de cualquier publicación comercial.
> Datos: [`packages/content/data/images.json`](../packages/content/data/images.json) y [`packages/content/data/facts.json`](../packages/content/data/facts.json).
> Herramienta: [`tools/curator`](../tools/curator/src/cli.ts).

---

## 1. Principios

1. **Fotografías reales, no generadas.** Cada animal se muestra con una foto real de un proveedor con licencia abierta.
2. **Trazabilidad completa.** Cada imagen guarda proveedor, id, URL de la página original, autor, licencia, URL de la licencia, texto de atribución, fecha de obtención y estado.
3. **Que una API devuelva una imagen no significa que podamos usarla.** Solo se aceptan licencias de la lista blanca (§2).
4. **Curación humana.** La herramienta propone; una persona revisa la especie y que no haya contenido sangriento, y aprueba.
5. **Nunca se consulta una API durante una partida.** Las imágenes son contenido curado y versionado.

## 2. Licencias permitidas

| Licencia | Se permite | Obligaciones |
|---|---|---|
| CC0 / Dominio público | ✅ | Ninguna (atribuimos igualmente) |
| CC BY | ✅ | Atribución: autor, licencia, enlace a la fuente |
| CC BY-SA | ✅ | Atribución. Si se distribuye un **archivo derivado**, debe llevar la misma licencia (ver §4) |
| Licencia Unsplash / Pexels | ✅ (si se usan) | Las condiciones de su API (§3) |
| **CC BY-NC**, **CC BY-ND** y "todos los derechos reservados" | ❌ | NC impediría monetizar más adelante; ND impediría adaptar la imagen a la carta |

El tipo `LicenseId` de `packages/content` solo admite las licencias permitidas, y los tests fallan si una imagen activa no la cumple.

## 3. Proveedores

| Proveedor | Estado | Condiciones relevantes |
|---|---|---|
| **Wikimedia Commons** | ✅ Fuente principal | Licencia y autor por archivo (`extmetadata`). Hay que identificarse con un User-Agent descriptivo (política de User-Agent de Wikimedia). Las miniaturas solo se sirven en anchos estándar: 500, 960 y 1280 sí; 640 devuelve error 400 |
| **iNaturalist** | ✅ Alternativa | Licencia **por foto** (`license_code`), independiente de la observación. La foto por defecto de un taxón suele ser CC BY-NC, así que se filtra con `photo_license=cc0,cc-by,cc-by-sa`. Límite recomendado de ≤ 60 peticiones/min; las descargas masivas de imágenes no están permitidas |
| **Wikidata** | ✅ Datos reales | Mismo User-Agent. `query.wikidata.org` (SPARQL) no resuelve desde la red de desarrollo; se usa `www.wikidata.org/w/api.php` |
| **Unsplash** | ⏸ No usado | Exige hotlink de `photo.urls`, notificar `download_location` al elegir y atribuir "Foto de X en Unsplash" con UTM. **Su API no resuelve desde la red de desarrollo** |
| **Pexels** | ⏸ No usado | Exige un enlace visible a Pexels y créditos al fotógrafo; 200 peticiones/hora. Requiere clave de API (`.env`) |

Fuentes consultadas: [Pexels API](https://www.pexels.com/api/documentation/), [Política de User-Agent de Wikimedia](https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy), [Directrices de la API de Unsplash](https://help.unsplash.com/api-guidelines/unsplash-api-guidelines) y [página para desarrolladores de iNaturalist](https://chile.inaturalist.org/pages/developers).

## 4. Cómo se muestran

- **Hotlink:** la carta usa `imageUrl`, una miniatura de 1280 px servida por el proveedor. No descargamos ni redistribuimos archivos.
- **Recorte por CSS:** `object-fit: cover` más `object-position` según `focalPoint`. No generamos archivos recortados, así que una imagen CC BY-SA no produce obras derivadas distribuidas.
- **Atribución visible:** icono ⓘ en la carta con `attribution` y enlace a `sourceUrl`, más una pantalla de **Créditos** con todas las imágenes (Fase 5).

## 5. Datos reales (`facts.json`)

| Dato | Fuente | Estado |
|---|---|---|
| Elemento de Wikidata | Wikidata (`P225` = nombre científico) | ✅ 11/11 |
| Artículo de Wikipedia en español | Wikidata (sitelinks) | ✅ 11/11 |
| Estado de conservación UICN | Wikidata (`P141`), guardado como código (LC, NT, VU, EN, CR, EW, EX, DD) | ✅ 11/11 |
| Masa, longitud, velocidad | — | ⏳ **Curación manual con fuente citada** |

**Por qué no se automatizan la masa, la longitud ni la velocidad:** en Wikidata faltan para varios animales (Lobo y Elefante no tienen masa) y mezclan crías y adultos sin calificar. Por ejemplo, el Guepardo tiene "275 g" junto a "40,2 kg", y el Pingüino emperador "425 g". Publicarlos sin revisar enseñaría datos falsos. El esquema ya tiene `massKg`, `lengthM` y `speedKmh`, cada uno con su fuente obligatoria.

## 6. Herramienta de curación

```bash
npm run curate -- facts
npm run curate -- search
npm run curate -- propose
npm run curate -- pick <animal> <número>
npm run curate -- focus <animal> <x> <y>
npm run curate -- approve <animal|all>
```

1. `facts`: rellena `facts.json` desde Wikidata.
2. `search`: busca candidatas en Commons (primero *Quality images* que representan la especie) y en iNaturalist (research grade, licencias abiertas). Escribe `tools/curator/out/candidates.json` y la galería `tools/curator/out/gallery.html` (ambos ignorados por git).
3. `propose`: elige la candidata mejor puntuada **sin avisos** para cada animal sin foto.
4. `pick`: cambia la elegida por el número que aparece en la galería.
5. `focus`: punto que debe quedar visible al recortar.
6. `approve`: marca como `approved` tras la revisión humana.

**Puntuación:** se premian el encuadre apaisado, la resolución, la calidad reconocida por Commons y las licencias más simples. Se penalizan con aviso los títulos que indican caza o sangre, crías, cautividad, o que no es una foto de un animal vivo (láminas, grabados, mosaicos, piezas de museo, cráneos…).

**La revisión visual es imprescindible.** En la primera ronda, el filtro dejó pasar una lámina del siglo XVIII (Tiburón) y una pieza del Museo de Bellas Artes de Lyon (Cocodrilo), y la propuesta de Pingüino era un **pingüino rey**, no un emperador. Las tres se detectaron mirando las fotos.

## 7. Selección actual (estado `approved`, aprobada el 2026-10-28)

| Animal | Foto | Autor | Licencia |
|---|---|---|---|
| Guepardo | [STL Cheetah](https://commons.wikimedia.org/wiki/File:STL_Cheetah.jpg) (Commons) | Daniel Schwen | CC BY-SA 4.0 |
| Águila real | [Chrysaetos La Cañada 20120114 1](https://commons.wikimedia.org/wiki/File:Chrysaetos_La_Ca%C3%B1ada_20120114_1.jpg) (Commons) | Juan lacruz | CC BY 3.0 |
| Oso pardo | [Ursus arctos Ähtäri](https://commons.wikimedia.org/wiki/File:Ursus_arctos_%C3%84ht%C3%A4ri.jpg) (Commons) | kallerna | CC BY-SA 3.0 |
| Tiburón blanco | [Great White Shark (14730719119)](https://commons.wikimedia.org/wiki/File:Great_White_Shark_(14730719119).jpg) (Commons) | Elias Levy | CC BY 2.0 |
| Lobo | [Loup gris commun DSCF1575](https://commons.wikimedia.org/wiki/File:Loup_gris_commun_DSCF1575.jpg) (Commons) | Musicaline | CC BY-SA 4.0 |
| Elefante | [178 Male African bush elephant in Etosha National Park](https://commons.wikimedia.org/wiki/File:178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg) (Commons) | Giles Laurent | CC BY-SA 4.0 |
| Rinoceronte | [Adult White Rhinoceros (CWPG)](https://commons.wikimedia.org/wiki/File:Adult_White_Rhinoceros_(Ceratotherium_simum_simum)_(CWPG).jpg) (Commons) | Vauxford | CC BY-SA 4.0 |
| Cocodrilo | [Nile crocodile in the Zambezi](https://commons.wikimedia.org/wiki/File:Nile_crocodile_in_the_Zambezi.jpg) (Commons) | Bernard Gagnon | CC BY-SA 4.0 |
| Tigre | [Tiger 1 (India)](https://commons.wikimedia.org/wiki/File:Tiger_1_(India).jpg) (Commons) | Fitindia | CC BY-SA 4.0 |
| Pingüino | [Aptenodytes forsteri, iNaturalist 351615847](https://www.inaturalist.org/photos/351615847) | steve b | CC0 |
| Ballena | [Anim1754 - NOAA Photo Library](https://commons.wikimedia.org/wiki/File:Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg) (Commons) | NOAA Photo Library | Dominio público |

`images.json` es la fuente de verdad. Esta tabla es un resumen.

**Observaciones de la revisión:**
- El **Guepardo** (St. Louis), el **Oso** (Ähtäri) y el **Rinoceronte** están en parques zoológicos. El resto son fotos en libertad.
- El **Oso** sostiene un pez pequeño: no es sangriento, pero vale la pena revisarlo.
- En **Elefante** se descartó una candidata porque su campo de autor incluía el correo personal del fotógrafo y una petición de contacto previo para uso comercial. Ahora la herramienta avisa de estos casos ("autoría con texto largo").
