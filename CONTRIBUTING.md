# Cómo contribuir a ATACKNIMAL

## Requisitos

- Node.js 24 o superior (ver `.nvmrc`).
- npm 11.

## Puesta en marcha

```bash
npm install
```

```bash
npm run check
```

`npm run check` ejecuta, en orden, el formato, el lint, la comprobación de tipos y los tests. Es lo mismo que ejecuta la CI en cada push y en cada pull request.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Aplicación web en modo desarrollo (http://localhost:5173) |
| `npm run dev:server` | Servidor de juego online (puerto 3001, PGlite en memoria) |
| `npm run build` | Build de producción de la aplicación web (también lo ejecuta la CI) |
| `npm run check` | Todo lo siguiente, en orden |
| `npm run format:check` / `npm run format` | Comprueba o aplica Prettier |
| `npm run lint` | ESLint, incluidas las reglas de arquitectura del motor |
| `npm run typecheck` | `tsc` en cada paquete |
| `npm test` / `npm run test:watch` | Vitest |

## Reglas del proyecto

1. **Las reglas del juego viven en el motor** (`packages/engine`) y en ningún otro sitio. React y Phaser nunca calculan un duelo. ESLint impide al motor importar interfaz, red, base de datos, APIs de Node, `Math.random` o el reloj.
2. **Ningún número de balance en el código.** Estadísticas, modificadores y parámetros van en el contenido o el ruleset versionado.
3. **[GAME_RULES.md](docs/GAME_RULES.md) es la especificación.** Un cambio de regla actualiza primero el documento y después el código y sus tests.
4. **Decisiones importantes**: se proponen con alternativas y recomendación, y se registran en [DECISIONES.md](docs/DECISIONES.md) antes de implementarlas.
5. **Cambios de balance**: solo con simulación antes y después ([BALANCE.md](docs/BALANCE.md) §9).
6. **Código en inglés; documentación e interfaz en español.** El glosario está en [ARCHITECTURE.md](docs/ARCHITECTURE.md) §8.1.
7. **Tests junto al código** (`*.test.ts`). Toda regla nueva del motor llega con su test.
8. **Dependencias con versión exacta**: `npm install --save-exact <paquete>`.

## Commits

- En español, en modo imperativo y explicando el porqué: «Añadir bloqueo de atributos al motor», no «cambios».
- Un commit por cambio coherente. `npm run check` debe pasar antes de hacer commit.

## Estructura

```text
docs/          documentación (análisis, reglas, balance, arquitectura, API, base de datos, decisiones, hoja de ruta)
docs/diseno/   material de diseño original (no se edita)
packages/      paquetes compartidos (engine, content, sim, protocol)
tools/         herramientas de desarrollo (curator)
apps/          aplicaciones (web, server)
```

Las carpetas nuevas se crean cuando empieza la fase que las necesita, no antes ([ROADMAP.md](docs/ROADMAP.md)).
