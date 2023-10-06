import { VANILLA_PILL_EFFECTS } from "isaacscript-common";
import {
  ALT_FLOORS,
  OTHER_UNLOCK_KINDS,
  UNLOCKABLE_PATHS,
  UNLOCK_TYPES,
} from "./cachedEnums";
import { UnlockType } from "./enums/UnlockType";
import type { Unlock } from "./types/Unlock";
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

export const ALL_ACHIEVEMENTS: readonly Unlock[] = (() => {
  const achievements: Unlock[] = [];

  for (const unlockType of UNLOCK_TYPES) {
    switch (unlockType) {
      case UnlockType.CHARACTER: {
        for (const character of UNLOCKABLE_CHARACTERS) {
          const achievement: Unlock = {
            type: UnlockType.CHARACTER,
            character,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.PATH: {
        for (const unlockablePath of UNLOCKABLE_PATHS) {
          const achievement: Unlock = {
            type: UnlockType.PATH,
            unlockablePath,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.ALT_FLOOR: {
        for (const altFloor of ALT_FLOORS) {
          const achievement: Unlock = {
            type: UnlockType.ALT_FLOOR,
            altFloor,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.CHALLENGE: {
        for (const challenge of UNLOCKABLE_CHALLENGES) {
          const achievement: Unlock = {
            type: UnlockType.CHALLENGE,
            challenge,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.COLLECTIBLE: {
        for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.COLLECTIBLE,
            collectibleType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.TRINKET: {
        for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.TRINKET,
            trinketType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.CARD: {
        for (const cardType of UNLOCKABLE_CARD_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.CARD,
            cardType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.PILL_EFFECT: {
        for (const pillEffect of VANILLA_PILL_EFFECTS) {
          const achievement: Unlock = {
            type: UnlockType.PILL_EFFECT,
            pillEffect,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.HEART: {
        for (const heartSubType of UNLOCKABLE_HEART_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.HEART,
            heartSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.COIN: {
        for (const coinSubType of UNLOCKABLE_COIN_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.COIN,
            coinSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.BOMB: {
        for (const bombSubType of UNLOCKABLE_BOMB_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.BOMB,
            bombSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.KEY: {
        for (const keySubType of UNLOCKABLE_KEY_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.KEY,
            keySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.BATTERY: {
        for (const batterySubType of UNLOCKABLE_BATTERY_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.BATTERY,
            batterySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.SACK: {
        for (const sackSubType of UNLOCKABLE_SACK_KEY_SUB_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.SACK,
            sackSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.CHEST: {
        for (const pickupVariant of UNLOCKABLE_CHEST_PICKUP_VARIANTS) {
          const achievement: Unlock = {
            type: UnlockType.CHEST,
            pickupVariant,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.SLOT: {
        for (const slotVariant of UNLOCKABLE_SLOT_VARIANTS) {
          const achievement: Unlock = {
            type: UnlockType.SLOT,
            slotVariant,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.GRID_ENTITY: {
        for (const gridEntityType of UNLOCKABLE_GRID_ENTITY_TYPES) {
          const achievement: Unlock = {
            type: UnlockType.GRID_ENTITY,
            gridEntityType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case UnlockType.OTHER: {
        for (const otherUnlockKind of OTHER_UNLOCK_KINDS) {
          const achievement: Unlock = {
            type: UnlockType.OTHER,
            kind: otherUnlockKind,
          };
          achievements.push(achievement);
        }

        break;
      }
    }
  }

  return achievements;
})();
