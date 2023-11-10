import type { PlayerType } from "isaac-typescript-definitions";
import {
  arrayRemoveInPlace,
  copyArray,
  getRandomArrayElementAndRemove,
  log,
  shuffleArray,
} from "isaacscript-common";
import { ALL_OBJECTIVE_IDS } from "./arrays/allObjectives";
import { ALL_UNLOCK_IDS } from "./arrays/allUnlocks";
import { UNLOCKABLE_CHARACTERS } from "./arrays/unlockableCharacters";
import { STARTING_CHARACTER } from "./constants";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import {
  STATIC_UNLOCKABLE_AREAS,
  UnlockableArea,
} from "./enums/UnlockableArea";
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
} as const;

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

  // Each character is guaranteed to unlock another character from a basic objective.
  const characterUnlockOrder = getRandomCharacterUnlockOrder(rng);

  // Some achievements are non-randomized, meaning that unlocks are paired to specific objectives.
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

  // Statically assign the non-randomized unlocks that come before any other ones. This way, they
  // will not ever be swapped with a character unlock.

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
