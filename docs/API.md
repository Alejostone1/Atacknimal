# ATACKNIMAL · API del servidor

Contrato entre el cliente web y `apps/server` (Fase 8). Los tipos y esquemas viven en [`packages/protocol`](../packages/protocol/src/index.ts): el servidor valida con ellos **todo** lo que recibe y el cliente los usa para lo que envía.

> **Principio:** el cliente envía intenciones; el servidor las valida (forma con Zod, reglas con el motor) y responde con lo que cada jugador puede ver. El servidor nunca envía el estado completo de una partida.

---

## 1. Transporte

| Canal | Ruta | Uso |
|---|---|---|
| HTTP (Fastify) | `/health`, `/api/rooms/:code` | Comprobaciones y consulta de una sala antes de entrar |
| WebSocket (Socket.IO 4) | `/socket.io` | Salas y partida en tiempo real |

En desarrollo, Vite reenvía `/api` y `/socket.io` a `http://localhost:3001` ([`apps/web/vite.config.ts`](../apps/web/vite.config.ts)), así que el cliente usa siempre su mismo origen.

Variables de entorno del servidor: [`apps/server/.env.example`](../apps/server/.env.example).

---

## 2. HTTP

### `GET /health`

```json
{ "status": "ok", "rooms": 3, "storage": "postgres" }
```

### `GET /api/rooms/:code`

Resumen público de una sala. El código no distingue mayúsculas. La web lo consulta al abrir un enlace o un QR, antes de entrar. Responde con `Access-Control-Allow-Origin` solo a los orígenes de `CORS_ORIGIN`.

| Respuesta | Cuerpo |
|---|---|
| `200` | `{ "code": "7F3K2J", "mode": "2v2", "status": "waiting", "players": 3, "capacity": 4, "joinable": true }` |
| `400` | `{ "error": "INVALID_MESSAGE" }` (código mal formado) |
| `404` | `{ "error": "ROOM_NOT_FOUND" }` |

---

## 3. Sesión de invitado

1. El cliente conecta con `auth: { token }` si ya tiene uno (si no, sin token).
2. El servidor responde con el evento `session`: `{ token, roomCode }`.
   - Si el token es nuevo o desconocido, el servidor crea uno y `roomCode` es `null`.
   - Si el token sigue en una sala, `roomCode` es su código y el servidor vuelve a meter al jugador en ella (ver §6).
3. El cliente guarda el token y lo presenta en cada reconexión.

El cliente web guarda el token en `sessionStorage`: cada pestaña es un jugador distinto y la sesión sobrevive a recargar la página.

🔒 Los tokens viven en memoria y no están firmados ni caducan (ARCHITECTURE §10).

---

## 4. Mensajes WebSocket

Las peticiones del cliente usan *acknowledgement* de Socket.IO: el último argumento es una función que recibe la respuesta.

```ts
type Ack<T> = ({ ok: true } & T) | { ok: false; error: { code: ProtocolErrorCode; message: string } };
```

### 4.1 Cliente → servidor

| Evento | Petición | Respuesta (`Ack`) | Notas |
|---|---|---|---|
| `room:create` | `{ nickname, mode? }` | `{ code }` | Crea una sala `1v1` (por defecto) o `2v2` y te sienta como `A1` |
| `room:join` | `{ code, nickname }` | `{ code }` | Te sienta como `B1`. Si ya estabas en esa sala, te reconecta |
| `room:leave` | — | `{}` | Antes de empezar cierra la sala; durante la partida cuenta como **abandono** (en 2 vs 2 pierde todo tu equipo) |
| `room:switch-team` | — | `{}` | 2 vs 2, mientras se espera: te pasa al primer asiento libre del otro equipo |
| `team:signal` | `TeamSignal` | `{}` | 2 vs 2: marcador rápido para tu compañero (§4.4) |
| `team:select` | `{ animalIds: string[] }` | `{}` | Equipo secreto. El motor valida tamaño, repetidos y animales existentes |
| `match:act` | `{ actionId, action }` | `{ duplicate: boolean }` | `action`: `declare`, `defend` o `concede` (sin `playerId`) |

Formas exactas:

- `nickname`: 1–20 caracteres; letras, números, espacio, punto, guion y guion bajo.
- `code`: 6 caracteres del alfabeto `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (sin 0/O ni 1/I/L).
- `actionId`: 8–64 caracteres, único por acción (el cliente usa `crypto.randomUUID()`).
- `action`:
  - `{ type: 'declare', habitat, cardId, attribute }`
  - `{ type: 'defend', cardId }`
  - `{ type: 'concede' }`

Los objetos son **estrictos**: cualquier campo extra (por ejemplo, un `playerId`) se rechaza con `INVALID_MESSAGE`. El jugador que actúa siempre sale de la sesión, nunca del mensaje.

### 4.2 Servidor → cliente

| Evento | Carga | Cuándo |
|---|---|---|
| `session` | `{ token, roomCode }` | Al conectar |
| `room:state` | `RoomState` | Cuando cambia la sala: llega un jugador, alguien confirma equipo, se conecta o desconecta, cambia el estado |
| `match:update` | `MatchUpdate` | Al empezar la partida, tras cada acción aceptada y al reconectar |

```ts
interface RoomState {
  code: string;
  mode: '1v1';
  status: 'waiting' | 'team-select' | 'playing' | 'finished' | 'closed';
  phaseEndsInMs: number | null; // lo que queda para llenar la sala o confirmar equipos
  closeReason: 'abandoned' | 'expired' | 'team-select-timeout' | null;
  you: string | null; // tu playerId: 'A1' o 'B1'
  players: { playerId; team; nickname; connected; teamConfirmed; isYou }[];
}

interface MatchUpdate {
  view: PlayerView;            // tu vista redactada (getPlayerView del motor)
  events: PlayerEvent[];       // eventos nuevos, redactados para ti (redactEvent)
  turnEndsInMs: number | null; // tiempo que le queda al turno al enviar el mensaje
  history: CombatResolution[] | null; // todos los duelos, solo en sincronizaciones completas
}
```

- **`turnEndsInMs`** es relativo para que el reloj del cliente no tenga que estar en hora: el cliente calcula su plazo local al recibirlo.
- **`history`** llega al empezar y al reconectar: el cliente rehace con él el registro de combate sin volver a animar duelos pasados. En las actualizaciones normales es `null`.

### 4.3 Asientos en 2 vs 2

Por orden de llegada: `A1`, `B1`, `A2`, `B2` (los equipos se alternan). Mientras la sala espera, cualquiera puede pasarse a un asiento libre del otro equipo con `room:switch-team`. Los asientos quedan fijos al empezar la elección de equipos. Cada jugador elige `teamSize / 2` animales (2), y el motor rechaza repetir un animal del compañero.

### 4.4 Marcadores rápidos (2 vs 2)

La única comunicación entre compañeros (GAME_RULES §9.2). El servidor los entrega **solo al equipo de quien los envía** (también a él, como confirmación) con el evento `team:signal`: `{ from, signal }`.

| `signal` | Texto |
|---|---|
| `{ type: 'wellPlayed' }` | ¡Bien jugado! |
| `{ type: 'careful' }` | ¡Cuidado! |
| `{ type: 'saveCard', cardId }` | Guarda tu {carta} |
| `{ type: 'useCard', cardId }` | Usa tu {carta} |
| `{ type: 'useHabitat', habitat }` | Ataca en {hábitat} |

`cardId` debe ser una carta del propio equipo; un mismo jugador puede enviar como mucho uno por segundo.

### 4.5 Errores

| Código | Significado |
|---|---|
| `INVALID_MESSAGE` | La petición no cumple el esquema (el mensaje explica el primer problema) |
| `ROOM_NOT_FOUND` | No existe una sala con ese código |
| `ROOM_FULL` | La sala ya tiene dos jugadores |
| `ROOM_CLOSED` | La sala terminó o se cerró |
| `NOT_IN_ROOM` | La sesión no está en ninguna sala |
| `ALREADY_IN_ROOM` | La sesión ya está en otra sala |
| `MATCH_NOT_STARTED` | La acción no corresponde al estado de la sala |
| `RULE_VIOLATION` | El motor rechazó la acción (el mensaje es el del motor) |
| `RATE_LIMITED` | Demasiados marcadores seguidos (como mínimo 1 s entre uno y otro) |
| `INTERNAL_ERROR` | Fallo inesperado del servidor (queda registrado) |

---

## 5. Ciclo de una sala

```text
room:create ──► waiting ──(sala llena: 2 o 4)──► team-select ──(todos confirman)──► playing ──► finished
                   │                                    │
                   └──── alguien sale o no vuelve ──────┴──► closed (sin resultado)
```

1. **waiting:** el creador comparte el código o el enlace `/sala/:code`.
2. **team-select:** el servidor crea la partida en el motor (semilla aleatoria del servidor) y cada jugador envía su equipo con `team:select`. Ninguno ve el del otro.
3. **playing:** quien tiene el turno envía `match:act`. Tras cada acción aceptada, cada jugador recibe su `match:update`.
4. **finished:** el resultado lo decide el motor (eliminación, límite de duelos o abandono). La sala se conserva 10 minutos para ver el resultado o reconectar.
5. **closed:** la sala se cerró antes de jugar. `closeReason` dice por qué: alguien salió (`abandoned`), no se llenó en 30 minutos (`expired`) o alguien no confirmó su equipo en 3 minutos (`team-select-timeout`).

---

## 6. Tiempos, desconexiones e idempotencia

Las reglas están en [GAME_RULES.md](GAME_RULES.md) §16; así las aplica el servidor:

| Situación | Comportamiento |
|---|---|
| Turno de declarar | 30 s (`DECLARE_SECONDS`). Al agotarse, la **IA Fácil** decide con la vista de ese jugador y su acción pasa por el motor |
| Turno de defender | 20 s (`DEFEND_SECONDS`), igual que arriba |
| Desconexión | 60 s de gracia (`RECONNECT_GRACE_SECONDS`). Los turnos siguen corriendo. Si no vuelve: abandono durante la partida, o sala cerrada antes de empezar |
| Reconexión | Mismo token → mismo asiento. Recibe `session` con su sala, `room:state` y un `match:update` con `history` |
| Sala sin llenar | Caduca a los 30 min (`ROOM_WAIT_MINUTES`) |
| Elegir equipo | 180 s para que todos confirmen (`TEAM_SELECT_SECONDS`); si no, la sala se cierra |
| Acción repetida | Mismo `actionId` → `{ ok: true, duplicate: true }` y la partida no cambia |

---

## 7. Pruebas

[`apps/server/src/server.test.ts`](../apps/server/src/server.test.ts) levanta el servidor con PGlite en memoria y conecta dos clientes Socket.IO reales:

- Partida completa y **reproducción exacta** desde la base de datos (semilla + acciones).
- **Ningún mensaje** a un jugador contiene información oculta del rival (cartas sin revelar, carta atacante, equipo).
- Duplicados, suplantación de `playerId` y acciones fuera de turno.
- Reconexión con el mismo token, con historial de duelos.
- Tiempo agotado (juega la IA Fácil), abandono por desconexión y cierre de sala antes de empezar.
- 2 vs 2 con cuatro clientes: asientos y cambio de equipo, partida completa reproducible, carta atacante visible solo para el compañero, animales repetidos entre compañeros, marcadores que nunca llegan al rival y abandono que hace perder al equipo.
