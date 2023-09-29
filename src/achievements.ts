import {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PlayerType,
  SackSubType,
  SlotVariant,
} from "isaac-typescript-definitions";
import {
  CHEST_PICKUP_VARIANTS,
  MAIN_CHARACTERS,
  VANILLA_CARD_TYPES,
  VANILLA_PILL_EFFECTS,
} from "isaacscript-common";
import {
  ACHIEVEMENT_TYPES,
  ALT_FLOORS,
  BATTERY_SUB_TYPES,
  BOMB_SUB_TYPES,
  CHALLENGES,
  COIN_SUB_TYPES,
  HEART_SUB_TYPES,
  KEY_SUB_TYPES,
  OTHER_ACHIEVEMENT_KINDS,
  SACK_SUB_TYPES,
  SLOT_VARIANTS,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import { AchievementType } from "./enums/AchievementType";
import type { Achievement } from "./types/Achievement";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "./unlockableGridEntityTypes";
import { UNLOCKABLE_TRINKET_TYPES } from "./unlockableTrinketTypes";

export const ALL_ACHIEVEMENTS: readonly Achievement[] = (() => {
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
        for (const challenge of CHALLENGES) {
          if (challenge === Challenge.NULL) {
            continue;
          }

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

      case AchievementType.SLOT: {
        for (const slotVariant of SLOT_VARIANTS) {
          if (
            slotVariant === SlotVariant.DONATION_MACHINE ||
            slotVariant === SlotVariant.GREED_DONATION_MACHINE ||
            slotVariant === SlotVariant.ISAAC_SECRET
          ) {
            continue;
          }

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
