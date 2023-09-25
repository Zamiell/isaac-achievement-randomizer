import { CardType, Challenge, PlayerType } from "isaac-typescript-definitions";
import {
  DefaultMap,
  MAIN_CHARACTERS,
  VANILLA_CARD_TYPES,
  VANILLA_TRINKET_TYPES,
  getEnumValues,
  newRNG,
} from "isaacscript-common";
import { AchievementType } from "./enums/AchievementType";
import type { CharacterObjective } from "./enums/CharacterObjective";
import { UnlockablePath } from "./enums/UnlockablePath";
import type { Achievement } from "./types/Achievement";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";

interface Achievements {
  characterAchievements: CharacterAchievements;
  challengeAchievements: ChallengeAchievements;
}

type CharacterAchievements = DefaultMap<
  PlayerType,
  Map<CharacterObjective, Achievement>
>;

type ChallengeAchievements = Map<Challenge, Achievement>;

const ACHIEVEMENT_TYPES: readonly AchievementType[] =
  getEnumValues(AchievementType);

const UNLOCKABLE_PATHS: readonly UnlockablePath[] =
  getEnumValues(UnlockablePath);

const CHALLENGES: readonly Challenge[] = getEnumValues(Challenge);

export function getAchievementsForSeed(seed: Seed): Achievements {
  const _rng = newRNG(seed);

  const characterAchievements = new DefaultMap<
    PlayerType,
    Map<CharacterObjective, Achievement>
  >(() => new Map());

  const challengeAchievements = new Map<Challenge, Achievement>();

  // Pick some achievements first.
  // TODO

  // Pick the rest of the achievements.
  // TODO

  return { characterAchievements, challengeAchievements };
}

function _getAllAchievements(): Achievement[] {
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
        break;
      }

      case AchievementType.PILL: {
        break;
      }

      case AchievementType.HEART: {
        break;
      }

      case AchievementType.COIN: {
        break;
      }

      case AchievementType.BOMB: {
        break;
      }

      case AchievementType.KEY: {
        break;
      }

      case AchievementType.BATTERY: {
        break;
      }

      case AchievementType.SACK: {
        break;
      }

      case AchievementType.CHEST: {
        break;
      }
    }
  }

  return [];
}
