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
  ReadonlySet,
  assertDefined,
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
import { UNLOCK_TYPE_VALUES } from "../cachedEnumValues";
import type { OtherUnlockKind } from "../enums/OtherUnlockKind";
import { getOtherUnlockName } from "../enums/OtherUnlockKind";
import { UnlockType } from "../enums/UnlockType";
import type { UnlockableArea } from "../enums/UnlockableArea";
import { getAreaName } from "../enums/UnlockableArea";
import type { UnlockID } from "./UnlockID";

export interface CharacterUnlock {
  type: UnlockType.CHARACTER;
  character: PlayerType;
}

export interface AreaUnlock {
  type: UnlockType.AREA;
  unlockableArea: UnlockableArea;
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
  | AreaUnlock
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

const UNLOCK_TYPES_SET = new ReadonlySet(UNLOCK_TYPE_VALUES);

const UNLOCK_TYPE_TO_UNLOCK_CONSTRUCTOR = {
  [UnlockType.CHARACTER]: (arg) => ({
    type: UnlockType.CHARACTER,
    character: arg,
  }),

  [UnlockType.AREA]: (arg) => ({
    type: UnlockType.AREA,
    unlockableArea: arg,
  }),

  [UnlockType.ROOM]: (arg) => ({
    type: UnlockType.ROOM,
    roomType: arg,
  }),

  [UnlockType.CHALLENGE]: (arg) => ({
    type: UnlockType.CHALLENGE,
    challenge: arg,
  }),

  [UnlockType.COLLECTIBLE]: (arg) => ({
    type: UnlockType.COLLECTIBLE,
    collectibleType: arg,
  }),

  [UnlockType.TRINKET]: (arg) => ({
    type: UnlockType.TRINKET,
    trinketType: arg,
  }),

  [UnlockType.CARD]: (arg) => ({
    type: UnlockType.CARD,
    cardType: arg,
  }),

  [UnlockType.PILL_EFFECT]: (arg) => ({
    type: UnlockType.PILL_EFFECT,
    pillEffect: arg,
  }),

  [UnlockType.HEART]: (arg) => ({
    type: UnlockType.HEART,
    heartSubType: arg,
  }),

  [UnlockType.COIN]: (arg) => ({
    type: UnlockType.COIN,
    coinSubType: arg,
  }),

  [UnlockType.BOMB]: (arg) => ({
    type: UnlockType.BOMB,
    bombSubType: arg,
  }),

  [UnlockType.KEY]: (arg) => ({
    type: UnlockType.KEY,
    keySubType: arg,
  }),

  [UnlockType.BATTERY]: (arg) => ({
    type: UnlockType.BATTERY,
    batterySubType: arg,
  }),

  [UnlockType.SACK]: (arg) => ({
    type: UnlockType.SACK,
    sackSubType: arg,
  }),

  [UnlockType.CHEST]: (arg) => ({
    type: UnlockType.CHEST,
    pickupVariant: arg,
  }),

  [UnlockType.SLOT]: (arg) => ({
    type: UnlockType.SLOT,
    slotVariant: arg,
  }),

  [UnlockType.GRID_ENTITY]: (arg) => ({
    type: UnlockType.GRID_ENTITY,
    gridEntityType: arg,
  }),

  [UnlockType.OTHER]: (arg) => ({
    type: UnlockType.OTHER,
    kind: arg,
  }),
} as const satisfies Record<UnlockType, (arg: number) => Unlock>;

export function getUnlock(
  type: UnlockType.CHARACTER,
  character: PlayerType,
): Readonly<CharacterUnlock>;
export function getUnlock(
  type: UnlockType.AREA,
  unlockableArea: UnlockableArea,
): Readonly<AreaUnlock>;
export function getUnlock(
  type: UnlockType.ROOM,
  roomType: RoomType,
): Readonly<RoomUnlock>;
export function getUnlock(
  type: UnlockType.CHALLENGE,
  challenge: Challenge,
): Readonly<ChallengeUnlock>;
export function getUnlock(
  type: UnlockType.COLLECTIBLE,
  collectibleType: CollectibleType,
): Readonly<CollectibleUnlock>;
export function getUnlock(
  type: UnlockType.TRINKET,
  trinketType: TrinketType,
): Readonly<TrinketUnlock>;
export function getUnlock(
  type: UnlockType.CARD,
  cardType: CardType,
): Readonly<CardUnlock>;
export function getUnlock(
  type: UnlockType.PILL_EFFECT,
  pillEffect: PillEffect,
): Readonly<PillEffectUnlock>;
export function getUnlock(
  type: UnlockType.HEART,
  heartSubType: HeartSubType,
): Readonly<HeartUnlock>;
export function getUnlock(
  type: UnlockType.COIN,
  coinSubType: CoinSubType,
): Readonly<CoinUnlock>;
export function getUnlock(
  type: UnlockType.BOMB,
  bombSubType: BombSubType,
): Readonly<BombUnlock>;
export function getUnlock(
  type: UnlockType.KEY,
  keySubType: KeySubType,
): Readonly<KeyUnlock>;
export function getUnlock(
  type: UnlockType.BATTERY,
  batterySubType: BatterySubType,
): Readonly<BatteryUnlock>;
export function getUnlock(
  type: UnlockType.SACK,
  sackSubType: SackSubType,
): Readonly<SackUnlock>;
export function getUnlock(
  type: UnlockType.CHEST,
  pickupVariant: PickupVariant,
): Readonly<ChestUnlock>;
export function getUnlock(
  type: UnlockType.SLOT,
  slotVariant: SlotVariant,
): Readonly<SlotUnlock>;
export function getUnlock(
  type: UnlockType.GRID_ENTITY,
  gridEntityType: GridEntityType,
): Readonly<GridEntityUnlock>;
export function getUnlock(
  type: UnlockType.OTHER,
  kind: OtherUnlockKind,
): Readonly<OtherUnlock>;
// A generic overload is required for use in generic functions.
export function getUnlock(type: UnlockType, arg: number): Unlock;
export function getUnlock(type: UnlockType, arg: int): Unlock {
  const constructor = UNLOCK_TYPE_TO_UNLOCK_CONSTRUCTOR[type];
  return constructor(arg);
}

export function getUnlockFromID(unlockID: UnlockID): Unlock {
  const parts = unlockID.split(".");

  const typeString = parts[0];
  assertDefined(
    typeString,
    `Failed to parse the type from an unlock ID: ${unlockID}`,
  );

  const typeNumber = tonumber(typeString);
  assertDefined(
    typeNumber,
    `Failed to convert the type from an unlock ID to a number: ${unlockID}`,
  );

  // eslint-disable-next-line isaacscript/strict-enums
  if (!UNLOCK_TYPES_SET.has(typeNumber)) {
    error(`The type of ${typeNumber} in an unlock ID is not valid.`);
  }

  const type = typeNumber as UnlockType;
  const constructor = UNLOCK_TYPE_TO_UNLOCK_CONSTRUCTOR[type];

  const argString = parts[1];
  assertDefined(
    argString,
    `Failed to parse the second number from an unlock ID: ${unlockID}`,
  );

  const arg = tonumber(argString);
  assertDefined(
    arg,
    `Failed to convert the second number from an unlock ID to a number: ${unlockID}`,
  );

  return constructor(arg);
}

export const UNLOCK_MAP_FUNCTIONS = {
  [UnlockType.CHARACTER]: (unlock) => {
    const characterUnlock = unlock as CharacterUnlock;
    return characterUnlock.character;
  },
  [UnlockType.AREA]: (unlock) => {
    const areaUnlock = unlock as AreaUnlock;
    return areaUnlock.unlockableArea;
  },
  [UnlockType.ROOM]: (unlock) => {
    const roomUnlock = unlock as RoomUnlock;
    return roomUnlock.roomType;
  },
  [UnlockType.CHALLENGE]: (unlock) => {
    const challengeUnlock = unlock as ChallengeUnlock;
    return challengeUnlock.challenge;
  },
  [UnlockType.COLLECTIBLE]: (unlock) => {
    const collectibleUnlock = unlock as CollectibleUnlock;
    return collectibleUnlock.collectibleType;
  },
  [UnlockType.TRINKET]: (unlock) => {
    const trinketUnlock = unlock as TrinketUnlock;
    return trinketUnlock.trinketType;
  },
  [UnlockType.CARD]: (unlock) => {
    const cardUnlock = unlock as CardUnlock;
    return cardUnlock.cardType;
  },
  [UnlockType.PILL_EFFECT]: (unlock) => {
    const pillEffectUnlock = unlock as PillEffectUnlock;
    return pillEffectUnlock.pillEffect;
  },
  [UnlockType.HEART]: (unlock) => {
    const heartUnlock = unlock as HeartUnlock;
    return heartUnlock.heartSubType;
  },
  [UnlockType.COIN]: (unlock) => {
    const coinUnlock = unlock as CoinUnlock;
    return coinUnlock.coinSubType;
  },
  [UnlockType.BOMB]: (unlock) => {
    const bombUnlock = unlock as BombUnlock;
    return bombUnlock.bombSubType;
  },
  [UnlockType.KEY]: (unlock) => {
    const keyUnlock = unlock as KeyUnlock;
    return keyUnlock.keySubType;
  },
  [UnlockType.BATTERY]: (unlock) => {
    const batteryUnlock = unlock as BatteryUnlock;
    return batteryUnlock.batterySubType;
  },
  [UnlockType.SACK]: (unlock) => {
    const sackUnlock = unlock as SackUnlock;
    return sackUnlock.sackSubType;
  },
  [UnlockType.CHEST]: (unlock) => {
    const chestUnlock = unlock as ChestUnlock;
    return chestUnlock.pickupVariant;
  },
  [UnlockType.SLOT]: (unlock) => {
    const slotUnlock = unlock as SlotUnlock;
    return slotUnlock.slotVariant;
  },
  [UnlockType.GRID_ENTITY]: (unlock) => {
    const gridEntityUnlock = unlock as GridEntityUnlock;
    return gridEntityUnlock.gridEntityType;
  },
  [UnlockType.OTHER]: (unlock) => {
    const otherUnlock = unlock as OtherUnlock;
    return otherUnlock.kind;
  },
} as const satisfies Record<UnlockType, (unlock: Unlock) => int>;

export function getUnlockText(unlock: Unlock): readonly [string, string] {
  switch (unlock.type) {
    case UnlockType.CHARACTER: {
      return ["character", getCharacterName(unlock.character)];
    }

    case UnlockType.AREA: {
      return ["area", getAreaName(unlock.unlockableArea)];
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
