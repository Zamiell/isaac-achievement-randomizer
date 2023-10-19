import type {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PillEffect,
  PlayerType,
  RoomType,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import {
  getBatteryName,
  getBombName,
  getCardName,
  getChallengeName,
  getCharacterName,
  getChestName,
  getCoinName,
  getCollectibleName,
  getHeartName,
  getKeyName,
  getPillEffectName,
  getRoomTypeName,
  getSackName,
  getSlotName,
  getTrinketName,
} from "isaacscript-common";
import type { UNLOCKABLE_GRID_ENTITY_TYPES } from "../arrays/unlockableGridEntityTypes";
import { getGridEntityName } from "../arrays/unlockableGridEntityTypes";
import type { AltFloor } from "../enums/AltFloor";
import { getAltFloorName } from "../enums/AltFloor";
import type { OtherUnlockKind } from "../enums/OtherUnlockKind";
import { getOtherUnlockName } from "../enums/OtherUnlockKind";
import { UnlockType } from "../enums/UnlockType";
import type { UnlockablePath } from "../enums/UnlockablePath";
import { getPathName } from "../enums/UnlockablePath";

interface CharacterUnlock {
  type: UnlockType.CHARACTER;
  character: PlayerType;
}

export interface PathUnlock {
  type: UnlockType.PATH;
  unlockablePath: UnlockablePath;
}

export interface AltFloorUnlock {
  type: UnlockType.ALT_FLOOR;
  altFloor: AltFloor;
}

export interface RoomUnlock {
  type: UnlockType.ROOM;
  roomType: RoomType;
}

export interface ChallengeUnlock {
  type: UnlockType.CHALLENGE;
  challenge: Challenge;
}

export interface CollectibleUnlock {
  type: UnlockType.COLLECTIBLE;
  collectibleType: CollectibleType;
}

export interface TrinketUnlock {
  type: UnlockType.TRINKET;
  trinketType: TrinketType;
}

export interface CardUnlock {
  type: UnlockType.CARD;
  cardType: CardType;
}

export interface PillEffectUnlock {
  type: UnlockType.PILL_EFFECT;
  pillEffect: PillEffect;
}

export interface HeartUnlock {
  type: UnlockType.HEART;
  heartSubType: HeartSubType;
}

export interface CoinUnlock {
  type: UnlockType.COIN;
  coinSubType: CoinSubType;
}

export interface BombUnlock {
  type: UnlockType.BOMB;
  bombSubType: BombSubType;
}

export interface KeyUnlock {
  type: UnlockType.KEY;
  keySubType: KeySubType;
}

export interface BatteryUnlock {
  type: UnlockType.BATTERY;
  batterySubType: BatterySubType;
}

export interface SackUnlock {
  type: UnlockType.SACK;
  sackSubType: SackSubType;
}

export interface ChestUnlock {
  type: UnlockType.CHEST;
  pickupVariant: PickupVariant;
}

export interface SlotUnlock {
  type: UnlockType.SLOT;
  slotVariant: SlotVariant;
}

export interface GridEntityUnlock {
  type: UnlockType.GRID_ENTITY;
  gridEntityType: (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number];
}

export interface OtherUnlock {
  type: UnlockType.OTHER;
  kind: OtherUnlockKind;
}

export type Unlock =
  | CharacterUnlock
  | PathUnlock
  | AltFloorUnlock
  | RoomUnlock
  | ChallengeUnlock
  | CollectibleUnlock
  | TrinketUnlock
  | CardUnlock
  | PillEffectUnlock
  | HeartUnlock
  | CoinUnlock
  | BombUnlock
  | KeyUnlock
  | BatteryUnlock
  | SackUnlock
  | ChestUnlock
  | SlotUnlock
  | GridEntityUnlock
  | OtherUnlock;

type _Test = CompositionTypeSatisfiesEnum<Unlock, UnlockType>;

export function getUnlock(
  type: UnlockType.CHARACTER,
  character: PlayerType,
): CharacterUnlock;
export function getUnlock(
  type: UnlockType.PATH,
  unlockablePath: UnlockablePath,
): PathUnlock;
export function getUnlock(
  type: UnlockType.ALT_FLOOR,
  altFloor: AltFloor,
): AltFloorUnlock;
export function getUnlock(
  type: UnlockType.ROOM,
  roomType: RoomType,
): RoomUnlock;
export function getUnlock(
  type: UnlockType.CHALLENGE,
  challenge: Challenge,
): ChallengeUnlock;
export function getUnlock(
  type: UnlockType.COLLECTIBLE,
  collectibleType: CollectibleType,
): CollectibleUnlock;
export function getUnlock(
  type: UnlockType.TRINKET,
  trinketType: TrinketType,
): TrinketUnlock;
export function getUnlock(
  type: UnlockType.CARD,
  cardType: CardType,
): CardUnlock;
export function getUnlock(
  type: UnlockType.PILL_EFFECT,
  pillEffect: PillEffect,
): PillEffectUnlock;
export function getUnlock(
  type: UnlockType.HEART,
  heartSubType: HeartSubType,
): HeartUnlock;
export function getUnlock(
  type: UnlockType.COIN,
  coinSubType: CoinSubType,
): CoinUnlock;
export function getUnlock(
  type: UnlockType.BOMB,
  bombSubType: BombSubType,
): BombUnlock;
export function getUnlock(
  type: UnlockType.KEY,
  keySubType: KeySubType,
): KeyUnlock;
export function getUnlock(
  type: UnlockType.BATTERY,
  batterySubType: BatterySubType,
): BatteryUnlock;
export function getUnlock(
  type: UnlockType.SACK,
  sackSubType: SackSubType,
): SackUnlock;
export function getUnlock(
  type: UnlockType.CHEST,
  pickupVariant: PickupVariant,
): ChestUnlock;
export function getUnlock(
  type: UnlockType.SLOT,
  slotVariant: SlotVariant,
): SlotUnlock;
export function getUnlock(
  type: UnlockType.GRID_ENTITY,
  gridEntityType: GridEntityType,
): GridEntityUnlock;
export function getUnlock(
  type: UnlockType.OTHER,
  kind: OtherUnlockKind,
): OtherUnlock;
export function getUnlock(type: UnlockType, arg: int): Unlock {
  switch (type) {
    case UnlockType.CHARACTER: {
      return {
        type,
        character: arg,
      };
    }

    case UnlockType.PATH: {
      return {
        type,
        unlockablePath: arg,
      };
    }

    case UnlockType.ALT_FLOOR: {
      return {
        type,
        altFloor: arg,
      };
    }

    case UnlockType.ROOM: {
      return {
        type,
        roomType: arg,
      };
    }

    case UnlockType.CHALLENGE: {
      return {
        type,
        challenge: arg,
      };
    }

    case UnlockType.COLLECTIBLE: {
      return {
        type,
        collectibleType: arg,
      };
    }

    case UnlockType.TRINKET: {
      return {
        type,
        trinketType: arg,
      };
    }

    case UnlockType.CARD: {
      return {
        type,
        cardType: arg,
      };
    }

    case UnlockType.PILL_EFFECT: {
      return {
        type,
        pillEffect: arg,
      };
    }

    case UnlockType.HEART: {
      return {
        type,
        heartSubType: arg,
      };
    }

    case UnlockType.COIN: {
      return {
        type,
        coinSubType: arg,
      };
    }

    case UnlockType.BOMB: {
      return {
        type,
        bombSubType: arg,
      };
    }

    case UnlockType.KEY: {
      return {
        type,
        keySubType: arg,
      };
    }

    case UnlockType.BATTERY: {
      return {
        type,
        batterySubType: arg,
      };
    }

    case UnlockType.SACK: {
      return {
        type,
        sackSubType: arg,
      };
    }

    case UnlockType.CHEST: {
      return {
        type,
        pickupVariant: arg,
      };
    }

    case UnlockType.SLOT: {
      return {
        type,
        slotVariant: arg,
      };
    }

    case UnlockType.GRID_ENTITY: {
      return {
        type,
        gridEntityType: arg,
      };
    }

    case UnlockType.OTHER: {
      return {
        type,
        kind: arg,
      };
    }
  }
}

export function getUnlockText(unlock: Unlock): [string, string] {
  switch (unlock.type) {
    case UnlockType.CHARACTER: {
      return ["character", getCharacterName(unlock.character)];
    }

    case UnlockType.PATH: {
      return ["area", getPathName(unlock.unlockablePath)];
    }

    case UnlockType.ALT_FLOOR: {
      return ["floor", getAltFloorName(unlock.altFloor)];
    }

    case UnlockType.ROOM: {
      return ["room type", getRoomTypeName(unlock.roomType)];
    }

    case UnlockType.CHALLENGE: {
      return ["challenge", getChallengeName(unlock.challenge)];
    }

    case UnlockType.COLLECTIBLE: {
      return ["collectible", getCollectibleName(unlock.collectibleType)];
    }

    case UnlockType.TRINKET: {
      return ["trinket", getTrinketName(unlock.trinketType)];
    }

    case UnlockType.CARD: {
      return ["card", getCardName(unlock.cardType)];
    }

    case UnlockType.PILL_EFFECT: {
      return ["pill effect", getPillEffectName(unlock.pillEffect)];
    }

    case UnlockType.HEART: {
      return ["heart", getHeartName(unlock.heartSubType)];
    }

    case UnlockType.COIN: {
      return ["coin", getCoinName(unlock.coinSubType)];
    }

    case UnlockType.BOMB: {
      return ["bomb", getBombName(unlock.bombSubType)];
    }

    case UnlockType.KEY: {
      return ["key", getKeyName(unlock.keySubType)];
    }

    case UnlockType.BATTERY: {
      return ["battery", getBatteryName(unlock.batterySubType)];
    }

    case UnlockType.SACK: {
      return ["sack", getSackName(unlock.sackSubType)];
    }

    case UnlockType.CHEST: {
      return ["chest", getChestName(unlock.pickupVariant)];
    }

    case UnlockType.SLOT: {
      return ["slot", getSlotName(unlock.slotVariant)];
    }

    case UnlockType.GRID_ENTITY: {
      return ["grid entity", getGridEntityName(unlock.gridEntityType)];
    }

    case UnlockType.OTHER: {
      return getOtherUnlockName(unlock.kind);
    }
  }
}
