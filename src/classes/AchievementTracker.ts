import type { TrinketType } from "isaac-typescript-definitions";
import { ModFeature } from "isaacscript-common";

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

export function getUnlockedTrinketTypes(): ReadonlySet<TrinketType> {
  return new Set();
}
