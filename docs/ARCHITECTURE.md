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
┌──────────────────────────── apps/web (navegador) ──────────────────────────────┐
│  React ── Action ──► GameClient ──┬─ modo local: @atacknimal/engine (1 vs IA)   │
│    ▲                              └─ modo online: Socket.IO ──────────────┐     │
│    └── PlayerView + CombatResolution ◄──────────────────────────────────┐ │     │
│  Phaser (CombatStage) ◄── CombatResolution (solo datos)                  │ │     │
└──────────────────────────────────────────────────────────────────────────┼─┼─────┘
                                                                           │ ▼
┌──────────────────────────── apps/server (Node.js) ───────────────────────┼───────┐
│  Socket.IO ─► MatchService: estado ─► engine.applyAction ─► eventos ─────┘       │
│  Fastify (REST)     RoomService (código, enlace, caducidad)     IA (timeouts)    │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        ▼
                         PostgreSQL (Drizzle): eventos + instantáneas
```

**Clave del diseño:** `GameClient` es la única puerta entre React y el juego. En el 1 vs IA ejecuta el motor localmente; en el modo online habla con el servidor. React no sabe cuál de los dos usa. El MVP local y el modo online comparten así todo el código de interfaz.

---

## 3. Paquetes y dependencias

| Paquete | Estado | Rol | Puede depender de |
|---|---|---|---|
| `@atacknimal/engine` | ✅ esqueleto (Fase 2) · ⏳ reglas (Fase 3) | Reglas puras y deterministas | **Nada** (solo TypeScript) |
| `@atacknimal/content` | ⏳ Fase 4 | Animales, perfiles, afinidades, rulesets, imágenes; validado con Zod | engine (tipos) |
| `@atacknimal/sim` | ⏳ Fase 4 | Simulación masiva y reportes de balance (CLI) | engine, content |
| `@atacknimal/protocol` | ⏳ Fase 8 | Contratos de eventos WebSocket y DTO REST (Zod) | engine (tipos) |
| `apps/web` | ⏳ Fase 5–6 | React + Vite + Phaser | engine, content, protocol |
| `apps/server` | ⏳ Fase 8 | Fastify + Socket.IO + Drizzle | engine, content, protocol |

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

### 4.1 Contrato (se implementa en la Fase 3)

| Función | Descripción |
|---|---|
| `createMatch(config, seed) → MatchState` | Estado inicial a partir de modo, equipos, ruleset y semilla |
| `getLegalActions(state, playerId) → Action[]` | Acciones válidas ahora para ese jugador (lo usan la IA y la interfaz) |
| `applyAction(state, action) → Result<{ state, events }, RuleError>` | Función **pura**: valida, aplica y devuelve un estado nuevo y los eventos de dominio. Nunca muta |
| `getPlayerView(state, playerId) → PlayerView` | Vista **redactada**: elimina la carta atacante para el defensor, el equipo rival durante `SETUP`, la semilla, etc. ([GAME_RULES.md](GAME_RULES.md) §11) |
| `decideAI(view, difficulty, rng) → Action` | La IA recibe una `PlayerView`, **no** el `MatchState`: es imposible que haga trampa por construcción |

### 4.2 Eventos de dominio

`MatchCreated`, `TeamConfirmed`, `AttackDeclared`, `DefenseChosen`, `CombatResolved` (con el `CombatResolution` completo, [GAME_RULES.md](GAME_RULES.md) §13), `CardEliminated`, `MatchFinished`.

- Son la **fuente de verdad** persistida (registro de eventos).
- Reproducir los eventos con la misma semilla reconstruye la partida exacta: sirve para la reconexión, las repeticiones, la depuración y como anti-trampas.
- Phaser anima `CombatResolved`; React actualiza el HUD y el registro del combate; la simulación los agrega en estadísticas.

### 4.3 Determinismo

- RNG con semilla implementado dentro del motor (sin dependencias), con su estado guardado en el `MatchState`.
- Mismo estado + misma acción = mismo resultado, en navegador y servidor. Habrá un test que lo verifique.

### 4.4 Errores

Las reglas no lanzan excepciones para acciones ilegales: devuelven un `RuleError` tipado (`NOT_YOUR_TURN`, `CARD_ELIMINATED`, `ATTRIBUTE_LOCKED`, `WRONG_PHASE`…). Las excepciones quedan para errores de programación (estado imposible).

---

## 5. Datos y versiones

- **Contenido** (animales, perfiles, afinidades, imágenes) y **rulesets** viven en `packages/content` como datos validados con Zod, no en el código.
- Cada partida guarda `rulesetVersion` y `contentVersion`. Una versión publicada nunca se edita (ver [BALANCE.md](BALANCE.md) §9).
- **Datos reales (`facts`)** y **perfil de juego** son estructuras separadas. El motor solo recibe el perfil de juego.
- Modelo de datos conceptual: [00-ANALISIS-FASE-0.md](00-ANALISIS-FASE-0.md) §G.5. El esquema físico se documentará en `DATABASE.md` (Fase 8).

---

## 6. React y Phaser (Fases 5–6)

- Un único componente `CombatStage` crea y destruye la instancia de `Phaser.Game`. Ningún otro componente toca Phaser.
- Comunicación por un **bus de eventos tipado** en un solo sentido para los datos: React → Phaser envía `CombatResolution`; Phaser → React solo devuelve señales de presentación (`animationComplete`).
- Phaser importa únicamente **tipos** del motor.
- Escalado responsive del canvas y opción de **reducir movimiento** (accesibilidad).
- Estado de interfaz con Zustand; el estado de partida es siempre la última `PlayerView` recibida.

---

## 7. Servidor (Fase 8)

- Autoridad: el cliente envía acciones; el servidor las pasa por `applyAction`, persiste los eventos y emite a cada jugador **su** `PlayerView`. Nunca emite el estado completo.
- Idempotencia: cada acción lleva un id; los duplicados se ignoran ([GAME_RULES.md](GAME_RULES.md) §16).
- Temporizadores y desconexiones se gestionan en el servidor, alrededor del motor.
- Salas: código corto sin caracteres ambiguos (sin 0/O/1/I), enlace `/sala/:codigo` y QR generado en el cliente a partir del enlace.
- `PUBLIC_APP_URL` configurable para que el QR funcione desde el móvil en desarrollo (IP de la red local).

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
| Zod | ⏳ | Fase 4 |
| React, Vite, React Router, Zustand | ⏳ | Fase 5 |
| Phaser | ⏳ (evaluar Phaser 4) | Fase 6 |
| Fastify, Socket.IO, Drizzle, PostgreSQL | ⏳ | Fase 8 |

Las dependencias se instalan con versión exacta (`--save-exact`) y el `package-lock.json` se versiona.

---

## 10. 🔒 Seguridad pendiente

No bloquea el desarrollo actual. Se abordará en la Fase 13:

- Autenticación real (hoy: invitado con apodo) y autorización por sala.
- *Rate limiting* en REST y WebSocket; protección de los *handshakes* de Socket.IO.
- Códigos de sala no enumerables y *tokens* de invitación firmados con caducidad.
- Sanitización de apodos y de cualquier texto de usuario.
- Gestión de secretos fuera del repositorio; rol de PostgreSQL con mínimos privilegios.
- CORS y CSP estrictos.
- Anti-trampas: ya previsto por diseño (servidor autoritativo, vistas redactadas, acciones idempotentes). Falta auditoría y detección de patrones anómalos.
