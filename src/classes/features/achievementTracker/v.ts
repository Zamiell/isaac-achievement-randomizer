import type { PlayerType, TrinketType } from "isaac-typescript-definitions";
import { assertDefined } from "isaacscript-common";
import { RandomizerMode } from "../../../enums/RandomizerMode";
import { UnlockType } from "../../../enums/UnlockType";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import { getUnlock } from "../../../types/Unlock";
import type { UnlockID } from "../../../types/UnlockID";
import { getUnlockID } from "../../../types/UnlockID";

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
    characterUnlockOrder: [] as readonly PlayerType[],

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

export function getCharacterUnlockOrder(): readonly PlayerType[] {
  return v.persistent.characterUnlockOrder;
}

export function getSecondCharacter(): PlayerType {
  const secondCharacter = v.persistent.characterUnlockOrder[1];
  assertDefined(
    secondCharacter,
    "Failed to find the second character in the current playthrough's character order.",
  );

  return secondCharacter;
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

/**
 * Since trinket unlocks are assigned last, it is possible that some trinket types can never be
 * unlocked in the current randomizer playthrough.
 */
export function isTrinketTypeInPlaythrough(trinketType: TrinketType): boolean {
  const unlock = getUnlock(UnlockType.TRINKET, trinketType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

  return objectiveID !== undefined;
}
