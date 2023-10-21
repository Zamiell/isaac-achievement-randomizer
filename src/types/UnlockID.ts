import { UnlockType } from "../enums/UnlockType";
import type { Unlock } from "./Unlock";

/**
 * A string that represents an unlock. This is the unlock metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
type UnlockID = string & { readonly __unlockIDBrand: symbol };

export function getUnlockID(unlock: Unlock): UnlockID {
  switch (unlock.type) {
    case UnlockType.CHARACTER: {
      return `${unlock.type}.${unlock.character}` as UnlockID;
    }

    case UnlockType.PATH: {
      return `${unlock.type}.${unlock.unlockablePath}` as UnlockID;
    }

    case UnlockType.ROOM: {
      return `${unlock.type}.${unlock.roomType}` as UnlockID;
    }

    case UnlockType.CHALLENGE: {
      return `${unlock.type}.${unlock.challenge}` as UnlockID;
    }

    case UnlockType.COLLECTIBLE: {
      return `${unlock.type}.${unlock.collectibleType}` as UnlockID;
    }

    case UnlockType.TRINKET: {
      return `${unlock.type}.${unlock.trinketType}` as UnlockID;
    }

    case UnlockType.CARD: {
      return `${unlock.type}.${unlock.cardType}` as UnlockID;
    }

    case UnlockType.PILL_EFFECT: {
      return `${unlock.type}.${unlock.pillEffect}` as UnlockID;
    }

    case UnlockType.HEART: {
      return `${unlock.type}.${unlock.heartSubType}` as UnlockID;
    }

    case UnlockType.COIN: {
      return `${unlock.type}.${unlock.coinSubType}` as UnlockID;
    }

    case UnlockType.BOMB: {
      return `${unlock.type}.${unlock.bombSubType}` as UnlockID;
    }

    case UnlockType.KEY: {
      return `${unlock.type}.${unlock.keySubType}` as UnlockID;
    }

    case UnlockType.BATTERY: {
      return `${unlock.type}.${unlock.batterySubType}` as UnlockID;
    }

    case UnlockType.SACK: {
      return `${unlock.type}.${unlock.sackSubType}` as UnlockID;
    }

    case UnlockType.CHEST: {
      return `${unlock.type}.${unlock.pickupVariant}` as UnlockID;
    }

    case UnlockType.SLOT: {
      return `${unlock.type}.${unlock.slotVariant}` as UnlockID;
    }

    case UnlockType.GRID_ENTITY: {
      return `${unlock.type}.${unlock.gridEntityType}` as UnlockID;
    }

    case UnlockType.OTHER: {
      return `${unlock.type}.${unlock.kind}` as UnlockID;
    }
  }
}
