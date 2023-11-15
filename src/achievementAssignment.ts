import type { PlayerType } from "isaac-typescript-definitions";
import { CollectibleType, Difficulty } from "isaac-typescript-definitions";
import {
  arrayRemoveInPlace,
  assertDefined,
  copyArray,
  getRandomArrayElementAndRemove,
  includes,
  log,
  shuffleArray,
} from "isaacscript-common";
import { ALL_OBJECTIVE_IDS } from "./arrays/allObjectives";
import { ALL_UNLOCK_IDS } from "./arrays/allUnlocks";
import {
  HARD_CHARACTERS,
  UNLOCKABLE_CHARACTERS,
} from "./arrays/unlockableCharacters";
import { CORE_STAT_COLLECTIBLES } from "./arrays/unlockableCollectibleTypes";
import { isHardcoreMode } from "./classes/features/achievementTracker/v";
import {
  isCardTypeBannedForNewPlaythrough,
  isCollectibleTypeBannedForNewPlaythrough,
  isTrinketTypeBannedForNewPlaythrough,
} from "./config";
import { DEBUG, STARTING_CHARACTER } from "./constants";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import {
  STATIC_UNLOCKABLE_AREAS,
  UnlockableArea,
} from "./enums/UnlockableArea";
import type { Objective } from "./types/Objective";
import { getObjective } from "./types/Objective";
import type { ObjectiveID } from "./types/ObjectiveID";
import { getObjectiveID } from "./types/ObjectiveID";
import type { Unlock } from "./types/Unlock";
import { getUnlock, getUnlockFromID, getUnlockText } from "./types/Unlock";
import type { UnlockID } from "./types/UnlockID";
import { getUnlockID } from "./types/UnlockID";

/** Some unlockable areas are always tied to the same static objective. */
const UNLOCKABLE_AREA_TO_OBJECTIVE = {
  [UnlockableArea.WOMB]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.MOM,
    Difficulty.NORMAL,
  ),

  [UnlockableArea.CATHEDRAL]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.IT_LIVES,
    Difficulty.NORMAL,
  ),

  [UnlockableArea.SHEOL]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.ISAAC,
    Difficulty.NORMAL,
  ),

  [UnlockableArea.CHEST]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.SATAN,
    Difficulty.NORMAL,
  ),

  [UnlockableArea.DARK_ROOM]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.BLUE_BABY,
    Difficulty.NORMAL,
  ),

  [UnlockableArea.REPENTANCE_FLOORS]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.LAMB,
    Difficulty.NORMAL,
  ),
} as const satisfies Record<
  (typeof STATIC_UNLOCKABLE_AREAS)[number],
  Objective
>;

const CORE_STAT_COLLECTIBLE_TO_OBJECTIVE = {
  // 27
  [CollectibleType.WOODEN_SPOON]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_BASEMENT,
    Difficulty.NORMAL,
  ),

  // 32
  [CollectibleType.WIRE_COAT_HANGER]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_BASEMENT,
    Difficulty.NORMAL,
  ),

  // 165
  [CollectibleType.CAT_O_NINE_TAILS]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_CAVES,
    Difficulty.NORMAL,
  ),
} as const satisfies Record<(typeof CORE_STAT_COLLECTIBLES)[number], Objective>;

export function getAchievementsForRNG(rng: RNG): {
  objectiveIDToUnlockIDMap: Map<ObjectiveID, UnlockID>;
  unlockIDToObjectiveIDMap: Map<UnlockID, ObjectiveID>;
  characterUnlockOrder: readonly PlayerType[];
} {
  // When an objective/unlock is assigned, it is added to the following maps.
  const objectiveIDToUnlockIDMap = new Map<ObjectiveID, UnlockID>();
  const unlockIDToObjectiveIDMap = new Map<UnlockID, ObjectiveID>();

  const unlockIDs = copyArray(ALL_UNLOCK_IDS);
  const objectiveIDs = copyArray(ALL_OBJECTIVE_IDS);

  const characterUnlockOrder = getRandomCharacterUnlockOrder(rng);

  // We want the three basic stat up collectibles to not ever be swapped with some other important
  // unlock, so we statically assign them to specific objectives.
  if (isHardcoreMode()) {
    for (const collectibleType of CORE_STAT_COLLECTIBLES) {
      const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
      const unlockID = getUnlockID(unlock);
      arrayRemoveInPlace(unlockIDs, unlockID);

      const objective = CORE_STAT_COLLECTIBLE_TO_OBJECTIVE[collectibleType];
      const objectiveID = getObjectiveID(objective);
      arrayRemoveInPlace(objectiveIDs, objectiveID);

      objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
      unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
    }
  }

  // Some areas are non-randomized, meaning that they are paired to specific objectives.
  for (const unlockableArea of STATIC_UNLOCKABLE_AREAS) {
    const unlock = getUnlock(UnlockType.AREA, unlockableArea);
    const unlockID = getUnlockID(unlock);
    arrayRemoveInPlace(unlockIDs, unlockID);

    const objective = getObjectiveFromUnlockableArea(
      unlockableArea,
      characterUnlockOrder,
    );
    const objectiveID = getObjectiveID(objective);
    arrayRemoveInPlace(objectiveIDs, objectiveID);

    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
  }

  // Each character is guaranteed to unlock from beating It Lives.
  let lastUnlockedCharacter = STARTING_CHARACTER;
  for (const character of characterUnlockOrder) {
    const unlock = getUnlock(UnlockType.CHARACTER, character);
    const unlockID = getUnlockID(unlock);
    arrayRemoveInPlace(unlockIDs, unlockID);

    const objective = getObjective(
      ObjectiveType.CHARACTER,
      lastUnlockedCharacter,
      CharacterObjectiveKind.IT_LIVES,
      Difficulty.NORMAL,
    );
    const objectiveID = getObjectiveID(objective);
    arrayRemoveInPlace(objectiveIDs, objectiveID);

    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);

    lastUnlockedCharacter = character;
  }

  // Next, do all of the unlocks except for trinkets.
  for (const unlockID of unlockIDs) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type !== UnlockType.TRINKET) {
      // Core stat collectibles start out unlocked in casual mode.
      if (
        !isHardcoreMode() &&
        unlock.type === UnlockType.COLLECTIBLE &&
        includes(CORE_STAT_COLLECTIBLES, unlock.collectibleType)
      ) {
        continue;
      }

      if (isBannedUnlock(unlock)) {
        continue;
      }

      const objectiveID = getRandomArrayElementAndRemove(objectiveIDs, rng);
      objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
      unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
    }
  }

  // Finally, do the trinkets last, since they are the least important unlock, and there might not
  // be enough objectives to unlock everything.
  for (const unlockID of unlockIDs) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type === UnlockType.TRINKET) {
      if (isBannedUnlock(unlock)) {
        continue;
      }

      // In some cases, the amount of unlocks may exceed the amount of objectives.
      if (objectiveIDs.length === 0) {
        if (DEBUG) {
          const unlockText = getUnlockText(unlock).join(" - ");
          log(`Skipping assignment of unlock: ${unlockText}`);
        }

        continue;
      }

      const objectiveID = getRandomArrayElementAndRemove(objectiveIDs, rng);
      objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
      unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
    }
  }

  return {
    objectiveIDToUnlockIDMap,
    unlockIDToObjectiveIDMap,
    characterUnlockOrder,
  };
}

/** Returns a shuffled array with certain character restrictions. */
function getRandomCharacterUnlockOrder(rng: RNG): readonly PlayerType[] {
  let unlockableCharacters = copyArray(UNLOCKABLE_CHARACTERS);

  do {
    unlockableCharacters = shuffleArray(unlockableCharacters, rng);
  } while (!isValidUnlockableCharacterOrder(unlockableCharacters));

  return unlockableCharacters;
}

function isValidUnlockableCharacterOrder(characters: PlayerType[]): boolean {
  return HARD_CHARACTERS.every((character) =>
    inSecondHalfOfArray(character, characters),
  );
}

function inSecondHalfOfArray<T>(element: T, array: T[]): boolean {
  const index = array.indexOf(element);
  if (index === -1) {
    return false;
  }

  return index > (array.length - 1) / 2;
}

function getObjectiveFromUnlockableArea(
  unlockableArea: (typeof STATIC_UNLOCKABLE_AREAS)[number],
  characterUnlockOrder: readonly PlayerType[],
): Readonly<Objective> {
  if (unlockableArea === UnlockableArea.CATHEDRAL) {
    const finalCharacter = characterUnlockOrder.at(-1);
    assertDefined(
      finalCharacter,
      "Failed to get the final character of the character unlock order.",
    );
    return getObjective(
      ObjectiveType.CHARACTER,
      finalCharacter,
      CharacterObjectiveKind.IT_LIVES,
      Difficulty.NORMAL,
    );
  }

  return UNLOCKABLE_AREA_TO_OBJECTIVE[unlockableArea];
}

function isBannedUnlock(unlock: Unlock): boolean {
  switch (unlock.type) {
    case UnlockType.COLLECTIBLE: {
      return isCollectibleTypeBannedForNewPlaythrough(unlock.collectibleType);
    }

    case UnlockType.TRINKET: {
      return isTrinketTypeBannedForNewPlaythrough(unlock.trinketType);
    }

    case UnlockType.CARD: {
      return isCardTypeBannedForNewPlaythrough(unlock.cardType);
    }

    default: {
      return false;
    }
  }
}
