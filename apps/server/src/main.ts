import { loadConfig } from './config.ts';
import { openRepository } from './db/repository.ts';
import { buildServer } from './server.ts';

const config = loadConfig();
const repository = await openRepository(config);
const server = buildServer({ config, repository, logger: true });

await server.http.listen({ port: config.port, host: config.host });
server.http.log.info(
  config.databaseUrl !== undefined
    ? 'Base de datos: PostgreSQL (DATABASE_URL)'
    : config.localDriver === 'memory'
      ? 'Almacenamiento: en memoria (sin base de datos)'
      : `Base de datos: PGlite (${config.pgliteDir ?? 'en memoria'})`,
);

const shutdown = async (): Promise<void> => {
  await server.close();
  await repository.close();
  process.exit(0);
};
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
