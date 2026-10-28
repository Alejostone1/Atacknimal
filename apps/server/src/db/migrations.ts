/**
 * Migraciones en SQL explícito, aplicadas en orden al arrancar. Deben coincidir con schema.ts.
 * Una migración publicada nunca se edita: los cambios van en una nueva.
 */
export const MIGRATIONS: readonly { readonly version: string; readonly sql: string }[] = [
  {
    version: '0001_init',
    sql: `
      CREATE TABLE rooms (
        id uuid PRIMARY KEY,
        code text NOT NULL,
        mode text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        closed_at timestamptz
      );
      CREATE INDEX rooms_code_idx ON rooms (code);

      CREATE TABLE room_players (
        room_id uuid NOT NULL REFERENCES rooms (id),
        player_id text NOT NULL,
        nickname text NOT NULL,
        joined_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (room_id, player_id)
      );

      CREATE TABLE matches (
        id uuid PRIMARY KEY,
        room_id uuid NOT NULL REFERENCES rooms (id),
        mode text NOT NULL,
        ruleset_version text NOT NULL,
        seed bigint NOT NULL,
        winner_team text,
        end_reason text,
        started_at timestamptz NOT NULL DEFAULT now(),
        finished_at timestamptz
      );

      CREATE TABLE match_actions (
        match_id uuid NOT NULL REFERENCES matches (id),
        seq integer NOT NULL,
        player_id text NOT NULL,
        source text NOT NULL,
        payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (match_id, seq)
      );
    `,
  },
];

/** Aplica las migraciones pendientes con la función de ejecución del driver. */
export async function migrate(
  exec: (sql: string) => Promise<void>,
  query: (sql: string) => Promise<readonly { version: string }[]>,
): Promise<string[]> {
  await exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const applied = new Set(
    (await query('SELECT version FROM schema_migrations')).map((r) => r.version),
  );
  const done: string[] = [];
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    await exec(
      `BEGIN; ${migration.sql} INSERT INTO schema_migrations (version) VALUES ('${migration.version}'); COMMIT;`,
    );
    done.push(migration.version);
  }
  return done;
}
