import { VANILLA_PILL_EFFECTS } from "isaacscript-common";
import {
  ACHIEVEMENT_TYPES,
  ALT_FLOORS,
  OTHER_ACHIEVEMENT_KINDS,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import { AchievementType } from "./enums/AchievementType";
import type { Achievement } from "./types/Achievement";
import { UNLOCKABLE_CARD_TYPES } from "./unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "./unlockableChallenges";
import { UNLOCKABLE_CHARACTERS } from "./unlockableCharacters";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "./unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_KEY_SUB_TYPES,
} from "./unlockablePickupTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "./unlockableSlotVariants";
import { UNLOCKABLE_TRINKET_TYPES } from "./unlockableTrinketTypes";

export const ALL_ACHIEVEMENTS: readonly Achievement[] = (() => {
  const achievements: Achievement[] = [];

  for (const achievementType of ACHIEVEMENT_TYPES) {
    switch (achievementType) {
      case AchievementType.CHARACTER: {
        for (const character of UNLOCKABLE_CHARACTERS) {
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

      case AchievementType.ALT_FLOOR: {
        for (const altFloor of ALT_FLOORS) {
          const achievement: Achievement = {
            type: AchievementType.ALT_FLOOR,
            altFloor,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHALLENGE: {
        for (const challenge of UNLOCKABLE_CHALLENGES) {
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
        for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.TRINKET,
            trinketType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CARD: {
        for (const cardType of UNLOCKABLE_CARD_TYPES) {
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

      case AchievementType.HEART: {
        for (const heartSubType of UNLOCKABLE_HEART_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.HEART,
            heartSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.COIN: {
        for (const coinSubType of UNLOCKABLE_COIN_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.COIN,
            coinSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BOMB: {
        for (const bombSubType of UNLOCKABLE_BOMB_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.BOMB,
            bombSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.KEY: {
        for (const keySubType of UNLOCKABLE_KEY_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.KEY,
            keySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BATTERY: {
        for (const batterySubType of UNLOCKABLE_BATTERY_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.BATTERY,
            batterySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.SACK: {
        for (const sackSubType of UNLOCKABLE_SACK_KEY_SUB_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.SACK,
            sackSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHEST: {
        for (const pickupVariant of UNLOCKABLE_CHEST_PICKUP_VARIANTS) {
          const achievement: Achievement = {
            type: AchievementType.CHEST,
            pickupVariant,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.SLOT: {
        for (const slotVariant of UNLOCKABLE_SLOT_VARIANTS) {
          const achievement: Achievement = {
            type: AchievementType.SLOT,
            slotVariant,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.GRID_ENTITY: {
        for (const gridEntityType of UNLOCKABLE_GRID_ENTITY_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.GRID_ENTITY,
            gridEntityType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.OTHER: {
        for (const otherAchievementKind of OTHER_ACHIEVEMENT_KINDS) {
          const achievement: Achievement = {
            type: AchievementType.OTHER,
            kind: otherAchievementKind,
          };
          achievements.push(achievement);
        }

        break;
      }
    }
  }

  return achievements;
})();
