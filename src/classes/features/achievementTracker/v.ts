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
    achievementsVersion: "",
    acceptedVersionMismatch: false,

    objectiveToUnlockMap: new Map<ObjectiveID, Unlock>(),

    completedObjectives: [] as Objective[],
    completedUnlocks: [] as Unlock[],
    completedUnlocksForRun: [] as Unlock[],
  },
};

export function isRandomizerEnabled(): boolean {
  return v.persistent.seed !== null;
}

export function getRandomizerSeed(): Seed | undefined {
  return v.persistent.seed ?? undefined;
}

export function getRandomizerMode(): RandomizerMode {
  return v.persistent.randomizerMode;
}

export function isHardcoreMode(): boolean {
  return (
    v.persistent.randomizerMode === RandomizerMode.HARDCORE ||
    v.persistent.randomizerMode === RandomizerMode.NIGHTMARE
  );
}

export function getCompletedObjectives(): Objective[] {
  return v.persistent.completedObjectives;
}

export function getCompletedUnlocks(): Unlock[] {
  return v.persistent.completedUnlocks;
}

export function getNumCompletedUnlocks(): int {
  return v.persistent.completedUnlocks.length;
}

export function getAchievementsVersion(): string {
  return v.persistent.achievementsVersion;
}

export function isAcceptedVersionMismatch(): boolean {
  return v.persistent.acceptedVersionMismatch;
}

export function setAcceptedVersionMismatch(): void {
  v.persistent.acceptedVersionMismatch = true;
}
