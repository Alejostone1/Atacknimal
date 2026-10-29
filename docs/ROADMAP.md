# ATACKNIMAL · Hoja de ruta

Leyenda: ✅ hecha · 🚧 en curso · ⏳ pendiente · 🎯 hito.
Cada fase sigue el ciclo: explicar → arquitectura → archivos → implementar → ejecutar → corregir → mostrar → siguiente paso.

| Fase | Estado | Objetivo | Entregables | Verificación |
|---|---|---|---|---|
| **0 · Análisis** | ✅ | Entender el material | [00-ANALISIS-FASE-0.md](00-ANALISIS-FASE-0.md) | Decisiones aceptadas |
| **1 · Game design** | ✅ | Cerrar las reglas | [GAME_RULES.md](GAME_RULES.md), [BALANCE.md](BALANCE.md), [DECISIONES.md](DECISIONES.md) | Ningún caso límite sin respuesta |
| **2 · Arquitectura** | ✅ | Esqueleto mínimo | Monorepo, TS estricto, ESLint con reglas de arquitectura, Prettier, Vitest, CI, [ARCHITECTURE.md](ARCHITECTURE.md), [CONTRIBUTING.md](../CONTRIBUTING.md) | `npm run check` en verde, local y en CI |
| **3 · Motor** | ✅ | Reglas jugables por código | `engine`: estado, acciones, validación, valor efectivo, daño, contraataque, bloqueos, defensa forzada, eliminación, victoria, límite de duelos, vistas redactadas, RNG con semilla | Tests de cada regla y de los 5 ejemplos de GAME_RULES §18; test de información oculta; partida completa en un test |
| **4a · Contenido + simulación** | ✅ balance 0.2.0 | Contenido real y medido | `content` (11 perfiles, afinidades, ruleset v0.1, Zod), `sim` (bots `random` y `greedy`, informes) | Test de presupuesto de perfiles; informe de 108 900 partidas |
| **4b · Imágenes y datos reales** | ✅ 11 fotos aprobadas · ⏳ masa/longitud/velocidad manuales | Fotos con licencia y ficha zoológica | Curador de imágenes, `ASSETS.md`, `facts` con fuentes | 11 fotos con licencia verificada |
| **5 · Frontend** | ✅ | Navegación | `apps/web`: Inicio, Selección de equipo, Colección, Créditos, Ajustes; móvil primero | Recorrido manual en 375 px y escritorio |
| **6 · Combate (Phaser)** | ✅ | Escena de duelo | `CombatStage`: revelación, VS, desglose, daño, eliminación; reducir movimiento | La escena consume `CombatResolution` sin lógica propia |
| **7 · IA** 🎯 **MVP** | ✅ **MVP alcanzado** | **1 vs IA jugable** | IA Fácil, Normal y Difícil (ataque y defensa) | Partida completa en el móvil de principio a fin |
| **8 · Servidor + 1v1** | ✅ | Online | `apps/server`, `protocol`, PostgreSQL (PGlite en desarrollo), salas por código y enlace, autoridad del servidor, temporizadores, reconexión, [API.md](API.md), [DATABASE.md](DATABASE.md) | Dos pestañas juegan por red; tests de integración con dos clientes (redacción, duplicados, reconexión, tiempo agotado, abandono, reproducción desde la base de datos) |
| **8b · Despliegue anticipado** | ✅ [atacknimal.vercel.app](https://atacknimal.vercel.app) + Render + Neon | Compartir el enlace fuera de casa | `vercel.json`, `render.yaml`, URL del servidor configurable, CORS por lista, [DEPLOY.md](DEPLOY.md) (#035) | Una partida entre dos dispositivos en redes distintas |
| **9 · 2v2** | ✅ | Equipos | Salas de 4 asientos con cambio de equipo, 2 animales por jugador, tiras de compañero y rivales, marcadores rápidos (el orden de turnos y el relevo ya estaban en el motor) | Cuatro clientes completan una partida (test de integración) y partida verificada en el navegador con tres bots |
| **10 · Enlace y QR** | ⏳ | Compartir | Enlace `/sala/:codigo`, QR, flujo móvil, caducidad | Un teléfono real escanea y entra a la sala |
| **11 · QA** | ⏳ | Robustez | Playwright e2e, red, casos límite | CI en verde |
| **12 · Balance** | ⏳ | Ajuste fino | Habilidades una a una, informes por animal, atributo y hábitat | Umbrales de BALANCE §7.2 |
| **13 · Seguridad** | ⏳ | 🔒 | Lista de ARCHITECTURE §10 | Revisión de seguridad |
| **14 · Deploy** | ⏳ | Producción | Contenedores, entornos, observabilidad, backups | Entorno de staging |

## 🧪 Expansiones futuras (fuera de la hoja de ruta actual)

- **Animales:** León (#002), un animal arborícola real (primate o felino arborícola) y una segunda ave, para cubrir los hábitats Árboles y Aire.
- **Sistemas:** habilidades del resto de animales, energía (segunda barra de los mockups), rareza como complejidad (#011).
- **Producto:** tutorial guiado, repeticiones de partidas, emparejamiento público, perfiles y estadísticas personales.
- **Fuera de alcance hasta nueva decisión:** economía, tienda, monedas, gemas, sobres, misiones con recompensas, *marketplace*.
