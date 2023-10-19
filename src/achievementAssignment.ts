import { PlayerType } from "isaac-typescript-definitions";
import {
  ReadonlySet,
  arrayRemoveIndexInPlace,
  assertDefined,
  copyArray,
  getRandomArrayElement,
  getRandomArrayElementAndRemove,
  shuffleArray,
} from "isaacscript-common";
import { ALL_OBJECTIVES } from "./arrays/objectives";
import { UNLOCKABLE_CHARACTERS } from "./arrays/unlockableCharacters";
import { getAllUnlocks } from "./arrays/unlocks";
import { isNightmareMode } from "./classes/features/achievementTracker/v";
import { STARTING_CHARACTER } from "./constants";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import { UnlockablePath } from "./enums/UnlockablePath";
import type { CharacterObjective, Objective } from "./types/Objective";
import { getObjective, getObjectiveText } from "./types/Objective";
import type { ObjectiveID } from "./types/ObjectiveID";
import { getObjectiveID } from "./types/ObjectiveID";
import type { Unlock } from "./types/Unlock";
import { getUnlock, getUnlockText } from "./types/Unlock";

/** These are the objectives that The Polaroid and The Negative are gated behind. */
const EASY_OBJECTIVE_KINDS = [
  CharacterObjectiveKind.MOM,
  CharacterObjectiveKind.IT_LIVES,
  CharacterObjectiveKind.ISAAC,
  CharacterObjectiveKind.SATAN,
  CharacterObjectiveKind.NO_HIT_BASEMENT_1,
  CharacterObjectiveKind.NO_HIT_BASEMENT_2,
  CharacterObjectiveKind.NO_HIT_CAVES_1,
  CharacterObjectiveKind.NO_HIT_CAVES_2,
  CharacterObjectiveKind.NO_HIT_DEPTHS_1,
  CharacterObjectiveKind.NO_HIT_DEPTHS_2,
] as const;

/** These are the unlockable paths that are gated behind `EASY_OBJECTIVE_KINDS`. */
const EASY_UNLOCKABLE_PATHS = [
  UnlockablePath.CHEST,
  UnlockablePath.DARK_ROOM,
] as const;

/**
 * These consist of objectives that are from:
 * 1) beating bosses
 * 2) not gated behind an unlockable path (with the exception of The Chest / Dark Room, since those
 *    are behind easy Isaac objectives)
 */
const BASIC_CHARACTER_OBJECTIVES = new ReadonlySet<CharacterObjectiveKind>([
  CharacterObjectiveKind.MOM,
  CharacterObjectiveKind.IT_LIVES,
  CharacterObjectiveKind.ISAAC,
  CharacterObjectiveKind.BLUE_BABY,
  CharacterObjectiveKind.SATAN,
  CharacterObjectiveKind.LAMB,
]);

/** These are characters that are guaranteed to not be unlocked early on. */
const HARD_CHARACTERS = [
  PlayerType.LAZARUS_B, // 29
  PlayerType.LOST_B, // 31
] as const;

export function getAchievementsForRNG(rng: RNG): Map<ObjectiveID, Unlock> {
  // When an objective/unlock is assigned, it is added to the following map.
  const objectiveToUnlockMap = new Map<ObjectiveID, Unlock>();

  const nightmareMode = isNightmareMode();
  const allUnlocks = getAllUnlocks(nightmareMode);
  const unlocks = copyArray(allUnlocks);
  const objectives = copyArray(ALL_OBJECTIVES);

  // The Polaroid and The Negative are guaranteed to be unlocked via an easy objective for the
  // starting character.
  const easyObjectiveKinds = copyArray(EASY_OBJECTIVE_KINDS);
  for (const unlockablePath of EASY_UNLOCKABLE_PATHS) {
    const unlock = getUnlock(UnlockType.PATH, unlockablePath);
    removeUnlock(unlocks, unlock);

    const randomEasyObjectiveKind = getRandomArrayElementAndRemove(
      easyObjectiveKinds,
      rng,
    );
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      STARTING_CHARACTER,
      randomEasyObjectiveKind,
    );
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  const unlockableCharacters = getUnlockableCharacters(rng);

  // Each character is guaranteed to unlock another character from a basic objective.
  let lastUnlockedCharacter = STARTING_CHARACTER;
  for (const character of unlockableCharacters) {
    const unlock = getUnlock(UnlockType.CHARACTER, character);
    removeUnlock(unlocks, unlock);

    const lastCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        objective.character === lastUnlockedCharacter &&
        BASIC_CHARACTER_OBJECTIVES.has(objective.kind),
    ) as CharacterObjective[];
    const objective = getRandomArrayElement(lastCharacterObjectives, rng);
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);

    lastUnlockedCharacter = character;
  }

  // Now, do the rest of the unlocks with no restrictions.
  for (const unlock of unlocks) {
    const objective = getRandomArrayElementAndRemove(objectives, rng);
    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  return objectiveToUnlockMap;
}

/** Returns a shuffled array with certain character restrictions. */
function getUnlockableCharacters(rng: RNG): PlayerType[] {
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

function removeUnlock(unlocks: Unlock[], unlock: Unlock) {
  const index = getUnlockIndex(unlocks, unlock);
  const matchingUnlock = unlocks[index];
  assertDefined(matchingUnlock, `Failed to find the unlock at index: ${index}`);

  arrayRemoveIndexInPlace(unlocks, index);
}

function getUnlockIndex(unlocks: Unlock[], unlockToMatch: Unlock): int {
  let index: int;

  switch (unlockToMatch.type) {
    case UnlockType.PATH: {
      index = unlocks.findIndex(
        (unlock) =>
          unlock.type === unlockToMatch.type &&
          unlock.unlockablePath === unlockToMatch.unlockablePath,
      );
      break;
    }

    case UnlockType.CHARACTER: {
      index = unlocks.findIndex(
        (unlock) =>
          unlock.type === unlockToMatch.type &&
          unlock.character === unlockToMatch.character,
      );
      break;
    }

    default: {
      return error(
        `Unhandled matching logic for unlock type: ${
          UnlockType[unlockToMatch.type]
        }`,
      );
    }
  }

  if (index === -1) {
    const text = getUnlockText(unlockToMatch);
    error(`Failed to find the unlock in the array: ${text}`);
  }

  return index;
}

function removeObjective(objectives: Objective[], objective: Objective) {
  const index = getObjectiveIndex(objectives, objective);
  const matchingObjective = objectives[index];
  assertDefined(
    matchingObjective,
    `Failed to find the objective at index: ${index}`,
  );

  arrayRemoveIndexInPlace(objectives, index);
}

function getObjectiveIndex(
  objectives: Objective[],
  objectiveToMatch: Objective,
): int {
  let index: int;

  switch (objectiveToMatch.type) {
    case ObjectiveType.CHARACTER: {
      index = objectives.findIndex(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.character === objectiveToMatch.character &&
          objective.kind === objectiveToMatch.kind,
      );
      break;
    }

    default: {
      return error(
        `Unhandled matching logic for objective type: ${
          ObjectiveType[objectiveToMatch.type]
        }`,
      );
    }
  }

  if (index === -1) {
    const text = getObjectiveText(objectiveToMatch);
    error(`Failed to find the objective in the array: ${text}`);
  }

  return index;
}
