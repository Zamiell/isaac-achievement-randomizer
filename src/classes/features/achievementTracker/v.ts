import type { Achievement } from "../../../types/Achievement";
import type { Objective } from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";

// This is registered in "AchievementTracker.ts".
// eslint-disable-next-line isaacscript/require-v-registration
export const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,

    objectiveToAchievementMap: new Map<ObjectiveID, Achievement>(),

    completedObjectives: [] as Objective[],
    completedAchievements: [] as Achievement[],
    completedAchievementsForRun: [] as Achievement[],
  },
};

export function isRandomizerEnabled(): boolean {
  return v.persistent.seed !== null;
}
