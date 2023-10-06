import { RandomizerMode } from "../../../enums/RandomizerMode";
import type { Objective } from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import type { Unlock } from "../../../types/Unlock";

// This is registered in "AchievementTracker.ts".
// eslint-disable-next-line isaacscript/require-v-registration
export const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,
    randomizerMode: RandomizerMode.CASUAL,

    objectiveToUnlockMap: new Map<ObjectiveID, Unlock>(),

    completedObjectives: [] as Objective[],
    completedAchievements: [] as Unlock[],
    completedAchievementsForRun: [] as Unlock[],
  },
};

export function isRandomizerEnabled(): boolean {
  return v.persistent.seed !== null;
}

export function getRandomizerSeed(): Seed | undefined {
  return v.persistent.seed ?? undefined;
}
