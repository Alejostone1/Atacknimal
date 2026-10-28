# ATACKNIMAL

*El instinto decide.*

## Estado del proyecto

| Fase | Estado | Documento |
|---|---|---|
| 0 · Análisis | ✅ Cerrada | [`docs/00-ANALISIS-FASE-0.md`](docs/00-ANALISIS-FASE-0.md) |
| 1 · Game design | ✅ Cerrada | [`docs/GAME_RULES.md`](docs/GAME_RULES.md) · [`docs/BALANCE.md`](docs/BALANCE.md) · [`docs/DECISIONES.md`](docs/DECISIONES.md) |
| 2 · Arquitectura | ✅ Cerrada | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| 3 · Motor de reglas | ✅ Cerrada | [`packages/engine`](packages/engine/src) |
| 4a · Contenido y simulación | ✅ Cerrada | [`packages/content`](packages/content) · [`packages/sim`](packages/sim) · [informe del balance 0.2.0](packages/sim/reports/0.2.0/greedy/summary.md) |
| 4b · Imágenes y datos reales | ✅ Cerrada | [`docs/ASSETS.md`](docs/ASSETS.md) · [`tools/curator`](tools/curator) |
| 5 · Frontend (React) | ✅ Cerrada | [`apps/web`](apps/web/src) |
| 6 · Combate (Phaser) | ✅ Cerrada | [`apps/web/src/match`](apps/web/src/match) · [`apps/web/src/phaser`](apps/web/src/phaser) |
| 7 · IA · 🎯 **MVP** | ✅ Cerrada | [`packages/engine/src/ai`](packages/engine/src/ai) · se juega contra la IA en Fácil, Normal o Difícil |
| 8 · Servidor y 1 vs 1 online | ✅ Cerrada | [`apps/server`](apps/server/src) · [`packages/protocol`](packages/protocol/src) · [`docs/API.md`](docs/API.md) · [`docs/DATABASE.md`](docs/DATABASE.md) |
| 8b · Despliegue (Vercel + Render) | 🚧 Código listo, faltan las cuentas | [`docs/DEPLOY.md`](docs/DEPLOY.md) |
| 9 · 2 vs 2 | ⏳ Siguiente | — |

Hoja de ruta completa: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Desarrollo

Requiere Node.js 24 o superior.

```bash
npm install
npm run dev
```

La aplicación se abre en http://localhost:5173. Para jugar online, arranca también el servidor de juego en otra terminal:

```bash
npm run dev:server
```

El servidor escucha en el puerto 3001 y usa PGlite (PostgreSQL embebido) en memoria; no hace falta instalar PostgreSQL. Para probar una partida online en un mismo navegador, abre dos pestañas: cada una es un jugador. Configuración en [`apps/server/.env.example`](apps/server/.env.example).

Para comprobar todo el proyecto:

```bash
npm run check
```

Más detalles en [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Documentación de diseño

Todo el material de referencia está en [`docs/diseno/`](docs/diseno/):

- `ATACKNIMAL_Documento_Maestro_Completo_v1.pdf`: documento maestro del juego
- `Infografía GDD de ATACKNIMAL.png`: resumen del GDD
- `Infografía de cartas de animales salvajes.png`: cartas de animales
- `Paneles de juego ATACKNIMAL_ Jungla estratégica.png`: paneles de juego
- `Storyboard de interfaz de ATACKNIMAL.png`: storyboard de la interfaz
- `Duelo de Guepardo contra Elefante.png`: ejemplo de duelo
- `Atacknimal_ El instinto decide.png`: arte principal
