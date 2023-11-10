import type { PlayerType } from "isaac-typescript-definitions";
import { CollectibleType } from "isaac-typescript-definitions";
import {
  arrayRemoveInPlace,
  copyArray,
  getRandomArrayElementAndRemove,
  log,
  shuffleArray,
} from "isaacscript-common";
import { ALL_OBJECTIVE_IDS } from "./arrays/allObjectives";
import { ALL_UNLOCK_IDS } from "./arrays/allUnlocks";
import {
  HARD_CHARACTERS,
  UNLOCKABLE_CHARACTERS,
} from "./arrays/unlockableCharacters";
import { FIRST_UNLOCK_COLLECTIBLES } from "./classes/features/achievementTracker/swapUnlock";
import { STARTING_CHARACTER } from "./constants";
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
import { getUnlock, getUnlockFromID, getUnlockText } from "./types/Unlock";
import type { UnlockID } from "./types/UnlockID";
import { getUnlockID } from "./types/UnlockID";

/** Some unlockable areas are always tied to the same static objective. */
const UNLOCKABLE_AREA_TO_OBJECTIVE = {
  [UnlockableArea.WOMB]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.MOM,
  ),

  [UnlockableArea.CATHEDRAL]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.IT_LIVES,
  ),

  [UnlockableArea.SHEOL]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.ISAAC,
  ),

  [UnlockableArea.CHEST]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.SATAN,
  ),

  [UnlockableArea.DARK_ROOM]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.BLUE_BABY,
  ),

  [UnlockableArea.REPENTANCE_FLOORS]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.LAMB,
  ),
} as const satisfies Record<
  (typeof STATIC_UNLOCKABLE_AREAS)[number],
  Objective
>;

const FIRST_UNLOCK_COLLECTIBLE_TO_OBJECTIVE = {
  // 27
  [CollectibleType.WOODEN_SPOON]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_BASEMENT_1,
  ),

  // 32
  [CollectibleType.WIRE_COAT_HANGER]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_BASEMENT_2,
  ),

  // 165
  [CollectibleType.CAT_O_NINE_TAILS]: getObjective(
    ObjectiveType.CHARACTER,
    STARTING_CHARACTER,
    CharacterObjectiveKind.NO_HIT_CAVES_1,
  ),
} as const satisfies Record<
  (typeof FIRST_UNLOCK_COLLECTIBLES)[number],
  Objective
>;

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
  for (const collectibleType of FIRST_UNLOCK_COLLECTIBLES) {
    const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
    const unlockID = getUnlockID(unlock);
    arrayRemoveInPlace(unlockIDs, unlockID);

    const objective = FIRST_UNLOCK_COLLECTIBLE_TO_OBJECTIVE[collectibleType];
    const objectiveID = getObjectiveID(objective);
    arrayRemoveInPlace(objectiveIDs, objectiveID);

    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
  }

  // Some areas are non-randomized, meaning that they are paired to specific objectives.
  for (const unlockableArea of STATIC_UNLOCKABLE_AREAS) {
    const unlock = getUnlock(UnlockType.AREA, unlockableArea);
    const unlockID = getUnlockID(unlock);
    arrayRemoveInPlace(unlockIDs, unlockID);

    const objective = UNLOCKABLE_AREA_TO_OBJECTIVE[unlockableArea];
    const objectiveID = getObjectiveID(objective);
    arrayRemoveInPlace(objectiveIDs, objectiveID);

    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
  }

  // The second character is unlocked immediately, so it is statically paired with the next no-hit
  // objective. The other characters are guaranteed to unlock from beating It Lives.
  let lastUnlockedCharacter = STARTING_CHARACTER;
  for (const character of characterUnlockOrder) {
    const unlock = getUnlock(UnlockType.CHARACTER, character);
    const unlockID = getUnlockID(unlock);
    arrayRemoveInPlace(unlockIDs, unlockID);

    const objective =
      lastUnlockedCharacter === STARTING_CHARACTER
        ? getObjective(
            ObjectiveType.CHARACTER,
            STARTING_CHARACTER,
            CharacterObjectiveKind.NO_HIT_CAVES_2,
          )
        : getObjective(
            ObjectiveType.CHARACTER,
            lastUnlockedCharacter,
            CharacterObjectiveKind.IT_LIVES,
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
    if (unlock.type === UnlockType.TRINKET) {
      continue;
    }

    const objectiveID = getRandomArrayElementAndRemove(objectiveIDs, rng);
    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
  }

  // Finally, do the trinkets last, since they are the least important unlock, and there might not
  // be enough objectives to unlock everything.
  for (const unlockID of unlockIDs) {
    // In some cases, the amount of unlocks may exceed the amount of objectives.
    if (objectiveIDs.length === 0) {
      const unlock = getUnlockFromID(unlockID);
      const unlockText = getUnlockText(unlock).join(" - ");
      log(`Skipping unlock: ${unlockText}`);
      continue;
    }

    const objectiveID = getRandomArrayElementAndRemove(objectiveIDs, rng);
    objectiveIDToUnlockIDMap.set(objectiveID, unlockID);
    unlockIDToObjectiveIDMap.set(unlockID, objectiveID);
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
