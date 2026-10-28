import { getBalanceSet } from '@atacknimal/content';
import { parentPort, workerData } from 'node:worker_threads';
import { greedyPolicy } from './policies.ts';
import { simulate } from './simulate.ts';
import { summarize } from './summary.ts';
import { applyVariant, type Variant } from './variants.ts';

export interface WorkerInput {
  readonly baseVersion: string;
  readonly variant: Variant;
  readonly sample: number;
  readonly seed: number;
}

const input = workerData as WorkerInput;
const balance = applyVariant(getBalanceSet(input.baseVersion), input.variant);
const stats = simulate({ balance, policy: greedyPolicy, seed: input.seed, sample: input.sample });
parentPort?.postMessage(summarize(stats, balance));
