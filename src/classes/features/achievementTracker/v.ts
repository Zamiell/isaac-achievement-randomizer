import type {
  CardType,
  CollectibleType,
  PillEffect,
  PlayerType,
  TrinketType,
} from "isaac-typescript-definitions";
import { RandomizerMode } from "../../../enums/RandomizerMode";
import { UnlockType } from "../../../enums/UnlockType";
import type { Achievement } from "../../../types/Achievement";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import { getUnlock, getUnlockFromID } from "../../../types/Unlock";
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

    completedObjectiveIDs: new Set<ObjectiveID>(),
    completedUnlockIDs: new Set<UnlockID>(),
    completedUnlockIDsForRun: new Set<UnlockID>(),
    uncompletedUnlockIDs: new Set<UnlockID>(),
    achievementHistory: [] as Array<readonly [int, Achievement]>,
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

export function getAchievementHistory(): Readonly<
  Array<readonly [int, Achievement]>
> {
  return v.persistent.achievementHistory;
}

export function getNumCompletedObjectives(): int {
  return v.persistent.completedObjectiveIDs.size;
}

/**
 * Since some collectibles are banned, it is possible that some collectible types can never be
 * unlocked in the current randomizer playthrough.
 */
export function isCollectibleTypeInPlaythrough(
  collectibleType: CollectibleType,
): boolean {
  const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

  return objectiveID !== undefined;
}

export function getNumCollectibleTypesInPlaythrough(): int {
  let numCollectibleTypesInPlaythrough = 0;

  for (const unlockID of v.persistent.objectiveIDToUnlockIDMap.values()) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type === UnlockType.COLLECTIBLE) {
      numCollectibleTypesInPlaythrough++;
    }
  }

  return numCollectibleTypesInPlaythrough;
}

/**
 * Since some trinkets are banned, it is possible that some trinket types can never be unlocked in
 * the current randomizer playthrough.
 */
export function isTrinketTypeInPlaythrough(trinketType: TrinketType): boolean {
  const unlock = getUnlock(UnlockType.TRINKET, trinketType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

  return objectiveID !== undefined;
}

export function getNumTrinketTypesInPlaythrough(): int {
  let numTrinketTypesInPlaythrough = 0;

  for (const unlockID of v.persistent.objectiveIDToUnlockIDMap.values()) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type === UnlockType.TRINKET) {
      numTrinketTypesInPlaythrough++;
    }
  }

  return numTrinketTypesInPlaythrough;
}

/**
 * Since some cards are banned, it is possible that some card types can never be unlocked in the
 * current randomizer playthrough.
 */
export function isCardTypeInPlaythrough(cardType: CardType): boolean {
  const unlock = getUnlock(UnlockType.CARD, cardType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

  return objectiveID !== undefined;
}

/** No pill effects are currently banned, but this function is used to keep the code consistent. */
export function isPillEffectInPlaythrough(pillEffect: PillEffect): boolean {
  const unlock = getUnlock(UnlockType.PILL_EFFECT, pillEffect);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

  return objectiveID !== undefined;
}
