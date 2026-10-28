/**
 * Uso: npm run experiment -- <nombre>   (por ejemplo, 025-026)
 * Simula cada variante de src/experiments/<nombre>.ts en paralelo y escribe una tabla comparativa
 * en packages/sim/reports/experiments/<nombre>.md.
 */
import {
  checkProfileBudget,
  checkRosterCoverage,
  getBalanceSet,
  type Targets,
} from '@atacknimal/content';
import { mkdirSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import type { WorkerInput } from './experiment-worker.ts';
import { evaluate } from './report.ts';
import type { SimulationSummary } from './summary.ts';
import { applyVariant, type Variant } from './variants.ts';

export interface Criterion {
  readonly label: string;
  readonly test: (summary: SimulationSummary, targets: Targets) => boolean;
}

export interface Experiment {
  readonly title: string;
  readonly baseVersion: string;
  readonly sample: number;
  readonly seed: number;
  readonly criterion: Criterion;
  readonly variants: readonly Variant[];
}

const name = process.argv[2];
if (name === undefined) throw new Error('Indica el experimento: npm run experiment -- <nombre>');
const { EXPERIMENT } = (await import(`./experiments/${name}.ts`)) as { EXPERIMENT: Experiment };
const base = getBalanceSet(EXPERIMENT.baseVersion);
const { targets } = base;

/** Incumplimientos del presupuesto de BALANCE §2 que introduce una variante. */
function budgetIssues(variant: Variant): string[] {
  const patched = applyVariant(base, variant);
  return [
    ...patched.roster.flatMap((p) =>
      checkProfileBudget(p, patched.budget).map((issue) => `${p.id}: ${issue}`),
    ),
    ...checkRosterCoverage(patched.roster, patched.budget),
  ];
}

const started = performance.now();
const results = await runPool(EXPERIMENT, Math.max(1, availableParallelism() - 1));
const seconds = (performance.now() - started) / 1000;

const pct = (v: number): string => `${(v * 100).toFixed(1)} %`;
const mark = (ok: boolean): string => (ok ? '✅' : '—');
const budgetNotes: string[] = [];
const rows = EXPERIMENT.variants.map((variant, i) => {
  const s = results[i];
  if (s === undefined) throw new Error(`Sin resultado para ${variant.name}`);
  const sorted = [...s.animals].sort((a, b) => a.winRate - b.winRate);
  const weakest = sorted[0];
  const strongest = sorted.at(-1);
  const outOfRange = s.animals.filter((a) => evaluate(a.winRate, targets.animalWinRate) !== 'ok');
  const eagle = s.animals.find((a) => a.id === 'golden-eagle');
  const budget = budgetIssues(variant);
  const meets = budget.length === 0 && EXPERIMENT.criterion.test(s, targets);
  if (budget.length > 0) budgetNotes.push(`- **${variant.name}**: ${budget.join('; ')}`);
  return (
    `| ${variant.name} | ${pct(s.attackerWinRate)} | ${pct(s.firstPlayerWinRate)} | ` +
    `${s.averageDuels.toFixed(1)} | ${pct(s.duelLimitRate)} | ${pct(s.tieRate)} | ` +
    `${eagle === undefined ? '—' : pct(eagle.winRate)} | ` +
    `${weakest === undefined ? '—' : `${weakest.name} ${pct(weakest.winRate)}`} | ` +
    `${strongest === undefined ? '—' : `${strongest.name} ${pct(strongest.winRate)}`} | ` +
    `${String(outOfRange.length)} | ${mark(budget.length === 0)} | ${mark(meets)} |`
  );
});

const report = [
  `# Experimento: ${EXPERIMENT.title}`,
  '',
  `> Base: balance ${EXPERIMENT.baseVersion} · política \`greedy\` · ${EXPERIMENT.sample.toLocaleString('es')} partidas por variante · semilla ${String(EXPERIMENT.seed)} · ${seconds.toFixed(0)} s`,
  '> Leyenda de variantes: **A+n** ventaja defensiva +n · **Bn** el atributo del atacante queda bloqueado para su equipo n ataques · **Cn** el equipo no repite hábitat en n ataques · **aire neutral** los no voladores pasan de Hostil a Neutral en Aire.',
  `> **Criterio**: ${EXPERIMENT.criterion.label} Además, la variante debe respetar el presupuesto de BALANCE §2.`,
  '',
  '| Variante | Gana el atacante | Primer jugador | Duelos | Llegan al límite | Empates | Águila | Más débil | Más fuerte | Animales fuera de 45–55 % | Presupuesto | Criterio |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ...rows,
  '',
  '## Win rate por animal',
  '',
  `| Animal | ${EXPERIMENT.variants.map((v) => v.name).join(' | ')} |`,
  `|---|${EXPERIMENT.variants.map(() => '---').join('|')}|`,
  ...base.roster.map((profile) => {
    const cells = results.map((s) => {
      const animal = s.animals.find((a) => a.id === profile.id);
      return animal === undefined ? '—' : pct(animal.winRate);
    });
    const label = results[0]?.animals.find((a) => a.id === profile.id)?.name ?? profile.id;
    return `| ${label} | ${cells.join(' | ')} |`;
  }),
  '',
  ...(budgetNotes.length === 0
    ? []
    : ['## Incumplimientos de presupuesto', '', ...budgetNotes, '']),
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
