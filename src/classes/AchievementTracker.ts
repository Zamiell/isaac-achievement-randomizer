import type { TrinketType } from "isaac-typescript-definitions";
import { PlayerType } from "isaac-typescript-definitions";
import { ModFeature, getRandomSeed, log, restart } from "isaacscript-common";

const STARTING_CHARACTER = PlayerType.ISAAC;

const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,
  },
};

export class AchievementTracker extends ModFeature {
  v = v;
}

export function isRandomizerEnabled(): boolean {
  return v.persistent.seed !== null;
}

export function getRandomizerSeed(): Seed | undefined {
  return v.persistent.seed ?? undefined;
}

export function startRandomizer(seed: Seed | undefined): void {
  if (seed === undefined) {
    seed = getRandomSeed();
  }

  v.persistent.seed = seed;
  log(`Set new seed: ${v.persistent.seed}`);

  // TODO: set persistent variables

  restart(STARTING_CHARACTER);
}

export function endRandomizer(): void {
  v.persistent.seed = null;

  // TODO: empty persistent variables

  restart(STARTING_CHARACTER);
}

export function getUnlockedTrinketTypes(): ReadonlySet<TrinketType> {
  return new Set();
}
