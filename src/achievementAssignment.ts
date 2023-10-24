import { CollectibleType, PlayerType } from "isaac-typescript-definitions";
import {
  ReadonlySet,
  arrayRemove,
  arrayRemoveIndexInPlace,
  assertDefined,
  copyArray,
  getRandomArrayElement,
  getRandomArrayElementAndRemove,
  log,
  shuffleArray,
} from "isaacscript-common";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { UNLOCKABLE_CHARACTERS } from "./arrays/unlockableCharacters";
import { FIRST_UNLOCK_COLLECTIBLES } from "./classes/features/achievementTracker/swapUnlock";
import { STARTING_CHARACTER } from "./constants";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import {
  STATIC_UNLOCKABLE_AREAS,
  UnlockableArea,
} from "./enums/UnlockableArea";
import type { CharacterObjective, Objective } from "./types/Objective";
import { getObjective, getObjectiveText } from "./types/Objective";
import type { ObjectiveID } from "./types/ObjectiveID";
import { getObjectiveID } from "./types/ObjectiveID";
import type { Unlock } from "./types/Unlock";
import { getUnlock, getUnlockText } from "./types/Unlock";
import { getUnlockID } from "./types/UnlockID";

/**
 * These consist of objectives that are from:
 * 1) beating bosses
 * 2) not gated behind a randomized unlockable area
 */
const CHARACTER_UNLOCK_OBJECTIVE_KINDS =
  new ReadonlySet<CharacterObjectiveKind>([
    CharacterObjectiveKind.MOM,
    CharacterObjectiveKind.IT_LIVES,
    CharacterObjectiveKind.ISAAC,
    CharacterObjectiveKind.BLUE_BABY,
    CharacterObjectiveKind.SATAN,
    CharacterObjectiveKind.LAMB,
    CharacterObjectiveKind.MOTHER,
  ]);

/** These are characters that are guaranteed to not be unlocked early on. */
const HARD_CHARACTERS = [
  PlayerType.BLUE_BABY, // 4
  PlayerType.JUDAS_B, // 24
  PlayerType.BLUE_BABY_B, // 25
  PlayerType.LAZARUS_B, // 29
  PlayerType.LOST_B, // 31
  PlayerType.FORGOTTEN_B, // 35
  PlayerType.BETHANY_B, // 36
  PlayerType.JACOB_B, // 37
] as const;

export function getAchievementsForRNG(rng: RNG): {
  objectiveToUnlockMap: Map<ObjectiveID, Unlock>;
  characterUnlockOrder: readonly PlayerType[];
} {
  // When an objective/unlock is assigned, it is added to the following map.
  const objectiveToUnlockMap = new Map<ObjectiveID, Unlock>();

  const unlocks = copyArray(ALL_UNLOCKS);
  const objectives = copyArray(ALL_OBJECTIVES);

  // Some achievements are non-randomized, meaning that unlocks are paired to specific objectives.
  for (const unlockableArea of STATIC_UNLOCKABLE_AREAS) {
    const unlock = getUnlock(UnlockType.AREA, unlockableArea);
    removeUnlock(unlocks, unlock);

    const objective = getStaticObjective(unlockableArea);
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  // We want the three basic stat up collectibles to not ever be swapped with an important unlock
  // like a character unlock, so we statically assign them to specific objectives.
  for (const collectibleType of FIRST_UNLOCK_COLLECTIBLES) {
    const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
    removeUnlock(unlocks, unlock);

    const objective = getStaticObjective(collectibleType);
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  // Each character is guaranteed to unlock another character from a basic objective.
  const characterUnlockOrder = getRandomCharacterUnlockOrder(rng);

  let lastUnlockedCharacter = STARTING_CHARACTER;
  for (const character of characterUnlockOrder) {
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
      const unlockText = getUnlockText(unlock).join(" - ");
      log(`Skipping unlock: ${unlockText}`);
      continue;
    }

    const objective = getRandomArrayElementAndRemove(objectives, rng);
    const objectiveID = getObjectiveID(objective);
    objectiveToUnlockMap.set(objectiveID, unlock);
  }

  return {
    objectiveToUnlockMap,
    characterUnlockOrder,
  };
}

function getStaticObjective(
  unlockableArea:
    | (typeof STATIC_UNLOCKABLE_AREAS)[number]
    | (typeof FIRST_UNLOCK_COLLECTIBLES)[number],
) {
  switch (unlockableArea) {
    case UnlockableArea.WOMB: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.MOM,
      );
    }

    case UnlockableArea.CATHEDRAL: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.IT_LIVES,
      );
    }

    case UnlockableArea.SHEOL: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.ISAAC,
      );
    }

    case UnlockableArea.CHEST: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.SATAN,
      );
    }

    case UnlockableArea.DARK_ROOM: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.BLUE_BABY,
      );
    }

    case UnlockableArea.REPENTANCE_FLOORS: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.LAMB,
      );
    }

    // 27
    case CollectibleType.WOODEN_SPOON: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.NO_HIT_BASEMENT_1,
      );
    }

    // 32
    case CollectibleType.WIRE_COAT_HANGER: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.NO_HIT_BASEMENT_2,
      );
    }

    // 165
    case CollectibleType.CAT_O_NINE_TAILS: {
      return getObjective(
        ObjectiveType.CHARACTER,
        STARTING_CHARACTER,
        CharacterObjectiveKind.NO_HIT_CAVES_1,
      );
    }
  }
}

/** Returns a shuffled array with certain character restrictions. */
function getRandomCharacterUnlockOrder(rng: RNG): readonly PlayerType[] {
  let unlockableCharacters = copyArray(UNLOCKABLE_CHARACTERS);

  do {
    unlockableCharacters = shuffleArray(unlockableCharacters, rng);
  } while (!isValidUnlockableCharacterOrder(unlockableCharacters));

  // Tainted Cain is guaranteed to be the final character, since Bag of Crafting is not affected by
  // collectible unlocks.
  unlockableCharacters = arrayRemove(unlockableCharacters, PlayerType.CAIN_B);
  unlockableCharacters.push(PlayerType.CAIN_B);

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
