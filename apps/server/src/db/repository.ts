import type { Action, MatchResult } from '@atacknimal/engine';
import { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import pg from 'pg';
import { migrate } from './migrations.ts';
import { matchActions, matches, roomPlayers, rooms } from './schema.ts';

/** Origen de una acción aceptada (docs/DATABASE.md). */
export type ActionSource = 'player' | 'timeout' | 'abandon';

export interface StoredAction {
  readonly seq: number;
  readonly source: ActionSource;
  readonly action: Action;
}

export interface StoredMatch {
  readonly id: string;
  readonly rulesetVersion: string;
  readonly seed: number;
  readonly winnerTeam: string | null;
  readonly endReason: string | null;
}

/** Lo que el servidor guarda. Nunca bloquea el juego: la sala encola las escrituras. */
export interface MatchRepository {
  roomCreated(room: { id: string; code: string; mode: string }): Promise<void>;
  playerJoined(roomId: string, playerId: string, nickname: string): Promise<void>;
  matchCreated(match: {
    id: string;
    roomId: string;
    mode: string;
    rulesetVersion: string;
    seed: number;
  }): Promise<void>;
  actionAccepted(matchId: string, entry: StoredAction): Promise<void>;
  matchFinished(matchId: string, result: MatchResult): Promise<void>;
  roomClosed(roomId: string): Promise<void>;
  /** Partida guardada de una sala (la última), para auditarla o reproducirla. */
  findMatchByRoom(roomId: string): Promise<StoredMatch | null>;
  loadActions(matchId: string): Promise<StoredAction[]>;
  close(): Promise<void>;
}

function createRepository<T extends PgQueryResultHKT>(
  db: PgDatabase<T>,
  close: () => Promise<void>,
): MatchRepository {
  return {
    async roomCreated(room) {
      await db.insert(rooms).values(room);
    },
    async playerJoined(roomId, playerId, nickname) {
      await db.insert(roomPlayers).values({ roomId, playerId, nickname });
    },
    async matchCreated(match) {
      await db.insert(matches).values(match);
    },
    async actionAccepted(matchId, { seq, source, action }) {
      await db
        .insert(matchActions)
        .values({ matchId, seq, playerId: action.playerId, source, payload: action });
    },
    async matchFinished(matchId, result) {
      await db
        .update(matches)
        .set({ winnerTeam: result.winner, endReason: result.reason, finishedAt: new Date() })
        .where(eq(matches.id, matchId));
    },
    async roomClosed(roomId) {
      await db.update(rooms).set({ closedAt: new Date() }).where(eq(rooms.id, roomId));
    },
    async findMatchByRoom(roomId) {
      const [row] = await db
        .select({
          id: matches.id,
          rulesetVersion: matches.rulesetVersion,
          seed: matches.seed,
          winnerTeam: matches.winnerTeam,
          endReason: matches.endReason,
        })
        .from(matches)
        .where(eq(matches.roomId, roomId))
        .orderBy(matches.startedAt)
        .limit(1);
      return row ?? null;
    },
    async loadActions(matchId) {
      const rows = await db
        .select({
          seq: matchActions.seq,
          source: matchActions.source,
          payload: matchActions.payload,
        })
        .from(matchActions)
        .where(eq(matchActions.matchId, matchId))
        .orderBy(matchActions.seq);
      return rows.map((row) => ({
        seq: row.seq,
        source: row.source as ActionSource,
        action: row.payload as Action,
      }));
    },
    close,
  };
}

/**
 * Abre la base de datos y aplica las migraciones. Con `databaseUrl`, PostgreSQL de verdad;
 * sin ella, PGlite (PostgreSQL embebido en WebAssembly) en memoria o en `pgliteDir`.
 */
export async function openRepository(options: {
  databaseUrl?: string | undefined;
  pgliteDir?: string | undefined;
}): Promise<MatchRepository> {
  if (options.databaseUrl !== undefined) {
    const pool = new pg.Pool({ connectionString: options.databaseUrl });
    await migrate(
      async (sql) => {
        await pool.query(sql);
      },
      async (sql) => (await pool.query<{ version: string }>(sql)).rows,
    );
    return createRepository(drizzlePg(pool), () => pool.end());
  }
  const client = new PGlite(options.pgliteDir);
  await migrate(
    async (sql) => {
      await client.exec(sql);
    },
    async (sql) => (await client.query<{ version: string }>(sql)).rows,
  );
  return createRepository(drizzlePglite(client), () => client.close());
}
