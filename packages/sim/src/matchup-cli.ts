/**
 * Uso: npm run matchup -- --a hard --b normal [--sample 4000] [--version 0.2.0] [--seed 1]
 * Enfrenta dos niveles de IA y escribe packages/sim/reports/<versión>/matchups/<a>-vs-<b>.md.
 */
import { getBalanceSet, LATEST_BALANCE_VERSION } from '@atacknimal/content';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { matchup } from './matchup.ts';
import { isPolicyName, POLICIES } from './policies.ts';

const { values } = parseArgs({
  options: {
    a: { type: 'string', default: 'hard' },
    b: { type: 'string', default: 'normal' },
    version: { type: 'string', default: LATEST_BALANCE_VERSION },
    seed: { type: 'string', default: '1' },
    sample: { type: 'string', default: '4000' },
  },
});

const { a, b } = values;
if (!isPolicyName(a) || !isPolicyName(b)) {
  throw new Error(`Políticas válidas: ${Object.keys(POLICIES).join(', ')}`);
}
const balance = getBalanceSet(values.version);
const started = performance.now();
const result = matchup({
  balance,
  a: POLICIES[a],
  b: POLICIES[b],
  seed: Number(values.seed),
  sample: Number(values.sample),
});
const seconds = (performance.now() - started) / 1000;

const pct = (v: number): string => `${(v * 100).toFixed(1)} %`;
const summary = [
  `# ${a} contra ${b} · balance ${balance.version}`,
  '',
  `> ${String(result.matches)} partidas 1v1 con equipos al azar, lados alternos · semilla ${values.seed} · ${seconds.toFixed(0)} s`,
  '',
  `| | ${a} | ${b} | Empates |`,
  '|---|---|---|---|',
  `| Partidas ganadas | ${String(result.aWins)} | ${String(result.bWins)} | ${String(result.draws)} |`,
  `| Win rate | ${pct(result.aWinRate)} | ${pct(1 - result.aWinRate)} | |`,
  '',
].join('\n');

const outDir = join(import.meta.dirname, '..', 'reports', balance.version, 'matchups');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${a}-vs-${b}.md`), summary);
process.stdout.write(`${a} ${pct(result.aWinRate)} contra ${b} (${seconds.toFixed(0)} s)\n`);
