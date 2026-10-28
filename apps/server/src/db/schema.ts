/**
 * Esquema de PostgreSQL (docs/DATABASE.md). La fuente de verdad de una partida es su semilla
 * más sus acciones aceptadas (`match_actions`): el motor es determinista, así que aplicarlas
 * en orden reconstruye la partida exacta, con todos sus eventos.
 */
import {
  bigint,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey(),
  code: text('code').notNull(),
  mode: text('mode').notNull(),
  createdAt: createdAt(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
});

export const roomPlayers = pgTable(
  'room_players',
  {
    roomId: uuid('room_id')
      .notNull()
      .references(() => rooms.id),
    playerId: text('player_id').notNull(),
    nickname: text('nickname').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roomId, t.playerId] })],
);

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey(),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id),
  mode: text('mode').notNull(),
  rulesetVersion: text('ruleset_version').notNull(),
  seed: bigint('seed', { mode: 'number' }).notNull(),
  winnerTeam: text('winner_team'),
  endReason: text('end_reason'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export const matchActions = pgTable(
  'match_actions',
  {
    matchId: uuid('match_id')
      .notNull()
      .references(() => matches.id),
    seq: integer('seq').notNull(),
    playerId: text('player_id').notNull(),
    /** Quién originó la acción: el jugador, la IA por tiempo agotado o el abandono. */
    source: text('source').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.matchId, t.seq] })],
);
