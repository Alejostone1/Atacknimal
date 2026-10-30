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

- **Hotlink:** la aplicación enlaza las miniaturas que sirve el proveedor. No descargamos ni redistribuimos archivos.
- **Varias resoluciones (Fase 10b):** cada foto se ofrece en los anchos estándar del proveedor (Commons: 330, 500, 960, 1280 y 1920 px; iNaturalist: 500, 1024 y original) con `srcset`/`sizes`, y el navegador elige según el tamaño en pantalla y la densidad del dispositivo. Así las fotos se ven nítidas en celulares sin descargar de más en pantallas pequeñas.
- **Recorte por CSS:** `object-fit: cover` más `object-position` según `focalPoint`. No generamos archivos recortados, así que una imagen CC BY-SA no produce obras derivadas distribuidas.
- **Atribución visible (Fase 5, ✅):** debajo de la foto en la ficha de cada animal (autor, licencia y enlace al original), en la portada para la foto de fondo y en la pantalla **Créditos** con todas las imágenes. Las cartas de la cuadrícula no llevan crédito propio porque son botones o enlaces y no pueden contener otros. Las cartas de combate (Fase 6) lo mostrarán con un icono ⓘ.

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

## 8. Fotos de hábitat (`habitats.json`, Fase 10b)

Los hábitats se eligen con una foto real a sangre (decisión #039), con las mismas reglas de licencia y atribución que los animales. Se buscan entre las *Quality images* de Commons con `npm run curate -- habitats` (galería en `tools/curator/out/habitats.html`) y se eligen con `npm run curate -- habitat <hábitat> <número>`. Criterio: paisaje amplio, sin animales ni personas que compitan con las cartas.

| Hábitat | Foto | Autor | Licencia |
|---|---|---|---|
| Aire | Small sun dog in cumulus | W.carter | CC0 |
| Agua | Waves at La Corniche | Christian Ferrer | CC BY 4.0 |
| Tierra | Árbol solitario en un brezal abierto (Delleboersterheide, Países Bajos) | Dominicus Johannes Bergsma | CC BY-SA 4.0 |
| Árboles | Beech Forest, Great Otway National Park | Dietmar Rabich | CC BY-SA 4.0 |

Se descartó una primera foto de Agua (*Les otaries du Cap*) porque mostraba lobos marinos. Los créditos completos están en la pantalla **Créditos**. Estado: `proposed` hasta que el usuario las revise en el celular.

## 9. Fotos de los 9 animales nuevos (Fase 10b, estado `proposed`)

Buscadas con `npm run curate -- search` y revisadas una a una en la galería. Se descartaron varias propuestas automáticas: un cuadro de Henri Rousseau (*La Bohémienne endormie*) para el León, una vitrina de esqueletos para el Gorila, un paisaje de hielo sin oso para el Oso polar, una orca de espectáculo en Loro Parque y una pitón tan camuflada que no se veía. Para el Gorila se eligió una foto con autor identificado porque la mejor candidata no lo tenía y su licencia (CC BY-SA 2.5) obliga a citarlo. Al Hipopótamo se le ajustó el punto focal (mira a la derecha).

| Animal | Foto | Autor | Licencia | Fuente |
|---|---|---|---|---|
| León | Lion (Panthera leo) old male Chobe | Charles J. Sharp | CC BY-SA 4.0 | Commons |
| Gorila | Gorilla gorilla (iNaturalist 327975185) | Tony King | CC BY | iNaturalist |
| Jaguar | Jaguar (Panthera onca palustris) male Rio Negro 2 | Charles J. Sharp | CC BY-SA 4.0 | Commons |
| Orca | Orcinus orca (iNaturalist 282690764) | steve b | CC0 | iNaturalist |
| Halcón peregrino | Falco peregrinus - 01 | Carlos Delgado | CC BY-SA 4.0 | Commons |
| Hipopótamo | Hipopótamo (Hippopotamus amphibius), parque nacional de Chobe, Botsuana, 2018-07-28, DD 82 | Diego Delso | CC BY-SA 4.0 | Commons |
| Pitón reticulada | Malayopython reticulatus (iNaturalist 721622660) | John Witton | CC BY | iNaturalist |
| Oso polar | Polar bear near Sjuøyane with a typical gesture assessing the situation | Andreas Weith | CC BY-SA 4.0 | Commons |
| Búho real | Bubo bubo.003 - Betanzos | Fernando Losada Rodríguez | CC BY-SA 4.0 | Commons |

Pendientes de la aprobación del usuario (`npm run curate -- approve all`).

## 10. Fotos de los 6 animales nuevos (Fase 10c, estado `proposed`)

Buscadas con `npm run curate -- search` y revisadas una a una. Se descartó la propuesta automática del Perezoso, que era un **dibujo a lápiz** de un archivo histórico (no es una foto), y se cambiaron la Ardilla y el Colibrí por fotos más nítidas y con más color (ardilla roja con penachos; colibrí macho con la cabeza magenta). Al Orangután y al Murciélago se les ajustó el punto focal.

| Animal | Foto | Autor | Licencia | Fuente |
|---|---|---|---|---|
| Murciélago (zorro volador) | 046 Indian flying fox in Keoladeo National Park Photo by Giles Laurent | Giles Laurent | CC BY-SA 4.0 | Commons |
| Cóndor andino | Andean condor (Vultur gryphus) at Colca Canyon | Thomas Fuhrmann | CC BY-SA 4.0 | Commons |
| Colibrí de Anna | Calypte anna (iNaturalist 447453303) | William Walker | CC BY | iNaturalist |
| Ardilla roja | Wiewiórka w Parku Bednarskiego w Krakowie, 20241117 0903 2741 | Jakub Hałun | CC BY 4.0 | Commons |
| Orangután | Orangutan Kalimantan | Ridwan0810 | CC BY-SA 4.0 | Commons |
| Perezoso de tres dedos | Bradypus variegatus 423905618 | Anthony Batista | CC BY 4.0 | Commons |

Pendientes de la aprobación del usuario (`npm run curate -- approve all`).
