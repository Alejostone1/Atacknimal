# ATACKNIMAL · Base de datos

PostgreSQL con Drizzle ORM (Fase 8). Esquema en [`apps/server/src/db/schema.ts`](../apps/server/src/db/schema.ts) y migraciones en [`apps/server/src/db/migrations.ts`](../apps/server/src/db/migrations.ts).

---

## 1. Motor de base de datos por entorno

| Entorno | Base de datos | Cómo |
|---|---|---|
| Desarrollo | **PGlite** (PostgreSQL compilado a WebAssembly, dentro del proceso) | Por defecto, en memoria. Con `PGLITE_DIR` guarda los datos en disco |
| Tests | PGlite en memoria | Cada test parte de una base vacía |
| Producción | PostgreSQL | `DATABASE_URL=postgres://…` (driver `pg`) |
| Producción sin base de datos | Almacén en memoria (sin SQL) | `DB_DRIVER=memory`. Lo usa Render mientras no haya `DATABASE_URL` |

El mismo código Drizzle y las mismas migraciones sirven para los dos drivers de PostgreSQL. **PGlite ocupa unos 530 MB de RAM** y no cabe en los 512 MB del plan gratuito de Render; por eso existe el almacén en memoria (unos 126 MB el servidor completo), que cumple el mismo contrato (`MatchRepository`) y también permite reproducir partidas mientras el proceso vive. PGlite se carga solo cuando se usa. PGlite evita instalar PostgreSQL o Docker para desarrollar; antes del despliegue (Fase 14) conviene ejecutar la suite también contra un PostgreSQL real.

---

## 2. Qué se guarda y por qué

El motor es **determinista**: con la misma semilla y las mismas acciones produce siempre la misma partida, con los mismos eventos. Por eso la fuente de verdad de una partida es:

> **semilla + acciones aceptadas, en orden.**

Con eso se reconstruye la partida completa (estado, eventos, resultado) para auditarla, investigar una denuncia de trampa o reproducir un error. No se guardan los eventos ni instantáneas del estado: se derivan.

El test de integración comprueba exactamente esto: reproduce desde la base de datos una partida jugada por red y la compara con el estado del servidor.

Las escrituras **no bloquean el juego**: cada sala encola sus escrituras en orden y la partida avanza en memoria. Si una escritura falla, se registra en el log del servidor.

---

## 3. Tablas

### `rooms`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | Generado por el servidor |
| `code` | `text` | Código de 6 caracteres. Puede repetirse en el tiempo (solo es único entre salas activas) |
| `mode` | `text` | `1v1` (en la Fase 9, `2v2`) |
| `created_at` | `timestamptz` | |
| `closed_at` | `timestamptz` null | Al terminar la partida o cerrarse la sala |

Índice: `rooms_code_idx (code)`.

### `room_players`

| Columna | Tipo | Notas |
|---|---|---|
| `room_id` | `uuid` FK → `rooms` | |
| `player_id` | `text` | Asiento: `A1`, `B1` |
| `nickname` | `text` | Apodo validado por el protocolo |
| `joined_at` | `timestamptz` | |

PK: `(room_id, player_id)`. No se guarda el token de sesión.

### `matches`

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | También es el `matchId` del motor |
| `room_id` | `uuid` FK → `rooms` | |
| `mode` | `text` | |
| `ruleset_version` | `text` | Versión de balance usada (por ejemplo, `0.2.0`) |
| `seed` | `bigint` | Semilla del RNG del motor (entero de 32 bits) |
| `winner_team` | `text` null | `A`, `B` o `null` (empate o sin terminar) |
| `end_reason` | `text` null | `elimination`, `duel-limit` o `concede` |
| `started_at` / `finished_at` | `timestamptz` | |

### `match_actions`

| Columna | Tipo | Notas |
|---|---|---|
| `match_id` | `uuid` FK → `matches` | |
| `seq` | `integer` | Orden de aplicación, desde 0 |
| `player_id` | `text` | Quién actúa (según el motor) |
| `source` | `text` | `player`, `timeout` (jugó la IA Fácil por tiempo) o `abandon` (rendición por desconexión) |
| `payload` | `jsonb` | La `Action` completa del motor, incluida `selectTeam` |
| `created_at` | `timestamptz` | |

PK: `(match_id, seq)`.

### `schema_migrations`

Versiones de migración aplicadas. Las migraciones se ejecutan solas al arrancar el servidor, cada una dentro de una transacción. **Una migración publicada no se edita nunca:** los cambios van en una nueva.

---

## 4. Reproducir una partida

```ts
let state = createMatch({ id: match.id, mode, ruleset, roster, players, seed: match.seed });
for (const { action } of await repository.loadActions(match.id)) {
  const result = applyAction(state, action);
  if (!result.ok) throw new Error(result.error.message);
  state = result.value.state;
}
```

`ruleset` y `roster` salen de `getBalanceSet(match.ruleset_version)` en `@atacknimal/content`: por eso las versiones de balance publicadas no se modifican.

---

## 5. Pendiente

- Recuperar salas activas tras reiniciar el servidor: hoy las salas viven en memoria y una partida en curso se pierde si el proceso se reinicia (los datos guardados sí se conservan).
- Política de retención y borrado de partidas antiguas.
- 🔒 Rol de PostgreSQL con privilegios mínimos, conexión TLS y secretos fuera del repositorio (ARCHITECTURE §10).
