/**
 * Uso:
 *   npm run simulate -- [--policy greedy|random] [--version 0.1.0] [--seed 1] [--sample N]
 * Escribe el informe en packages/sim/reports/<versión>/<política>/.
 */
import { getBalanceSet, LATEST_BALANCE_VERSION } from '@atacknimal/content';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { isPolicyName, POLICIES } from './policies.ts';
import { renderAnimalsCsv, renderMarkdown } from './report.ts';
import { simulate } from './simulate.ts';

const { values } = parseArgs({
  options: {
    policy: { type: 'string', default: 'greedy' },
    version: { type: 'string', default: LATEST_BALANCE_VERSION },
    seed: { type: 'string', default: '1' },
    sample: { type: 'string' },
  },
});

if (!isPolicyName(values.policy)) {
  throw new Error(
    `Política desconocida: ${values.policy}. Opciones: ${Object.keys(POLICIES).join(', ')}`,
  );
}
const policy = values.policy;
const balance = getBalanceSet(values.version);
const seed = Number(values.seed);
const sample = values.sample === undefined ? undefined : Number(values.sample);

const started = performance.now();
let lastPercent = -1;
const stats = simulate({
  balance,
  policy: POLICIES[policy],
  seed,
  ...(sample === undefined ? {} : { sample }),
  onProgress: (done, total) => {
    const percent = Math.floor((done / total) * 100);
    if (percent % 10 === 0 && percent !== lastPercent) {
      lastPercent = percent;
      process.stderr.write(`${String(percent)} % (${String(done)}/${String(total)})\n`);
    }
  },
});
const seconds = (performance.now() - started) / 1000;

const outDir = join(import.meta.dirname, '..', 'reports', balance.version, policy);
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'summary.md'),
  renderMarkdown(stats, balance, { policy, seed, sample, seconds }),
);
writeFileSync(join(outDir, 'animals.csv'), renderAnimalsCsv(stats, balance));
process.stdout.write(`Informe escrito en ${outDir} (${seconds.toFixed(0)} s)\n`);
