import { RandomizerMode } from "../../../enums/RandomizerMode";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import type { UnlockID } from "../../../types/UnlockID";

// This is registered in "AchievementTracker.ts".
// eslint-disable-next-line isaacscript/require-v-registration
export const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,
    randomizerMode: RandomizerMode.CASUAL,
    achievementsVersion: "",
    acceptedVersionMismatch: false,

    objectiveIDToUnlockIDMap: new Map<ObjectiveID, UnlockID>(),
    unlockIDToObjectiveIDMap: new Map<UnlockID, ObjectiveID>(),

    completedObjectiveIDs: [] as ObjectiveID[],
    completedUnlockIDs: [] as UnlockID[],
    completedUnlockIDsForRun: [] as UnlockID[],
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

export function isNightmareMode(): boolean {
  return v.persistent.randomizerMode === RandomizerMode.NIGHTMARE;
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

export function getCompletedObjectiveIDs(): ObjectiveID[] {
  return v.persistent.completedObjectiveIDs;
}

export function getNumCompletedObjectives(): int {
  return v.persistent.completedObjectiveIDs.length;
}

export function getCompletedUnlockIDs(): UnlockID[] {
  return v.persistent.completedUnlockIDs;
}
