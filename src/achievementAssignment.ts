// Randomizer algorithms are discussed here:
// https://www.youtube.com/watch?v=vGIDzGvsrV8
// We use "Random Fill" for this randomizer.

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
import { ALL_ACHIEVEMENTS } from "./achievements";
import { AchievementType } from "./enums/AchievementType";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockablePath } from "./enums/UnlockablePath";
import { ALL_OBJECTIVES } from "./objectives";
import type { Achievement } from "./types/Achievement";
import { getAchievement, getAchievementText } from "./types/Achievement";
import type { CharacterObjective, Objective } from "./types/Objective";
import { getObjective, getObjectiveText } from "./types/Objective";
import type { ObjectiveID } from "./types/ObjectiveID";
import { getObjectiveID } from "./types/ObjectiveID";
import { UNLOCKABLE_CHARACTERS } from "./unlockableCharacters";

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
  CharacterObjectiveKind.NO_HIT_WOMB_1,
  CharacterObjectiveKind.NO_HIT_WOMB_2,
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

export function getAchievementsForRNG(rng: RNG): Map<ObjectiveID, Achievement> {
  // When an achievement/objective is assigned, it is added to the following map.
  const objectiveToAchievementMap = new Map<ObjectiveID, Achievement>();

  const achievements = copyArray(ALL_ACHIEVEMENTS);
  const objectives = copyArray(ALL_OBJECTIVES);

  // The Polaroid and The Negative are guaranteed to be unlocked via an easy objective for Isaac.
  const easyObjectiveKinds = copyArray(EASY_OBJECTIVE_KINDS);
  for (const unlockablePath of EASY_UNLOCKABLE_PATHS) {
    const achievement = getAchievement(AchievementType.PATH, unlockablePath);
    removeAchievement(achievements, achievement);

    const randomEasyObjectiveKind = getRandomArrayElementAndRemove(
      easyObjectiveKinds,
      rng,
    );
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      randomEasyObjectiveKind,
    );
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToAchievementMap.set(objectiveID, achievement);
  }

  // Each character is guaranteed to unlock another character from a basic objective.
  let lastUnlockedCharacter = PlayerType.ISAAC;
  const unlockableCharacters = shuffleArray(UNLOCKABLE_CHARACTERS, rng);
  for (const character of unlockableCharacters) {
    const achievement = getAchievement(AchievementType.CHARACTER, character);
    removeAchievement(achievements, achievement);

    const lastCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        objective.character === lastUnlockedCharacter &&
        BASIC_CHARACTER_OBJECTIVES.has(objective.kind),
    ) as CharacterObjective[];
    const objective = getRandomArrayElement(lastCharacterObjectives, rng);
    removeObjective(objectives, objective);

    const objectiveID = getObjectiveID(objective);
    objectiveToAchievementMap.set(objectiveID, achievement);

    lastUnlockedCharacter = character;
  }

  // Now, do the rest of the unlocks with no restrictions.
  for (const achievement of achievements) {
    const objective = getRandomArrayElementAndRemove(objectives, rng);
    const objectiveID = getObjectiveID(objective);
    objectiveToAchievementMap.set(objectiveID, achievement);
  }

  return objectiveToAchievementMap;
}

function removeAchievement(
  achievements: Achievement[],
  achievement: Achievement,
) {
  const index = getAchievementIndex(achievements, achievement);
  const matchingAchievement = achievements[index];
  assertDefined(
    matchingAchievement,
    `Failed to find the achievement at index: ${index}`,
  );

  arrayRemoveIndexInPlace(achievements, index);
}

function getAchievementIndex(
  achievements: Achievement[],
  achievementToMatch: Achievement,
): int {
  let index: int;

  switch (achievementToMatch.type) {
    case AchievementType.PATH: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === achievementToMatch.type &&
          achievement.unlockablePath === achievementToMatch.unlockablePath,
      );
      break;
    }

    case AchievementType.CHARACTER: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === achievementToMatch.type &&
          achievement.character === achievementToMatch.character,
      );
      break;
    }

    default: {
      return error(
        `Unhandled matching logic for achievement type: ${
          AchievementType[achievementToMatch.type]
        }`,
      );
    }
  }

  if (index === -1) {
    const text = getAchievementText(achievementToMatch);
    error(`Failed to find the achievement in the array: ${text}`);
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
