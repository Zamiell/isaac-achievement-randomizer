import type { Challenge } from "isaac-typescript-definitions";
import {
  BatterySubType,
  BombSubType,
  CardType,
  CoinSubType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PlayerType,
  SackSubType,
} from "isaac-typescript-definitions";
import {
  CHEST_PICKUP_VARIANTS,
  DefaultMap,
  MAIN_CHARACTERS,
  VANILLA_CARD_TYPES,
  VANILLA_PILL_EFFECTS,
  VANILLA_TRINKET_TYPES,
  arrayRemoveIndexInPlace,
  assertDefined,
  copyArray,
  getRandomArrayElement,
  getRandomArrayElementAndRemove,
  newRNG,
  shuffleArray,
} from "isaacscript-common";
import {
  ACHIEVEMENT_TYPES,
  BATTERY_SUB_TYPES,
  BOMB_SUB_TYPES,
  CHALLENGES,
  CHARACTER_OBJECTIVE_KINDS,
  COIN_SUB_TYPES,
  HEART_SUB_TYPES,
  KEY_SUB_TYPES,
  OBJECTIVE_TYPES,
  PILL_ACHIEVEMENT_KINDS,
  SACK_SUB_TYPES,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import { AchievementType } from "./enums/AchievementType";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockablePath } from "./enums/UnlockablePath";
import type { Achievement } from "./types/Achievement";
import type { CharacterObjective, Objective } from "./types/Objective";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";

interface Achievements {
  characterAchievements: CharacterAchievements;
  challengeAchievements: ChallengeAchievements;
}

type CharacterAchievements = DefaultMap<
  PlayerType,
  Map<CharacterObjectiveKind, Achievement>
>;

type ChallengeAchievements = Map<Challenge, Achievement>;

const EASY_OBJECTIVE_KINDS = [
  CharacterObjectiveKind.MOM,
  CharacterObjectiveKind.IT_LIVES,
  CharacterObjectiveKind.ISAAC,
  CharacterObjectiveKind.SATAN,
  CharacterObjectiveKind.NO_DAMAGE_BASEMENT_1,
  CharacterObjectiveKind.NO_DAMAGE_BASEMENT_2,
  CharacterObjectiveKind.NO_DAMAGE_CAVES_1,
  CharacterObjectiveKind.NO_DAMAGE_CAVES_2,
  CharacterObjectiveKind.NO_DAMAGE_DEPTHS_1,
  CharacterObjectiveKind.NO_DAMAGE_DEPTHS_2,
  CharacterObjectiveKind.NO_DAMAGE_WOMB_1,
  CharacterObjectiveKind.NO_DAMAGE_WOMB_2,
] as const;

const EASY_UNLOCKABLE_PATHS = [
  UnlockablePath.THE_CHEST,
  UnlockablePath.DARK_ROOM,
] as const;

export function getAchievementsForSeed(seed: Seed): Achievements {
  const rng = newRNG(seed);

  const characterAchievements = new DefaultMap<
    PlayerType,
    Map<CharacterObjectiveKind, Achievement>
  >(() => new Map());
  const challengeAchievements = new Map<Challenge, Achievement>();

  const achievements = getAllAchievements();
  const objectives = getAllObjectives();

  if (achievements.length !== objectives.length) {
    error(
      `There were ${achievements.length} achievements and ${objectives.length} objectives. These must exactly match.`,
    );
  }

  // The Polaroid and The Negative are guaranteed to be unlocked via an easy objective for Isaac.
  const easyObjectiveKinds = copyArray(EASY_OBJECTIVE_KINDS);
  for (const unlockablePath of EASY_UNLOCKABLE_PATHS) {
    const achievement = getAndRemoveAchievement(
      achievements,
      AchievementType.PATH,
      unlockablePath,
    );
    const randomEasyObjectiveKind = getRandomArrayElementAndRemove(
      easyObjectiveKinds,
      rng,
    );
    getAndRemoveCharacterObjective(
      objectives,
      PlayerType.ISAAC,
      randomEasyObjectiveKind,
    );
    const isaacAchievements = characterAchievements.getAndSetDefault(
      PlayerType.ISAAC,
    );
    isaacAchievements.set(randomEasyObjectiveKind, achievement);
  }

  // Each character is guaranteed to unlock another character.
  let lastUnlockedCharacter = PlayerType.ISAAC;
  const mainCharacters = shuffleArray(MAIN_CHARACTERS, rng);
  for (const character of mainCharacters) {
    if (character === PlayerType.ISAAC) {
      continue;
    }

    const achievement = getAndRemoveAchievement(
      achievements,
      AchievementType.CHARACTER,
      character,
    );
    const lastCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        objective.character === lastUnlockedCharacter,
    ) as CharacterObjective[];
    const randomCharacterObjective = getRandomArrayElement(
      lastCharacterObjectives,
      rng,
    );
    getAndRemoveCharacterObjective(
      objectives,
      character,
      randomCharacterObjective.kind,
    );
    const lastCharacterAchievements = characterAchievements.getAndSetDefault(
      lastUnlockedCharacter,
    );
    lastCharacterAchievements.set(randomCharacterObjective.kind, achievement);

    lastUnlockedCharacter = character;
  }

  // Pick the rest of the achievements.
  /*
  Isaac.DebugString(
    `GETTING HERE - ${objectives.length} + ${achievements.length}`,
  );
  error("LOL");
  */

  return { characterAchievements, challengeAchievements };
}

function getAllAchievements(): Achievement[] {
  const achievements: Achievement[] = [];

  for (const achievementType of ACHIEVEMENT_TYPES) {
    switch (achievementType) {
      case AchievementType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          if (character === PlayerType.ISAAC) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CHARACTER,
            character,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PATH: {
        for (const unlockablePath of UNLOCKABLE_PATHS) {
          const achievement: Achievement = {
            type: AchievementType.PATH,
            unlockablePath,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHALLENGE: {
        for (const challenge of CHALLENGES) {
          const achievement: Achievement = {
            type: AchievementType.CHALLENGE,
            challenge,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.COLLECTIBLE: {
        for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.COLLECTIBLE,
            collectibleType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.TRINKET: {
        for (const trinketType of VANILLA_TRINKET_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.TRINKET,
            trinketType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CARD: {
        for (const cardType of VANILLA_CARD_TYPES) {
          if (cardType === CardType.RUNE_SHARD) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CARD,
            cardType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PILL_EFFECT: {
        for (const pillEffect of VANILLA_PILL_EFFECTS) {
          const achievement: Achievement = {
            type: AchievementType.PILL_EFFECT,
            pillEffect,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PILL: {
        for (const pillAchievementKind of PILL_ACHIEVEMENT_KINDS) {
          const achievement: Achievement = {
            type: AchievementType.PILL,
            kind: pillAchievementKind,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.HEART: {
        for (const heartSubType of HEART_SUB_TYPES) {
          if (
            heartSubType === HeartSubType.NULL || // 0
            heartSubType === HeartSubType.HALF // 2
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.HEART,
            heartSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.COIN: {
        for (const coinSubType of COIN_SUB_TYPES) {
          if (
            coinSubType === CoinSubType.NULL || // 0
            coinSubType === CoinSubType.PENNY // 1
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.COIN,
            coinSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BOMB: {
        for (const bombSubType of BOMB_SUB_TYPES) {
          if (
            bombSubType === BombSubType.NULL || // 0
            bombSubType === BombSubType.NORMAL || // 1
            bombSubType === BombSubType.TROLL || // 3
            bombSubType === BombSubType.MEGA_TROLL || // 5
            bombSubType === BombSubType.GOLDEN_TROLL || // 6
            bombSubType === BombSubType.GIGA // 7
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.BOMB,
            bombSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.KEY: {
        for (const keySubType of KEY_SUB_TYPES) {
          if (
            keySubType === KeySubType.NULL || // 0
            keySubType === KeySubType.NORMAL // 1
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.KEY,
            keySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BATTERY: {
        for (const batterySubType of BATTERY_SUB_TYPES) {
          if (
            batterySubType === BatterySubType.NULL // 0
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.BATTERY,
            batterySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.SACK: {
        for (const sackSubType of SACK_SUB_TYPES) {
          if (
            sackSubType === SackSubType.NULL // 0
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.SACK,
            sackSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHEST: {
        for (const pickupVariant of CHEST_PICKUP_VARIANTS) {
          if (
            pickupVariant === PickupVariant.CHEST || // 50
            pickupVariant === PickupVariant.OLD_CHEST || // 55
            pickupVariant === PickupVariant.MOMS_CHEST // 390
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CHEST,
            pickupVariant,
          };
          achievements.push(achievement);
        }

        break;
      }
    }
  }

  return achievements;
}

function getAllObjectives(): Objective[] {
  const objectives: Objective[] = [];

  for (const objectiveType of OBJECTIVE_TYPES) {
    switch (objectiveType) {
      case ObjectiveType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          if (character === PlayerType.ISAAC) {
            continue;
          }

          for (const characterObjectiveKind of CHARACTER_OBJECTIVE_KINDS) {
            const objective: Objective = {
              type: ObjectiveType.CHARACTER,
              character,
              kind: characterObjectiveKind,
            };
            objectives.push(objective);
          }
        }

        break;
      }

      case ObjectiveType.CHALLENGE: {
        for (const challenge of CHALLENGES) {
          const objective: Objective = {
            type: ObjectiveType.CHALLENGE,
            challenge,
          };
          objectives.push(objective);
        }

        break;
      }
    }
  }

  return objectives;
}

function getAndRemoveAchievement(
  achievements: Achievement[],
  type: AchievementType,
  kind: int,
): Achievement {
  const index = getAchievementIndexMatchingType(achievements, type, kind);
  const achievement = achievements[index];
  assertDefined(
    achievement,
    `Failed to find the achievement at index: ${index}`,
  );

  arrayRemoveIndexInPlace(achievements, index);

  return achievement;
}

function getAchievementIndexMatchingType(
  achievements: Achievement[],
  type: AchievementType,
  kind: int,
): int {
  let index: int;

  switch (type) {
    case AchievementType.PATH: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === AchievementType.PATH &&
          achievement.unlockablePath === kind,
      );
      break;
    }

    default: {
      return error(
        `Unhandled matching logic for achievement type: ${AchievementType[type]}`,
      );
    }
  }

  if (index === -1) {
    error(
      `Failed to find achievement of type ${AchievementType[type]}: ${kind}`,
    );
  }

  return index;
}

function getAndRemoveCharacterObjective(
  objectives: Objective[],
  character: PlayerType,
  kind: CharacterObjectiveKind,
): Objective {
  const index = objectives.findIndex(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character &&
      objective.kind === kind,
  );
  const objective = objectives[index];
  assertDefined(objective, `Failed to find the objective at index: ${index}`);

  arrayRemoveIndexInPlace(objectives, index);

  return objective;
}
