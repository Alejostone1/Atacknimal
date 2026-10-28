/**
 * Uso: npm run experiment -- <nombre>   (por ejemplo, 025-026)
 * Simula cada variante de src/experiments/<nombre>.ts en paralelo y escribe una tabla comparativa
 * en packages/sim/reports/experiments/<nombre>.md.
 */
import { getBalanceSet } from '@atacknimal/content';
import { mkdirSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { WorkerInput } from './experiment-worker.ts';
import { evaluate } from './report.ts';
import type { SimulationSummary } from './summary.ts';
import type { Variant } from './variants.ts';

interface Experiment {
  readonly title: string;
  readonly baseVersion: string;
  readonly sample: number;
  readonly seed: number;
  readonly variants: readonly Variant[];
}

const name = process.argv[2];
if (name === undefined) throw new Error('Indica el experimento: npm run experiment -- <nombre>');
const { EXPERIMENT } = (await import(`./experiments/${name}.ts`)) as { EXPERIMENT: Experiment };
const targets = getBalanceSet(EXPERIMENT.baseVersion).targets;

const started = performance.now();
const results = await runPool(EXPERIMENT, Math.max(1, availableParallelism() - 1));
const seconds = (performance.now() - started) / 1000;

const pct = (v: number): string => `${(v * 100).toFixed(1)} %`;
const mark = (ok: boolean): string => (ok ? '✅' : '—');
const rows = EXPERIMENT.variants.map((variant, i) => {
  const s = results[i];
  if (s === undefined) throw new Error(`Sin resultado para ${variant.name}`);
  const sorted = [...s.animals].sort((a, b) => a.winRate - b.winRate);
  const weakest = sorted[0];
  const strongest = sorted.at(-1);
  const outOfRange = s.animals.filter((a) => evaluate(a.winRate, targets.animalWinRate) !== 'ok');
  const eagle = s.animals.find((a) => a.id === 'golden-eagle');
  const meets =
    s.attackerWinRate >= 0.55 &&
    s.attackerWinRate <= 0.62 &&
    evaluate(s.firstPlayerWinRate, targets.firstPlayerWinRate) !== 'alert';
  return (
    `| ${variant.name} | ${pct(s.attackerWinRate)} | ${pct(s.firstPlayerWinRate)} | ` +
    `${s.averageDuels.toFixed(1)} | ${pct(s.duelLimitRate)} | ${pct(s.tieRate)} | ` +
    `${eagle === undefined ? '—' : pct(eagle.winRate)} | ` +
    `${weakest === undefined ? '—' : `${weakest.name} ${pct(weakest.winRate)}`} | ` +
    `${strongest === undefined ? '—' : `${strongest.name} ${pct(strongest.winRate)}`} | ` +
    `${String(outOfRange.length)} | ${mark(meets)} |`
  );
});

const report = [
  `# Experimento: ${EXPERIMENT.title}`,
  '',
  `> Base: balance ${EXPERIMENT.baseVersion} · política \`greedy\` · ${EXPERIMENT.sample.toLocaleString('es')} partidas por variante · semilla ${String(EXPERIMENT.seed)} · ${seconds.toFixed(0)} s`,
  '> Leyenda de variantes: **A+n** ventaja defensiva +n · **Bn** el atributo del atacante queda bloqueado para su equipo n ataques · **Cn** el equipo no repite hábitat en n ataques · **aire neutral** los no voladores pasan de Hostil a Neutral en Aire.',
  '> **Criterio** (#025): atacante entre 55 % y 62 % y primer jugador sin alerta (≤ 54 %).',
  '',
  '| Variante | Gana el atacante | Primer jugador | Duelos | Llegan al límite | Empates | Águila | Más débil | Más fuerte | Animales fuera de 45–55 % | Criterio |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');

const outDir = join(import.meta.dirname, '..', 'reports', 'experiments');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${name}.md`), report);
process.stdout.write(
  `Experimento escrito en ${join(outDir, `${name}.md`)} (${seconds.toFixed(0)} s)\n`,
);

/** Reparte las variantes entre hilos y devuelve los resúmenes en el mismo orden. */
async function runPool(experiment: Experiment, size: number): Promise<SimulationSummary[]> {
  const results: SimulationSummary[] = [];
  let next = 0;
  let done = 0;
  const workerUrl = new URL('./experiment-worker.ts', import.meta.url);

  const runOne = (index: number): Promise<void> =>
    new Promise((resolve, reject) => {
      const variant = experiment.variants[index];
      if (variant === undefined) {
        resolve();
        return;
      }
      const input: WorkerInput = {
        baseVersion: experiment.baseVersion,
        variant,
        sample: experiment.sample,
        seed: experiment.seed,
      };
      const worker = new Worker(workerUrl, { workerData: input });
      worker.once('message', (summary: SimulationSummary) => {
        results[index] = summary;
        done++;
        process.stderr.write(
          `${String(done)}/${String(experiment.variants.length)} ${variant.name || 'base'}\n`,
        );
        resolve();
      });
      worker.once('error', reject);
    });

  const lane = async (): Promise<void> => {
    while (next < experiment.variants.length) {
      const index = next++;
      await runOne(index);
    }
  };
  await Promise.all(Array.from({ length: size }, lane));
  return results;
}
