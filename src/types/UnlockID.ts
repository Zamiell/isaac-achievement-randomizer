import { UnlockType } from "../enums/UnlockType";
import type { Unlock } from "./Unlock";

/**
 * A string that represents an unlock. This is the unlock metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
type UnlockID = string & { readonly __unlockIDBrand: symbol };

export function getUnlockID(achievement: Unlock): UnlockID {
  switch (achievement.type) {
    case UnlockType.CHARACTER: {
      return `${achievement.type}.${achievement.character}` as UnlockID;
    }

    case UnlockType.PATH: {
      return `${achievement.type}.${achievement.unlockablePath}` as UnlockID;
    }

    case UnlockType.ALT_FLOOR: {
      return `${achievement.type}.${achievement.altFloor}` as UnlockID;
    }

    case UnlockType.CHALLENGE: {
      return `${achievement.type}.${achievement.challenge}` as UnlockID;
    }

    case UnlockType.COLLECTIBLE: {
      return `${achievement.type}.${achievement.collectibleType}` as UnlockID;
    }

    case UnlockType.TRINKET: {
      return `${achievement.type}.${achievement.trinketType}` as UnlockID;
    }

    case UnlockType.CARD: {
      return `${achievement.type}.${achievement.cardType}` as UnlockID;
    }

    case UnlockType.PILL_EFFECT: {
      return `${achievement.type}.${achievement.pillEffect}` as UnlockID;
    }

    case UnlockType.HEART: {
      return `${achievement.type}.${achievement.heartSubType}` as UnlockID;
    }

    case UnlockType.COIN: {
      return `${achievement.type}.${achievement.coinSubType}` as UnlockID;
    }

    case UnlockType.BOMB: {
      return `${achievement.type}.${achievement.bombSubType}` as UnlockID;
    }

    case UnlockType.KEY: {
      return `${achievement.type}.${achievement.keySubType}` as UnlockID;
    }

    case UnlockType.BATTERY: {
      return `${achievement.type}.${achievement.batterySubType}` as UnlockID;
    }

    case UnlockType.SACK: {
      return `${achievement.type}.${achievement.sackSubType}` as UnlockID;
    }

    case UnlockType.CHEST: {
      return `${achievement.type}.${achievement.pickupVariant}` as UnlockID;
    }

    case UnlockType.SLOT: {
      return `${achievement.type}.${achievement.slotVariant}` as UnlockID;
    }

    case UnlockType.GRID_ENTITY: {
      return `${achievement.type}.${achievement.gridEntityType}` as UnlockID;
    }

    case UnlockType.OTHER: {
      return `${achievement.type}.${achievement.kind}` as UnlockID;
    }
  }
}
