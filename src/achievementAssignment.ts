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
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { UNLOCKABLE_CHARACTERS } from "./arrays/unlockableCharacters";
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
import { getUnlockID } from "./types/UnlockID";

const POLAROID_NEGATIVE_UNLOCK_OBJECTIVE_KINDS = [
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
const CHARACTER_UNLOCK_OBJECTIVE_KINDS =
  new ReadonlySet<CharacterObjectiveKind>([
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

  const unlocks = copyArray(ALL_UNLOCKS);
  const objectives = copyArray(ALL_OBJECTIVES);

  // The Polaroid and The Negative are guaranteed to be unlocked via an easy objective for the
  // starting character.
  const easyObjectiveKinds = copyArray(
    POLAROID_NEGATIVE_UNLOCK_OBJECTIVE_KINDS,
  );
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

  // Each character is guaranteed to unlock another character from a basic objective.
  const unlockableCharacters = getShuffledUnlockableCharacters(rng);
  let lastUnlockedCharacter = STARTING_CHARACTER;
  for (const character of unlockableCharacters) {
    const unlock = getUnlock(UnlockType.CHARACTER, character);
    removeUnlock(unlocks, unlock);

    const lastCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        objective.character === lastUnlockedCharacter &&
        CHARACTER_UNLOCK_OBJECTIVE_KINDS.has(objective.kind),
    ) as CharacterObjective[];
    const objective = getRandomArrayElement(lastCharacterObjectives, rng);
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);

    lastUnlockedCharacter = character;
  }

  // Next, do all of the unlocks except for trinkets.
  for (const unlock of unlocks) {
    if (unlock.type === UnlockType.TRINKET) {
      continue;
    }

    const objective = getRandomArrayElementAndRemove(objectives, rng);
    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  // Finally, do the trinkets last, since they are the least important unlock, and there might not
  // be enough objectives to unlock everything.
  for (const unlock of unlocks) {
    if (unlock.type !== UnlockType.TRINKET) {
      continue;
    }

    // In some cases, the amount of unlocks may exceed the amount of objectives.
    if (objectives.length === 0) {
      break;
    }

    const objective = getRandomArrayElementAndRemove(objectives, rng);
    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  return objectiveToUnlockMap;
}

/** Returns a shuffled array with certain character restrictions. */
function getShuffledUnlockableCharacters(rng: RNG): PlayerType[] {
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
  if (index === undefined) {
    const text = getUnlockText(unlock);
    error(`Failed to find the unlock in the array: ${text}`);
  }

  const matchingUnlock = unlocks[index];
  assertDefined(matchingUnlock, `Failed to find the unlock at index: ${index}`);

  arrayRemoveIndexInPlace(unlocks, index);
}

function getUnlockIndex(
  unlocks: Unlock[],
  unlockToMatch: Unlock,
): int | undefined {
  const unlockToMatchID = getUnlockID(unlockToMatch);

  return unlocks.findIndex((unlock) => {
    const unlockID = getUnlockID(unlock);
    return unlockID === unlockToMatchID;
  });
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

    case ObjectiveType.BOSS: {
      index = objectives.findIndex(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.bossID === objectiveToMatch.bossID,
      );
      break;
    }

    case ObjectiveType.CHALLENGE: {
      index = objectives.findIndex(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.challenge === objectiveToMatch.challenge,
      );
      break;
    }
  }

  if (index === -1) {
    const text = getObjectiveText(objectiveToMatch);
    error(`Failed to find the objective in the array: ${text}`);
  }

  return index;
}
