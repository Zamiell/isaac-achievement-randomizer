import type {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  KeySubType,
  PickupVariant,
  PillEffect,
  PlayerType,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  HeartSubType,
  ItemConfigPillEffectType,
  ItemConfigTag,
  RoomType,
} from "isaac-typescript-definitions";
import {
  assertNotNull,
  collectibleHasTag,
  eRange,
  getCollectibleQuality,
  getPillEffectType,
  getRandomArrayElement,
  isActiveCollectible,
  isCard,
  isFamiliarCollectible,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRune,
} from "isaacscript-common";
import { UNLOCKABLE_CARD_TYPES_SET } from "../../../arrays/unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES_SET } from "../../../arrays/unlockableChallenges";
import { UNLOCKABLE_CHARACTERS_SET } from "../../../arrays/unlockableCharacters";
import { UNLOCKABLE_COLLECTIBLE_TYPES_SET } from "../../../arrays/unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES_SET } from "../../../arrays/unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BATTERY_SUB_TYPES_SET,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES_SET,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS_SET,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_COIN_SUB_TYPES_SET,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES_SET,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES_SET,
  UNLOCKABLE_SACK_SUB_TYPES,
  UNLOCKABLE_SACK_SUB_TYPES_SET,
} from "../../../arrays/unlockablePickupTypes";
import {
  UNLOCKABLE_PILL_EFFECTS,
  UNLOCKABLE_PILL_EFFECTS_SET,
} from "../../../arrays/unlockablePillEffects";
import { UNLOCKABLE_ROOM_TYPES_SET } from "../../../arrays/unlockableRoomTypes";
import { UNLOCKABLE_SLOT_VARIANTS_SET } from "../../../arrays/unlockableSlotVariants";
import { UNLOCKABLE_TRINKET_TYPES_SET } from "../../../arrays/unlockableTrinketTypes";
import type { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import type { UnlockableArea } from "../../../enums/UnlockableArea";
import { CARD_QUALITIES } from "../../../objects/cardQualities";
import { TRINKET_QUALITIES } from "../../../objects/trinketQualities";
import type { Unlock } from "../../../types/Unlock";
import {
  UNLOCK_MAP_FUNCTIONS,
  getUnlock,
  getUnlockFromID,
} from "../../../types/Unlock";
import { getUnlockID } from "../../../types/UnlockID";
import { isPillEffectInPlaythrough, v } from "./v";

/** For hardcore & nightmare mode. */
const QUALITY_THRESHOLD_PERCENT = 0.333;

const SOUL_HEART_SUB_TYPES = [
  HeartSubType.SOUL, // 3
  HeartSubType.BLACK, // 6
  HeartSubType.HALF_SOUL, // 8
  HeartSubType.BLENDED, // 10
] as const;

// --------------------------
// Unlock - Generic functions
// --------------------------

function isUnlocked(unlock: Unlock, forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.has(unlockID);
}

function getCompletedUnlockTypes(
  unlockType: UnlockType,
  forRun: boolean,
): int[] {
  const completedUnlockIDsSet = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlockIDs = [...completedUnlockIDsSet];

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  const completedUnlocksOfType = completedUnlocks.filter(
    (unlock) => unlock.type === unlockType,
  );

  const mapFunc = UNLOCK_MAP_FUNCTIONS[unlockType] as (unlock: Unlock) => int;
  return completedUnlocksOfType.map(mapFunc);
}

function getUncompletedUnlockTypes(unlockType: UnlockType): int[] {
  const uncompletedUnlockIDs = [...v.persistent.uncompletedUnlockIDs];

  const uncompletedUnlocks = uncompletedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  const uncompletedUnlocksOfType = uncompletedUnlocks.filter(
    (unlock) => unlock.type === unlockType,
  );

  const mapFunc = UNLOCK_MAP_FUNCTIONS[unlockType] as (unlock: Unlock) => int;
  return uncompletedUnlocksOfType.map(mapFunc);
}

function getWorseUnlock<T extends CollectibleType | TrinketType | CardType>(
  type: T,
  getQuality: (type: T) => Quality,
  unlockType: UnlockType.COLLECTIBLE | UnlockType.TRINKET | UnlockType.CARD,
): T | undefined {
  const completedUnlockTypes = getCompletedUnlockTypes(
    unlockType,
    false,
  ) as T[];
  const uncompletedUnlockTypes = getUncompletedUnlockTypes(unlockType) as T[];

  // eslint-disable-next-line isaacscript/strict-enums
  const quality = getQuality(type);

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;

    const lowerQualityCompletedUnlockTypes = completedUnlockTypes.filter(
      // eslint-disable-next-line isaacscript/strict-enums
      (t) => getQuality(t) === lowerQuality,
    );

    const lowerQualityUncompletedUnlockTypes = uncompletedUnlockTypes.filter(
      // eslint-disable-next-line isaacscript/strict-enums
      (t) => getQuality(t) === lowerQuality,
    );

    const numLowerQuality =
      lowerQualityCompletedUnlockTypes.length +
      lowerQualityUncompletedUnlockTypes.length;

    if (
      lowerQualityCompletedUnlockTypes.length >=
      numLowerQuality * QUALITY_THRESHOLD_PERCENT
    ) {
      continue;
    }

    assertNotNull(
      v.persistent.seed,
      "Failed to get a worse unlock since the seed was null.",
    );

    return getRandomArrayElement(
      lowerQualityUncompletedUnlockTypes,
      v.persistent.seed,
    );
  }

  return undefined;
}

function getWorseUnlockProgressive<
  T extends
    | HeartSubType
    | CoinSubType
    | BombSubType
    | KeySubType
    | BatterySubType
    | SackSubType
    | PickupVariant,
>(
  type: T,
  unlockableTypes: readonly T[],
  isTypeUnlocked: (type: T, forRun: boolean) => boolean,
): T | undefined {
  const quality = unlockableTypes.indexOf(type);
  if (quality === -1) {
    error(`Failed to get the quality for progressive unlock type: ${type}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityType = unlockableTypes[lowerQuality];
    if (
      lowerQualityType !== undefined &&
      // eslint-disable-next-line isaacscript/strict-enums
      !isTypeUnlocked(lowerQualityType, false)
    ) {
      return lowerQualityType;
    }
  }

  return undefined;
}

export function getLockedNonCollectiblesNonTrinkets(): Unlock[] {
  const unlocks: Unlock[] = [];

  for (const unlockID of v.persistent.uncompletedUnlockIDs) {
    const unlock = getUnlockFromID(unlockID);
    if (
      unlock.type !== UnlockType.COLLECTIBLE &&
      unlock.type !== UnlockType.TRINKET
    ) {
      unlocks.push(unlock);
    }
  }

  return unlocks;
}

// ----------------------------
// Unlock - Character functions
// ----------------------------

export function isCharacterUnlocked(
  character: PlayerType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CHARACTERS_SET.has(character)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.CHARACTER, character);
  return isUnlocked(unlock, forRun);
}

export function getNextCharacterUnlock(): PlayerType | undefined {
  return v.persistent.characterUnlockOrder.find(
    (character) => !isCharacterUnlocked(character, false),
  );
}

// -----------------------
// Unlock - Area functions
// -----------------------

export function isAreaUnlocked(
  unlockableArea: UnlockableArea,
  forRun: boolean,
): boolean {
  const unlock = getUnlock(UnlockType.AREA, unlockableArea);
  return isUnlocked(unlock, forRun);
}

// -----------------------
// Unlock - Room functions
// -----------------------

export function isRoomTypeUnlocked(
  roomType: RoomType,
  forRun: boolean,
): boolean {
  // Clean Bedrooms and Dirty Bedrooms are combined into one unlock.
  if (roomType === RoomType.DIRTY_BEDROOM) {
    roomType = RoomType.CLEAN_BEDROOM;
  }

  if (!UNLOCKABLE_ROOM_TYPES_SET.has(roomType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.ROOM, roomType);
  return isUnlocked(unlock, forRun);
}

// ----------------------------
// Unlock - Challenge functions
// ----------------------------

export function isChallengeUnlocked(
  challenge: Challenge,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CHALLENGES_SET.has(challenge)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.CHALLENGE, challenge);
  return isUnlocked(unlock, forRun);
}

// ------------------------------
// Unlock - Collectible functions
// ------------------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_COLLECTIBLE_TYPES_SET.has(collectibleType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
  return isUnlocked(unlock, forRun);
}

export function getUnlockedEdenActiveCollectibleTypes(
  forRun: boolean,
): readonly CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes(forRun);

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isActiveCollectible(collectibleType),
  );
}

export function getUnlockedEdenPassiveCollectibleTypes(
  forRun: boolean,
): readonly CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes(forRun);

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isPassiveOrFamiliarCollectible(collectibleType),
  );
}

export function anyActiveCollectibleUnlocked(forRun: boolean): boolean {
  const collectibleTypes = getUnlockedCollectibleTypes(forRun);
  return collectibleTypes.some((collectibleType) =>
    isActiveCollectible(collectibleType),
  );
}

export function anyFamiliarCollectibleUnlocked(forRun: boolean): boolean {
  const collectibleTypes = getUnlockedCollectibleTypes(forRun);
  return collectibleTypes.some((collectibleType) =>
    isFamiliarCollectible(collectibleType),
  );
}

function getUnlockedCollectibleTypes(
  forRun: boolean,
): readonly CollectibleType[] {
  return getCompletedUnlockTypes(UnlockType.COLLECTIBLE, forRun);
}

/** Does not use the `getUnlockedCollectibleTypes` function as an optimization. */
export function getNumUnlockedCollectibleTypes(forRun: boolean): int {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  let numUnlockedCollectibleTypes = 0;

  for (const unlockID of completedUnlockIDs) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type === UnlockType.COLLECTIBLE) {
      numUnlockedCollectibleTypes++;
    }
  }

  return numUnlockedCollectibleTypes;
}

export function getWorseLockedCollectibleType(
  collectibleType: CollectibleType,
): CollectibleType | undefined {
  return getWorseUnlock(
    collectibleType,
    getCollectibleQuality,
    UnlockType.COLLECTIBLE,
  );
}

// --------------------------
// Unlock - Trinket functions
// --------------------------

export function anyTrinketTypesUnlocked(forRun: boolean): boolean {
  const trinketUnlocks = getCompletedUnlockTypes(UnlockType.TRINKET, forRun);
  return trinketUnlocks.length > 0;
}

export function isTrinketTypeUnlocked(
  trinketType: TrinketType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_TRINKET_TYPES_SET.has(trinketType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.TRINKET, trinketType);
  return isUnlocked(unlock, forRun);
}

export function getUnlockedTrinketTypes(
  forRun: boolean,
): readonly TrinketType[] {
  return getCompletedUnlockTypes(UnlockType.TRINKET, forRun);
}

/** Does not use the `getUnlockedTrinketTypes` function as an optimization. */
export function getNumUnlockedTrinketTypes(forRun: boolean): int {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  let numUnlockedTrinketTypes = 0;

  for (const unlockID of completedUnlockIDs) {
    const unlock = getUnlockFromID(unlockID);
    if (unlock.type === UnlockType.TRINKET) {
      numUnlockedTrinketTypes++;
    }
  }

  return numUnlockedTrinketTypes;
}

export function getWorseLockedTrinketType(
  trinketType: TrinketType,
): TrinketType | undefined {
  return getWorseUnlock(trinketType, getTrinketQuality, UnlockType.TRINKET);
}

function getTrinketQuality(trinketType: TrinketType): Quality {
  return TRINKET_QUALITIES[trinketType];
}

// -----------------------
// Unlock - Card functions
// -----------------------

export function anyCardTypesUnlocked(forRun: boolean): boolean {
  const cardUnlocks = getCompletedUnlockTypes(UnlockType.CARD, forRun);
  return cardUnlocks.length > 0;
}

export function anyCardsUnlocked(forRun: boolean): boolean {
  const cardTypes = getUnlockedCardTypes(forRun);
  const cardTypesCard = cardTypes.filter((cardType) => isCard(cardType));

  return cardTypesCard.length > 0;
}

export function anyRunesUnlocked(forRun: boolean): boolean {
  const cardTypes = getUnlockedCardTypes(forRun);
  const cardTypesRune = cardTypes.filter((cardType) => isRune(cardType));

  return cardTypesRune.length > 0;
}

export function isCardTypeUnlocked(
  cardType: CardType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CARD_TYPES_SET.has(cardType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.CARD, cardType);
  return isUnlocked(unlock, forRun);
}

/** Returns the number of cards unlocked, for e.g. Booster Pack. This does not include runes. */
export function getNumCardsUnlocked(forRun: boolean): int {
  const cardTypes = getUnlockedCardTypes(forRun);
  const cardTypesCard = cardTypes.filter((cardType) => isCard(cardType));

  return cardTypesCard.length;
}

export function getUnlockedCardTypes(forRun: boolean): readonly CardType[] {
  return getCompletedUnlockTypes(UnlockType.CARD, forRun);
}

export function getWorseLockedCardType(
  cardType: CardType,
): CardType | undefined {
  return getWorseUnlock(cardType, getCardQuality, UnlockType.CARD);
}

function getCardQuality(cardType: CardType): Quality {
  return CARD_QUALITIES[cardType];
}

// ------------------------------
// Unlock - Pill effect functions
// ------------------------------

export function anyPillEffectsUnlocked(forRun: boolean): boolean {
  const pillEffectUnlocks = getCompletedUnlockTypes(
    UnlockType.PILL_EFFECT,
    forRun,
  );

  return pillEffectUnlocks.length > 0;
}

export function anyGoodPillEffectsUnlocked(forRun: boolean): boolean {
  const pillEffects = getUnlockedPillEffects(forRun);
  const goodPillEffects = pillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.POSITIVE,
  );

  return goodPillEffects.length > 0;
}

export function anyBadPillEffectsUnlocked(forRun: boolean): boolean {
  const pillEffects = getUnlockedPillEffects(forRun);
  const goodPillEffects = pillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.NEGATIVE,
  );

  return goodPillEffects.length > 0;
}

export function isPillEffectUnlocked(
  pillEffect: PillEffect,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_PILL_EFFECTS_SET.has(pillEffect)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.PILL_EFFECT, pillEffect);
  return isUnlocked(unlock, forRun);
}

export function isAllPillEffectsUnlocked(forRun: boolean): boolean {
  const pillEffects = getUnlockedPillEffects(forRun);
  return pillEffects.length === UNLOCKABLE_PILL_EFFECTS.length;
}

export function getUnlockedPillEffects(forRun: boolean): PillEffect[] {
  return getCompletedUnlockTypes(UnlockType.PILL_EFFECT, forRun);
}

/**
 * In hardcore mode, pill effects unlock on a cycle of one negative, one neutral, and one positive.
 */
export function getWorseLockedPillEffect(
  pillEffect: PillEffect,
): PillEffect | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse pill effect since the seed was null.",
  );

  const thisPillEffectType = getPillEffectType(pillEffect);
  const nextPillEffectType = getNextPillEffectUnlockTypeForHardcore();

  if (thisPillEffectType === nextPillEffectType) {
    return undefined;
  }

  const lockedPillEffects = getLockedPillEffects(false);
  const lockedPillEffectsOfType = lockedPillEffects.filter(
    (thisPillEffect) =>
      getPillEffectType(thisPillEffect) === nextPillEffectType,
  );

  return getRandomArrayElement(lockedPillEffectsOfType, v.persistent.seed);
}

/** Negative --> Neutral --> Positive --> Negative --> etc. */
function getNextPillEffectUnlockTypeForHardcore(): ItemConfigPillEffectType {
  const unlockedPillEffects = getUnlockedPillEffects(false);
  const lockedPillEffects = getLockedPillEffects(false);

  const unlockedNegativePillEffects = unlockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.NEGATIVE,
  );
  const lockedNegativePillEffects = lockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.NEGATIVE,
  );

  const unlockedNeutralPillEffects = unlockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.NEUTRAL,
  );
  const lockedNeutralPillEffects = lockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.NEUTRAL,
  );

  const unlockedPositivePillEffects = unlockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.POSITIVE,
  );
  const lockedPositivePillEffects = lockedPillEffects.filter(
    (pillEffect) =>
      getPillEffectType(pillEffect) === ItemConfigPillEffectType.POSITIVE,
  );

  if (
    (unlockedNegativePillEffects.length < unlockedNeutralPillEffects.length ||
      unlockedNegativePillEffects.length <
        unlockedPositivePillEffects.length) &&
    lockedNegativePillEffects.length > 0
  ) {
    return ItemConfigPillEffectType.NEGATIVE;
  }

  if (
    (unlockedNeutralPillEffects.length < unlockedNegativePillEffects.length ||
      unlockedNeutralPillEffects.length < unlockedPositivePillEffects.length) &&
    lockedNeutralPillEffects.length > 0
  ) {
    return ItemConfigPillEffectType.NEUTRAL;
  }

  if (
    (unlockedPositivePillEffects.length < unlockedNegativePillEffects.length ||
      unlockedPositivePillEffects.length < unlockedNeutralPillEffects.length) &&
    lockedPositivePillEffects.length > 0
  ) {
    return ItemConfigPillEffectType.POSITIVE;
  }

  if (lockedNegativePillEffects.length > 0) {
    return ItemConfigPillEffectType.NEGATIVE;
  }

  if (lockedNeutralPillEffects.length > 0) {
    return ItemConfigPillEffectType.NEUTRAL;
  }

  if (lockedPositivePillEffects.length > 0) {
    return ItemConfigPillEffectType.POSITIVE;
  }

  error("Failed to find a the next pill effect unlock type for hardcore.");
}

function getLockedPillEffects(forRun: boolean): PillEffect[] {
  return UNLOCKABLE_PILL_EFFECTS.filter(
    (pillEffect) =>
      !isPillEffectUnlocked(pillEffect, forRun) &&
      isPillEffectInPlaythrough(pillEffect),
  );
}

// -------------------------------
// Unlock - Other pickup functions
// -------------------------------

export function isHeartSubTypeUnlocked(
  heartSubType: HeartSubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_HEART_SUB_TYPES_SET.has(heartSubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.HEART, heartSubType);
  return isUnlocked(unlock, forRun);
}

export function anySoulHeartUnlocked(forRun: boolean): boolean {
  return SOUL_HEART_SUB_TYPES.some((heartSubType) =>
    isHeartSubTypeUnlocked(heartSubType, forRun),
  );
}

export function getWorseLockedHeartSubType(
  heartSubType: HeartSubType,
): HeartSubType | undefined {
  return getWorseUnlockProgressive(
    heartSubType,
    UNLOCKABLE_HEART_SUB_TYPES,
    isHeartSubTypeUnlocked,
  );
}

export function isCoinSubTypeUnlocked(
  coinSubType: CoinSubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_COIN_SUB_TYPES_SET.has(coinSubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.COIN, coinSubType);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedCoinSubType(
  coinSubType: CoinSubType,
): CoinSubType | undefined {
  return getWorseUnlockProgressive(
    coinSubType,
    UNLOCKABLE_COIN_SUB_TYPES,
    isCoinSubTypeUnlocked,
  );
}

export function isBombSubTypeUnlocked(
  bombSubType: BombSubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_BOMB_SUB_TYPES_SET.has(bombSubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.BOMB, bombSubType);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedBombSubType(
  bombSubType: BombSubType,
): BombSubType | undefined {
  return getWorseUnlockProgressive(
    bombSubType,
    UNLOCKABLE_BOMB_SUB_TYPES,
    isBombSubTypeUnlocked,
  );
}

export function isKeySubTypeUnlocked(
  keySubType: KeySubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_KEY_SUB_TYPES_SET.has(keySubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.KEY, keySubType);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedKeySubType(
  keySubType: KeySubType,
): KeySubType | undefined {
  return getWorseUnlockProgressive(
    keySubType,
    UNLOCKABLE_KEY_SUB_TYPES,
    isKeySubTypeUnlocked,
  );
}

export function isBatterySubTypeUnlocked(
  batterySubType: BatterySubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_BATTERY_SUB_TYPES_SET.has(batterySubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.BATTERY, batterySubType);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedBatterySubType(
  batterySubType: BatterySubType,
): BatterySubType | undefined {
  return getWorseUnlockProgressive(
    batterySubType,
    UNLOCKABLE_BATTERY_SUB_TYPES,
    isBatterySubTypeUnlocked,
  );
}

export function isSackSubTypeUnlocked(
  sackSubType: SackSubType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_SACK_SUB_TYPES_SET.has(sackSubType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.SACK, sackSubType);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedSackSubType(
  sackSubType: SackSubType,
): SackSubType | undefined {
  return getWorseUnlockProgressive(
    sackSubType,
    UNLOCKABLE_SACK_SUB_TYPES,
    isSackSubTypeUnlocked,
  );
}

export function anyChestPickupVariantUnlocked(forRun: boolean): boolean {
  const chestUnlocks = getCompletedUnlockTypes(UnlockType.CHEST, forRun);
  return chestUnlocks.length > 0;
}

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CHEST_PICKUP_VARIANTS_SET.has(pickupVariant)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.CHEST, pickupVariant);
  return isUnlocked(unlock, forRun);
}

export function getWorseLockedChestPickupVariant(
  pickupVariant: PickupVariant,
): PickupVariant | undefined {
  return getWorseUnlockProgressive(
    pickupVariant,
    UNLOCKABLE_CHEST_PICKUP_VARIANTS,
    isChestPickupVariantUnlocked,
  );
}

// -----------------------
// Unlock - Slot functions
// -----------------------

export function isSlotVariantUnlocked(
  slotVariant: SlotVariant,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_SLOT_VARIANTS_SET.has(slotVariant)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.SLOT, slotVariant);
  return isUnlocked(unlock, forRun);
}

// ------------------------------
// Unlock - Grid entity functions
// ------------------------------

export function isGridEntityTypeUnlocked(
  gridEntityType: GridEntityType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_GRID_ENTITY_TYPES_SET.has(gridEntityType)) {
    return true;
  }

  const unlock = getUnlock(UnlockType.GRID_ENTITY, gridEntityType);
  return isUnlocked(unlock, forRun);
}

// ------------------------
// Unlock - Other functions
// ------------------------

export function isOtherUnlockKindUnlocked(
  otherUnlockKind: OtherUnlockKind,
  forRun: boolean,
): boolean {
  const unlock = getUnlock(UnlockType.OTHER, otherUnlockKind);
  return isUnlocked(unlock, forRun);
}
