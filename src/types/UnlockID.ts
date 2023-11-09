import { UnlockType } from "../enums/UnlockType";
import type {
  AreaUnlock,
  BatteryUnlock,
  BombUnlock,
  CardUnlock,
  ChallengeUnlock,
  CharacterUnlock,
  ChestUnlock,
  CoinUnlock,
  CollectibleUnlock,
  GridEntityUnlock,
  HeartUnlock,
  KeyUnlock,
  OtherUnlock,
  PillEffectUnlock,
  RoomUnlock,
  SackUnlock,
  SlotUnlock,
  TrinketUnlock,
  Unlock,
} from "./Unlock";

/**
 * A string that represents an unlock. This is the unlock metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
export type UnlockID = string & { readonly __unlockIDBrand: symbol };

const UNLOCK_TYPE_TO_ID_CONSTRUCTOR = {
  [UnlockType.CHARACTER]: (unlock) => {
    const characterUnlock = unlock as CharacterUnlock;
    return `${characterUnlock.type}.${characterUnlock.character}` as UnlockID;
  },

  [UnlockType.AREA]: (unlock) => {
    const areaUnlock = unlock as AreaUnlock;
    return `${areaUnlock.type}.${areaUnlock.unlockableArea}` as UnlockID;
  },

  [UnlockType.ROOM]: (unlock) => {
    const roomUnlock = unlock as RoomUnlock;
    return `${roomUnlock.type}.${roomUnlock.roomType}` as UnlockID;
  },

  [UnlockType.CHALLENGE]: (unlock) => {
    const challengeUnlock = unlock as ChallengeUnlock;
    return `${challengeUnlock.type}.${challengeUnlock.challenge}` as UnlockID;
  },

  [UnlockType.COLLECTIBLE]: (unlock) => {
    const collectibleUnlock = unlock as CollectibleUnlock;
    return `${collectibleUnlock.type}.${collectibleUnlock.collectibleType}` as UnlockID;
  },

  [UnlockType.TRINKET]: (unlock) => {
    const trinketUnlock = unlock as TrinketUnlock;
    return `${trinketUnlock.type}.${trinketUnlock.trinketType}` as UnlockID;
  },

  [UnlockType.CARD]: (unlock) => {
    const cardUnlock = unlock as CardUnlock;
    return `${cardUnlock.type}.${cardUnlock.cardType}` as UnlockID;
  },

  [UnlockType.PILL_EFFECT]: (unlock) => {
    const pillEffectUnlock = unlock as PillEffectUnlock;
    return `${pillEffectUnlock.type}.${pillEffectUnlock.pillEffect}` as UnlockID;
  },

  [UnlockType.HEART]: (unlock) => {
    const heartUnlock = unlock as HeartUnlock;
    return `${heartUnlock.type}.${heartUnlock.heartSubType}` as UnlockID;
  },

  [UnlockType.COIN]: (unlock) => {
    const coinUnlock = unlock as CoinUnlock;
    return `${coinUnlock.type}.${coinUnlock.coinSubType}` as UnlockID;
  },

  [UnlockType.BOMB]: (unlock) => {
    const bombUnlock = unlock as BombUnlock;
    return `${bombUnlock.type}.${bombUnlock.bombSubType}` as UnlockID;
  },

  [UnlockType.KEY]: (unlock) => {
    const keyUnlock = unlock as KeyUnlock;
    return `${keyUnlock.type}.${keyUnlock.keySubType}` as UnlockID;
  },

  [UnlockType.BATTERY]: (unlock) => {
    const batteryUnlock = unlock as BatteryUnlock;
    return `${batteryUnlock.type}.${batteryUnlock.batterySubType}` as UnlockID;
  },

  [UnlockType.SACK]: (unlock) => {
    const sackUnlock = unlock as SackUnlock;
    return `${sackUnlock.type}.${sackUnlock.sackSubType}` as UnlockID;
  },

  [UnlockType.CHEST]: (unlock) => {
    const chestUnlock = unlock as ChestUnlock;
    return `${chestUnlock.type}.${chestUnlock.pickupVariant}` as UnlockID;
  },

  [UnlockType.SLOT]: (unlock) => {
    const slotUnlock = unlock as SlotUnlock;
    return `${slotUnlock.type}.${slotUnlock.slotVariant}` as UnlockID;
  },

  [UnlockType.GRID_ENTITY]: (unlock) => {
    const gridEntityUnlock = unlock as GridEntityUnlock;
    return `${gridEntityUnlock.type}.${gridEntityUnlock.gridEntityType}` as UnlockID;
  },

  [UnlockType.OTHER]: (unlock) => {
    const otherUnlock = unlock as OtherUnlock;
    return `${otherUnlock.type}.${otherUnlock.kind}` as UnlockID;
  },
} as const satisfies Record<UnlockType, (unlock: Unlock) => UnlockID>;

export function getUnlockID(unlock: Unlock): UnlockID {
  const constructor = UNLOCK_TYPE_TO_ID_CONSTRUCTOR[unlock.type];
  return constructor(unlock);
}
