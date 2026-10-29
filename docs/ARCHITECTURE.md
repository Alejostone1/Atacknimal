# ATACKNIMAL · Arquitectura

> Estado: Fase 2. Describe la arquitectura **objetivo** y marca qué existe ya (✅) y qué llega en cada fase (⏳).
> Reglas del juego: [GAME_RULES.md](GAME_RULES.md) · Balance: [BALANCE.md](BALANCE.md) · Decisiones: [DECISIONES.md](DECISIONES.md).

---

## 1. Principio

> **React gestiona · Phaser representa · El motor decide · El servidor valida.**

| Capa | Hace | Nunca hace |
|---|---|---|
| **React** (`apps/web`) | Pantallas, navegación, formularios, HUD, estado de interfaz; envía *acciones* | Calcular un duelo, validar una regla, decidir un ganador |
| **Phaser** (`apps/web/src/phaser`) | Escenario, sprites, animaciones y efectos a partir de un `CombatResolution` ya calculado | Leer reglas, calcular valores, cambiar un resultado |
| **Motor** (`packages/engine`) | Estado, acciones, validación, cálculo, daño, bloqueos, victoria, vistas por jugador, IA | Importar React, Phaser, red, base de datos, APIs de Node, reloj o `Math.random` |
| **Servidor** (`apps/server`) | Salas, sincronización, persistencia; ejecuta el **mismo motor** como autoridad | Tener reglas propias distintas de las del motor |
| **PostgreSQL** | Persistencia de usuarios, salas, partidas y eventos | Lógica de juego |

---

## 2. Vista general

```text
apps/web (navegador)
  React ── ClientAction ──► useMatch (game/matchStore.ts)
    ▲                          ├─ local:  engine + IA en el navegador
    │                          └─ online: game/online.ts ── match:act ──────┐
    └── PlayerView + duelos ◄───────────── match:update (vista redactada) ──┤
  Phaser (CombatStage) ◄── DuelPresentation (solo datos)                    │
                                                                            │
apps/server (Node.js)                                                       │
  Socket.IO + Fastify (server.ts) ◄────────────────────────────────────────┘
    └─► Room (room.ts): estado completo ─► engine.applyAction
          temporizadores · IA Fácil por tiempo · reconexión · abandono
          │ escrituras encoladas (nunca bloquean la partida)
          ▼
  PostgreSQL / PGlite (Drizzle): salas, jugadores, semilla + acciones
```

**Clave del diseño:** `useMatch` es la única puerta entre React y el juego. En el 1 vs IA ejecuta el motor en el navegador; online recibe la vista del servidor y le envía las acciones. Los paneles de ataque y defensa, la escena de Phaser y el resumen final no saben cuál de los dos se usa: trabajan con `view.viewerId` y la `PlayerView`.

---

## 3. Paquetes y dependencias

| Paquete | Estado | Rol | Puede depender de |
|---|---|---|---|
| `@atacknimal/engine` | ✅ reglas completas sin IA (Fase 3) | Reglas puras y deterministas | **Nada** (solo TypeScript) |
| `@atacknimal/content` | ✅ Fase 4a · ⏳ imágenes y datos reales (4b) | Animales, perfiles, afinidades y versiones de balance en JSON, validados con Zod | engine (tipos) |
| `@atacknimal/sim` | ✅ Fase 4a | Simulación masiva e informes de balance (`npm run simulate`) | engine, content |
| `@atacknimal/protocol` | ✅ Fase 8 | Contratos de eventos WebSocket y respuestas REST, esquemas Zod ([API.md](API.md)) | engine |
| `tools/curator` | ✅ Fase 4b | Herramienta de desarrollo: fotos con licencia abierta y datos de Wikidata ([ASSETS.md](ASSETS.md)) | content |
| `apps/web` | ✅ Fase 5 (interfaz) · ✅ Fase 6 (combate) · ✅ Fase 8 (online) | React + Vite; Phaser solo en `src/phaser/`; Socket.IO cliente en `src/game/online.ts` | engine, content, protocol |
| `apps/server` | ✅ Fase 8 | Fastify + Socket.IO + Drizzle (PostgreSQL o PGlite) ([DATABASE.md](DATABASE.md)) | engine, content, protocol |

```text
engine ◄── content ◄── sim
   ▲          ▲
   ├── protocol
   │          │
   └── web, server (dependen de engine, content y protocol)
```

### 3.1 Reglas aplicadas automáticamente (ESLint, ✅ activas)

En `packages/engine/src/**`:

| Prohibido | Motivo |
|---|---|
| `react`, `phaser` | El motor no conoce la interfaz |
| `socket.io*`, `fastify*`, `drizzle-orm*`, `pg` | El motor no conoce la red ni la base de datos |
| `node:*` | Debe ejecutarse igual en navegador y servidor |
| Otros `@atacknimal/*` | El motor es la base del grafo |
| `Math.random` | Determinismo: se usa el RNG con semilla de la partida |
| `Date.now`, `new Date()` | Determinismo: el tiempo llega dentro de las acciones |

Además, el `tsconfig` del motor no incluye tipos de DOM ni de Node (`"types": []`), así que ni siquiera compila si se usa `window` o `process`.

Al crear `apps/web` se añadirá la regla equivalente: **Phaser no puede importar el motor salvo sus tipos** (`import type`).

---

## 4. Motor de reglas

### 4.1 Contrato

| Función | Estado | Descripción |
|---|---|---|
| `createMatch(config) → MatchState` | ✅ | Estado inicial a partir de modo, jugadores, roster, ruleset y semilla. Lanza `MatchConfigError` si la configuración es imposible |
| `applyAction(state, action) → Result<Transition>` | ✅ | Función **pura**: valida, aplica y devuelve un estado nuevo y los eventos de dominio, o un `RuleError`. Nunca muta |
| `getLegalActions(state, playerId) → Action[]` | ✅ | Ataques o defensas válidos ahora para ese jugador (no enumera equipos ni la rendición) |
| `getDefenseOptions(state, playerId, attribute)` | ✅ | Cartas legales para defender y si la defensa es forzada |
| `getPlayerView(state, playerId) → PlayerView` | ✅ | Vista **redactada**: oculta la carta atacante al equipo defensor, el equipo rival durante la preparación y el estado del RNG ([GAME_RULES.md](GAME_RULES.md) §11) |
| `redactEvent(event, state, playerId) → PlayerEvent` | ✅ | Versión de un evento que puede enviarse a ese jugador |
| `decideAI(view, difficulty, rng) → [Action, rng]` | ✅ Fase 7 | La IA recibe una `PlayerView`, **no** el `MatchState`: es imposible que haga trampa por construcción |

**Acciones:** `selectTeam`, `declare` (hábitat + carta + atributo), `defend`, `concede`.

### 4.2 Eventos de dominio

`teamConfirmed`, `matchStarted` (sorteo, orden de turnos y equipos ya públicos), `turnStarted`, `attackDeclared`, `combatResolved` (con el `CombatResolution` completo, [GAME_RULES.md](GAME_RULES.md) §13), `conceded`, `matchFinished`.

- Son la **fuente de verdad** persistida (registro de eventos).
- Reproducir los eventos con la misma semilla reconstruye la partida exacta: sirve para la reconexión, las repeticiones, la depuración y como anti-trampas.
- Phaser anima `CombatResolved`; React actualiza el HUD y el registro del combate; la simulación los agrega en estadísticas.

### 4.3 Determinismo

- RNG con semilla (mulberry32) implementado dentro del motor, sin dependencias, con su estado guardado en el `MatchState`.
- Mismo estado + misma acción = mismo resultado, en navegador y servidor. Lo verifica `playout.test.ts`.

### 4.4 Organización del código (`packages/engine/src`)

| Archivo | Responsabilidad |
|---|---|
| `domain.ts` | Atributos, hábitats y afinidades |
| `ruleset.ts`, `roster.ts` | Tipos de parámetros y perfiles de animal |
| `state.ts`, `actions.ts`, `events.ts`, `errors.ts` | Tipos de estado, acciones, eventos y errores |
| `match.ts` | Creación y validación de la partida |
| `setup.ts` | Confirmación de equipos y sorteo inicial |
| `duel.ts` | Declaración, defensa y resolución del duelo |
| `combat.ts` | Valor efectivo, comparación y daño |
| `locks.ts` | Bloqueos de atributo |
| `turns.ts` | Orden de turnos, saltos y relevo |
| `outcome.ts` | Victoria, límite de duelos y desempates |
| `legal.ts` | Acciones legales y opciones de defensa |
| `view.ts` | Vistas y eventos redactados por jugador |
| `apply.ts` | Punto de entrada `applyAction` y rendición |
| `rng.ts` | Aleatoriedad determinista |
| `queries.ts` | Consultas internas sobre el estado |
| `testing/` | Datos y utilidades **solo para tests** (copia del ruleset y los perfiles v0.1) |

### 4.5 Errores

Las reglas no lanzan excepciones para acciones ilegales: devuelven un `RuleError` tipado (`NOT_YOUR_TURN`, `CARD_ELIMINATED`, `ATTRIBUTE_LOCKED`, `WRONG_PHASE`…). Las excepciones quedan para errores de programación (estado imposible).

---

## 5. Datos y versiones

- **Contenido** (animales, perfiles, afinidades, imágenes) y **rulesets** viven en `packages/content` como datos validados con Zod, no en el código:
  - `data/animals.json`: identidad de cada animal (nombre, especie, rol). Sin números de balance.
  - `data/balance/<versión>.json`: una **versión de balance** = ruleset + reglas de presupuesto + métricas objetivo + perfiles de su roster (11 animales en 0.1.0 y 0.2.0; 20 en 0.3.0). Todo lo que se equilibra junto se versiona junto, y una versión publicada no cambia aunque se añadan animales.
  - Al importarse, el paquete valida todo con Zod y comprueba que cada animal tenga exactamente un perfil. Los tests verifican el presupuesto de [BALANCE.md](BALANCE.md) §2 en cada versión.
- **Simulación:** `npm run simulate -- --version 0.2.0 --policy greedy|random|blind [--sample N]` escribe `packages/sim/reports/<versión>/<política>/summary.md` y `animals.csv`. Los bots deciden con la `PlayerView`, igual que un humano: con equipos ocultos, `greedy` estima las cartas rivales no reveladas.
- **Experimentos:** `npm run experiment -- <nombre>` simula en paralelo (worker threads) las variantes de `packages/sim/src/experiments/<nombre>.ts`. Una variante cambia parámetros del ruleset, afinidades o perfiles sin publicar una versión. El resultado es una tabla comparativa en `packages/sim/reports/experiments/` que comprueba el presupuesto de cada variante.
- Cada partida guarda `rulesetVersion` y `contentVersion`. Una versión publicada nunca se edita (ver [BALANCE.md](BALANCE.md) §9).
- **Datos reales (`facts`)** y **perfil de juego** son estructuras separadas. El motor solo recibe el perfil de juego.
- Modelo de datos conceptual: [00-ANALISIS-FASE-0.md](00-ANALISIS-FASE-0.md) §G.5. El esquema físico se documentará en `DATABASE.md` (Fase 8).

---

## 6. React y Phaser (Fases 5–6)

### 6.1 Aplicación web (Fase 5, ✅)

| Carpeta (`apps/web/src`) | Contenido |
|---|---|
| `app/App.tsx` | Rutas (React Router) y raíz común: restauración del scroll y preferencia de animaciones |
| `screens/` | Inicio `/`, Jugar `/jugar`, Equipo `/jugar/equipo`, Listo `/jugar/listo`, Colección `/coleccion`, Ficha `/coleccion/:id`, Créditos `/creditos`, Ajustes `/ajustes` |
| `components/` | Carta de animal, foto con crédito, atributos, hábitats y filtro, puestos de equipo, buscador, marca (zarpazo) |
| `content/catalog.ts` | **Único** punto de acceso al contenido: une animales, perfiles de la versión de balance vigente, fotos y datos. Picos y valles salen del presupuesto, no de números escritos a mano |
| `state/` | Zustand con persistencia segura en `localStorage` (si no hay almacenamiento, la app funciona sin recordar): ajustes y preparación de partida |
| `i18n/es.ts` | Vocabulario de interfaz (atributos, hábitats, afinidades, UICN, licencias) |
| `styles/global.css` | Tokens del sistema visual y estilos base; cada componente usa su módulo CSS |

**Sistema visual:** guía de campo con alma de carta de combate. Fondo verde noche, texto hueso, ámbar para acciones y picos, y el **zarpazo** rojo como firma, que solo aparece en la marca y en la selección de equipo. Tipografías Big Shoulders Display (nombres y cifras), Barlow (texto) e IBM Plex Mono (datos), autoalojadas con fontsource y solo con el subconjunto latino.

**Calidad mínima:** primero móvil (375 px), con cuadrícula de 2 → 3 → 4 columnas. Foco visible, áreas táctiles ≥ 44 px y acciones principales fijas abajo (zona del pulgar). Iconos siempre con texto o etiqueta accesible. Las animaciones respetan `prefers-reduced-motion` y el ajuste del jugador.

**Regla de ESLint:** fuera de `src/phaser/` no se puede importar Phaser.

### 6.2 Combate (Fase 6, ✅; rehecho en la Fase 10b, decisión #041)

| Carpeta (`apps/web/src`) | Contenido |
|---|---|
| `game/localMatch.ts` | Crea la partida local (motor en el navegador): jugador `jugador` contra `rival`, con el equipo del rival al azar |
| `game/matchStore.ts` | Estado de la partida. **Guarda el estado del motor fuera del store** y solo expone la `PlayerView` del jugador, el duelo que se está mostrando y el registro. Mientras se muestra un duelo, el rival espera |
| IA del rival | `decideAI` del motor con la dificultad elegida, a partir de la vista del rival (Fase 7). El rival provisional al azar de la Fase 6 se eliminó |
| `game/present.ts` | Traduce cada `CombatResolution` en datos para Phaser y en un **texto equivalente** (accesible y para movimiento reducido) que explica por qué ganó una carta |
| `match/` | Pantalla `/partida`: tiras de equipo (las rivales sin revelar como "?"), ataque en tres pasos (hábitat → animal → atributo, con el valor real de cada opción), defensa (con aviso de defensa forzada), resultado, registro, fin de partida y abandono |
| `phaser/` | `CombatStage.tsx` (único puente React ↔ Phaser), `DuelScene.ts` (animación) y `presentation.ts` (contrato de datos) |

**Flujo de un duelo:** acción del jugador → `applyAction` (motor) → el store guarda la vista nueva y el duelo resuelto → `CombatStage` entrega la presentación a Phaser por el registro del juego → Phaser anima → "Continuar" → el rival actúa si le toca.

**Phaser 4.2.1:** se carga en un archivo aparte (`React.lazy`) que solo se descarga al entrar en `/partida` (≈ 365 KB comprimidos). El audio está desactivado porque todavía no hay sonido. Las fotos se cargan como texturas con CORS anónimo, que Commons e iNaturalist permiten.

**Qué decide cada capa:** las opciones legales y los valores que se muestran antes de confirmar los calcula el motor (`getLegalActions`, `getDefenseOptions`, `computeValue`). React solo los presenta. Phaser no importa nada del motor salvo tipos.

### 6.3 Pendiente para fases siguientes

- Una partida **contra la IA** no sobrevive a recargar la página (el estado vive en memoria). Las partidas online sí: el servidor la reenvía al reconectar.
- Las tiras de equipo se actualizan antes de que termine la animación: se ve la vitalidad nueva mientras Phaser todavía la está bajando.
- Las cartas de combate aún no muestran el icono ⓘ con el crédito de la foto: el crédito está en la ficha y en Créditos.

- Un único componente `CombatStage` crea y destruye la instancia de `Phaser.Game`. Ningún otro componente toca Phaser.
- Comunicación por un **bus de eventos tipado** en un solo sentido para los datos: React → Phaser envía `CombatResolution`; Phaser → React solo devuelve señales de presentación (`animationComplete`).
- Phaser importa únicamente **tipos** del motor.
- Escalado responsive del canvas y opción de **reducir movimiento** (accesibilidad).
- Estado de interfaz con Zustand; el estado de partida es siempre la última `PlayerView` recibida.

---

## 7. Servidor (Fase 8, ✅)

Contrato completo en [API.md](API.md); persistencia en [DATABASE.md](DATABASE.md).

| Archivo (`apps/server/src`) | Responsabilidad |
|---|---|
| `config.ts` | Variables de entorno validadas con Zod ([`.env.example`](../apps/server/.env.example)) |
| `server.ts` | Fastify (HTTP) y Socket.IO; sesiones de invitado; valida cada mensaje con `@atacknimal/protocol` |
| `room.ts` | Una sala 1 vs 1 o 2 vs 2: asientos (y cambio de equipo), partida del motor, temporizadores, reconexión, abandono, marcadores entre compañeros y difusión de vistas |
| `codes.ts` | Códigos de sala aleatorios sin caracteres ambiguos |
| `db/` | Esquema Drizzle, migraciones SQL y repositorio (PostgreSQL con `DATABASE_URL`, si no PGlite) |

- **Autoridad:** el cliente envía intenciones sin `playerId`; el servidor pone el jugador de la sesión y las pasa por `applyAction`. A cada jugador le envía **su** `PlayerView` y sus eventos redactados (`redactEvent`). Nunca el estado completo.
- **Una sola puerta al motor:** `Room.apply` aplica, guarda la acción, programa el turno y difunde. Las acciones por tiempo agotado (IA Fácil) y por abandono pasan por la misma puerta.
- **Idempotencia:** cada acción lleva un id; los duplicados se responden sin aplicarse ([GAME_RULES.md](GAME_RULES.md) §16).
- **Salas en memoria** (un solo proceso). La base de datos guarda la historia, no el estado vivo.
- **Despliegue** ([DEPLOY.md](DEPLOY.md)): web en Vercel y servidor en Render. La web conoce el servidor por `VITE_GAME_SERVER_URL` (se incrusta al compilar) y el servidor acepta solo los orígenes de `CORS_ORIGIN`.
- Pendiente para la Fase 10: QR generado en el cliente desde el enlace `/sala/:codigo` y `PUBLIC_APP_URL` para que funcione desde el móvil en la red local.

---

## 8. Convenciones técnicas

| Tema | Convención |
|---|---|
| Lenguaje | TypeScript `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (ver `tsconfig.base.json`) |
| Módulos | ESM. Los paquetes internos se consumen como **código TypeScript** (`exports` apunta a `src/index.ts`): sin paso de compilación entre paquetes |
| Imports relativos | Con extensión `.ts` (compatible con Vite, Vitest y la ejecución nativa de TypeScript en Node 24) |
| Idioma | **Código en inglés** (identificadores); **documentación, interfaz y mensajes de error de cara al usuario en español** |
| Tests | Vitest, junto al código (`*.test.ts`) |
| Formato | Prettier (excepto Markdown, escrito a mano) |
| Lint | ESLint con `typescript-eslint` `strictTypeChecked` |
| Configuración | Variables de entorno por app, validadas con Zod al arrancar; `.env.example` documenta cada una |
| Sintaxis TypeScript | Solo sintaxis que se puede borrar (`erasableSyntaxOnly`): Node 24 ejecuta el servidor quitando los tipos, así que no hay `enum`, `namespace` ni propiedades en parámetros del constructor |

### 8.1 Glosario código ↔ juego

| Código | Juego |
|---|---|
| `weight`, `strength`, `agility`, `attack`, `endurance`, `speed`, `defense`, `perception` | Peso, Fuerza, Agilidad, Ataque, Resistencia, Velocidad, Defensa, Percepción |
| `air`, `water`, `land`, `trees` | Aire, Agua, Tierra, Árboles |
| `native`, `adapted`, `neutral`, `hostile` | Nativo, Adaptado, Neutral, Hostil |
| `duel` | Duelo (en la interfaz, "Turno") |
| `hp` | Vitalidad |
| `lock` | Bloqueo |
| `forcedDefense` | Defensa forzada |
| `ruleset` | Ruleset |

---

## 9. Herramientas (versiones fijadas)

| Herramienta | Versión | Desde |
|---|---|---|
| Node.js | ≥ 24 (`.nvmrc`) | Fase 2 |
| npm workspaces | npm 11 | Fase 2 |
| TypeScript | 6.0.3 | Fase 2 |
| Vitest | 5.0.5 | Fase 2 |
| ESLint / typescript-eslint | 10.13.0 / 8.72.1 | Fase 2 |
| Prettier | 3.9.10 | Fase 2 |
| Zod | 4.6.7 | Fase 4 |
| @types/node | 26.6.5 (`sim`, `server`) | Fase 4 |
| React / React DOM | 19.3.1 | Fase 5 |
| Vite / @vitejs/plugin-react | 8.3.5 / 6.1.2 | Fase 5 |
| React Router | 8.5.1 | Fase 5 |
| Zustand | 5.0.16 | Fase 5 |
| lucide-react | 1.63.0 | Fase 5 |
| Testing Library (React) / jsdom | 16.3.3 / 30.1.3 | Fase 5 |
| Phaser | 4.2.1 | Fase 6 |
| uqr (códigos QR, sin dependencias) | 0.1.3 | Fase 10 |
| Fastify | 5.12.7 | Fase 8 |
| Socket.IO (servidor y cliente) | 4.8.4 | Fase 8 |
| Drizzle ORM | 0.45.4 | Fase 8 |
| PGlite / pg | 0.5.13 / 8.23.1 | Fase 8 |

Las dependencias se instalan con versión exacta (`--save-exact`) y el `package-lock.json` se versiona.

---

## 10. 🔒 Seguridad pendiente

No bloquea el desarrollo actual. Se abordará en la Fase 13:

- Autenticación real (hoy: invitado con apodo y *token* aleatorio en memoria, sin firma ni caducidad) y autorización por sala.
- *Rate limiting* en REST y WebSocket; protección de los *handshakes* de Socket.IO.
- Códigos de sala no enumerables y *tokens* de invitación firmados con caducidad.
- Sanitización de apodos y de cualquier texto de usuario.
- Gestión de secretos fuera del repositorio; rol de PostgreSQL con mínimos privilegios.
- CORS y CSP estrictos.
- Límite de salas por sesión o por IP. Hoy solo hay un tope de tamaño por mensaje WebSocket (16 KB).
- Anti-trampas: ya previsto por diseño (servidor autoritativo, vistas redactadas, acciones idempotentes). Falta auditoría y detección de patrones anómalos.
