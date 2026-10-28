import { getAnimal, type BalanceSet, type Target } from '@atacknimal/content';
import type { ATTRIBUTES } from '@atacknimal/engine';
import { HABITATS, type AnimalId } from '@atacknimal/engine';
import { winRate, type BalanceStats, type UseTally } from './stats.ts';

export type Status = 'ok' | 'warn' | 'alert';

/** Equipos que cuentan como "los mejores" para medir la presencia (docs/BALANCE.md §7.2). */
const TOP_TEAMS = 20;

const ATTRIBUTE_NAMES: Readonly<Record<(typeof ATTRIBUTES)[number], string>> = {
  weight: 'Peso',
  strength: 'Fuerza',
  agility: 'Agilidad',
  attack: 'Ataque',
  endurance: 'Resistencia',
  speed: 'Velocidad',
  defense: 'Defensa',
  perception: 'Percepción',
};

const HABITAT_NAMES: Readonly<Record<(typeof HABITATS)[number], string>> = {
  air: 'Aire',
  water: 'Agua',
  land: 'Tierra',
  trees: 'Árboles',
};

const ICON: Readonly<Record<Status, string>> = { ok: '✅', warn: '⚠️', alert: '🔴' };

/** `ok` dentro del objetivo, `alert` fuera del umbral de alerta, `warn` entre ambos. */
export function evaluate(value: number, target: Target): Status {
  if (
    (target.alertMin !== undefined && value < target.alertMin) ||
    (target.alertMax !== undefined && value > target.alertMax)
  ) {
    return 'alert';
  }
  const aboveMin = target.min === undefined || value >= target.min;
  const belowMax = target.max === undefined || value <= target.max;
  return aboveMin && belowMax ? 'ok' : 'warn';
}

export interface AnimalMetrics {
  readonly id: AnimalId;
  readonly name: string;
  readonly winRate: number;
  readonly status: Status;
  readonly topTeamPresence: number;
  readonly attackShare: number;
  readonly attackWinRate: number;
}

export interface ReportMeta {
  readonly policy: string;
  readonly seed: number;
  readonly sample: number | undefined;
  readonly seconds: number;
}

export function animalMetrics(stats: BalanceStats, balance: BalanceSet): AnimalMetrics[] {
  const top = topTeams(stats);
  return balance.roster
    .map(({ id }) => {
      const tally = stats.animals.get(id) ?? { matches: 0, wins: 0, draws: 0 };
      const attacks = stats.attackers.get(id) ?? { uses: 0, wins: 0 };
      const rate = winRate(tally);
      return {
        id,
        name: getAnimal(id).name,
        winRate: rate,
        status: evaluate(rate, balance.targets.animalWinRate),
        topTeamPresence: top.filter(([key]) => key.split('+').includes(id)).length / top.length,
        attackShare: ratio(attacks.uses, stats.duels),
        attackWinRate: ratio(attacks.wins, attacks.uses),
      };
    })
    .sort((a, b) => b.winRate - a.winRate);
}

export function renderMarkdown(stats: BalanceStats, balance: BalanceSet, meta: ReportMeta): string {
  const { targets } = balance;
  const animals = animalMetrics(stats, balance);
  const matchRows: [string, number, 'percent' | 'number', Target | undefined][] = [
    [
      'Win rate del primer jugador',
      ratio(stats.firstTeamWins + stats.draws / 2, stats.matches),
      'percent',
      targets.firstPlayerWinRate,
    ],
    [
      'Duelos por partida (media)',
      ratio(stats.totalDuels, stats.matches),
      'number',
      targets.matchDuels,
    ],
    [
      'Partidas que llegan al límite de duelos',
      ratio(stats.reasons['duel-limit'], stats.matches),
      'percent',
      targets.duelLimitRate,
    ],
    ['Partidas empatadas', ratio(stats.draws, stats.matches), 'percent', undefined],
    [
      'Win rate del atacante por duelo',
      ratio(stats.attackerWins, stats.duels),
      'percent',
      targets.attackerDuelWinRate,
    ],
    ['Duelos empatados', ratio(stats.ties, stats.duels), 'percent', targets.tieRate],
    [
      'Defensas forzadas por partida',
      ratio(stats.forcedDefenses, stats.matches),
      'number',
      targets.forcedDefensesPerMatch,
    ],
    ['Daño medio por duelo', ratio(stats.damageTotal, stats.duels), 'number', undefined],
  ];

  const alerts = [
    ...matchRows.flatMap(([label, value, format, target]) =>
      target !== undefined && evaluate(value, target) !== 'ok'
        ? [`${ICON[evaluate(value, target)]} ${label}: ${show(value, format)}`]
        : [],
    ),
    ...animals
      .filter((a) => a.status !== 'ok')
      .map((a) => `${ICON[a.status]} ${a.name}: win rate ${show(a.winRate, 'percent')}`),
    ...animals
      .filter((a) => evaluate(a.topTeamPresence, targets.topTeamPresence) !== 'ok')
      .map(
        (a) =>
          `${ICON[evaluate(a.topTeamPresence, targets.topTeamPresence)]} ${a.name}: presente en el ` +
          `${show(a.topTeamPresence, 'percent')} de los ${String(TOP_TEAMS)} mejores equipos`,
      ),
    ...usageAlerts(
      stats.attributes,
      ATTRIBUTE_NAMES,
      stats.duels,
      targets.attributeUsage,
      'Atributo',
    ),
    ...usageAlerts(stats.habitats, HABITAT_NAMES, stats.duels, targets.habitatUsage, 'Hábitat'),
  ];

  const lines = [
    `# Informe de balance · ruleset ${balance.version} · política \`${meta.policy}\``,
    '',
    `> ${stats.matches.toLocaleString('es')} partidas 1v1 · ${stats.duels.toLocaleString('es')} duelos · ` +
      `${meta.sample === undefined ? 'round-robin completo' : `muestra de ${String(meta.sample)} emparejamientos`} · ` +
      `semilla ${String(meta.seed)} · ${meta.seconds.toFixed(0)} s`,
    '> Objetivos y umbrales: `packages/content/data/balance/' +
      balance.version +
      '.json` (docs/BALANCE.md §7.2).',
    '> Leyenda: ✅ dentro del objetivo · ⚠️ fuera del objetivo · 🔴 fuera del umbral de alerta.',
    '',
    '## Alertas',
    '',
    ...(alerts.length === 0 ? ['Ninguna.'] : alerts.map((a) => `- ${a}`)),
    '',
    '## Partida',
    '',
    '| Métrica | Valor | Estado |',
    '|---|---|---|',
    ...matchRows.map(
      ([label, value, format, target]) =>
        `| ${label} | ${show(value, format)} | ${target === undefined ? '—' : ICON[evaluate(value, target)]} |`,
    ),
    '',
    '## Animales',
    '',
    `| Animal | Win rate | Estado | En los ${String(TOP_TEAMS)} mejores equipos | % de ataques | Win rate atacando |`,
    '|---|---|---|---|---|---|',
    ...animals.map(
      (a) =>
        `| ${a.name} | ${show(a.winRate, 'percent')} | ${ICON[a.status]} | ${show(a.topTeamPresence, 'percent')} | ` +
        `${show(a.attackShare, 'percent')} | ${show(a.attackWinRate, 'percent')} |`,
    ),
    '',
    '## Atributos (elegidos por el atacante)',
    '',
    ...usageTable(stats.attributes, ATTRIBUTE_NAMES, stats.duels, targets.attributeUsage),
    '',
    '## Hábitats (elegidos por el atacante)',
    '',
    ...usageTable(stats.habitats, HABITAT_NAMES, stats.duels, targets.habitatUsage),
    '',
    '## Hábitat elegido por cada animal al atacar',
    '',
    'Cada celda: % de los ataques de ese animal en ese hábitat (win rate atacando ahí).',
    '',
    `| Animal | ${HABITATS.map((h) => HABITAT_NAMES[h]).join(' | ')} |`,
    `|---|${HABITATS.map(() => '---').join('|')}|`,
    ...animals.map((a) => {
      const total = stats.attackers.get(a.id)?.uses ?? 0;
      const cells = HABITATS.map((h) => {
        const use = stats.attackerHabitats.get(`${a.id}/${h}`) ?? { uses: 0, wins: 0 };
        return use.uses === 0
          ? '—'
          : `${show(ratio(use.uses, total), 'percent')} (${show(ratio(use.wins, use.uses), 'percent')})`;
      });
      return `| ${a.name} | ${cells.join(' | ')} |`;
    }),
    '',
    '## Márgenes de los duelos',
    '',
    'Estimación de qué pasaría si el defensor sumara una ventaja fija, con las mismas elecciones de esta',
    'simulación (sin que los bots se adapten). Sirve para dimensionar cambios de reglas, no como resultado final.',
    '',
    '| Ventaja del defensor | Gana el atacante | Empate | Gana el defensor |',
    '|---|---|---|---|',
    ...MARGIN_PROBES.map((bonus) => {
      const { attacker, tie, defender } = marginSplit(stats, bonus);
      return `| +${String(bonus)} | ${show(attacker, 'percent')} | ${show(tie, 'percent')} | ${show(defender, 'percent')} |`;
    }),
    '',
    `## Los ${String(TOP_TEAMS)} mejores equipos`,
    '',
    '| # | Equipo | Win rate |',
    '|---|---|---|',
    ...topTeams(stats).map(
      ([key, rate], index) =>
        `| ${String(index + 1)} | ${key
          .split('+')
          .map((id) => getAnimal(id).name)
          .join(', ')} | ${show(rate, 'percent')} |`,
    ),
    '',
  ];
  return lines.join('\n');
}

export function renderAnimalsCsv(stats: BalanceStats, balance: BalanceSet): string {
  const header = 'animal,win_rate,top_team_presence,attack_share,attack_win_rate';
  const rows = animalMetrics(stats, balance).map((a) =>
    [a.id, a.winRate, a.topTeamPresence, a.attackShare, a.attackWinRate]
      .map((v) => (typeof v === 'number' ? v.toFixed(4) : v))
      .join(','),
  );
  return [header, ...rows, ''].join('\n');
}

function topTeams(stats: BalanceStats): [string, number][] {
  return [...stats.teams.entries()]
    .map(([key, tally]): [string, number] => [key, winRate(tally)])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_TEAMS);
}

function usageTable<K extends string>(
  map: ReadonlyMap<K, UseTally>,
  names: Readonly<Record<K, string>>,
  total: number,
  target: Target,
): string[] {
  return [
    '| | Uso | Estado | Win rate del atacante |',
    '|---|---|---|---|',
    ...(Object.keys(names) as K[]).map((key) => {
      const use = map.get(key) ?? { uses: 0, wins: 0 };
      const share = ratio(use.uses, total);
      return `| ${names[key]} | ${show(share, 'percent')} | ${ICON[evaluate(share, target)]} | ${show(ratio(use.wins, use.uses), 'percent')} |`;
    }),
  ];
}

function usageAlerts<K extends string>(
  map: ReadonlyMap<K, UseTally>,
  names: Readonly<Record<K, string>>,
  total: number,
  target: Target,
  label: string,
): string[] {
  return (Object.keys(names) as K[]).flatMap((key) => {
    const share = ratio(map.get(key)?.uses ?? 0, total);
    const status = evaluate(share, target);
    return status === 'ok'
      ? []
      : [`${ICON[status]} ${label} ${names[key]}: uso ${show(share, 'percent')}`];
  });
}

/** Ventajas defensivas hipotéticas que se evalúan en el informe. */
const MARGIN_PROBES = [0, 5, 10, 15, 20, 25, 30] as const;

/** Reparto de resultados si el defensor sumara `bonus` a su valor efectivo. */
export function marginSplit(
  stats: BalanceStats,
  bonus: number,
): { attacker: number; tie: number; defender: number } {
  let attacker = 0;
  let tie = 0;
  for (const [margin, count] of stats.signedMargins) {
    if (margin > bonus) attacker += count;
    else if (margin === bonus) tie += count;
  }
  return {
    attacker: ratio(attacker, stats.duels),
    tie: ratio(tie, stats.duels),
    defender: ratio(stats.duels - attacker - tie, stats.duels),
  };
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

function show(value: number, format: 'percent' | 'number'): string {
  return format === 'percent' ? `${(value * 100).toFixed(1)} %` : value.toFixed(1);
}
