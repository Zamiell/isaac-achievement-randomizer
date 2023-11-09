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
  RoomType,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  HeartSubType,
  ItemConfigPillEffectType,
  ItemConfigTag,
} from "isaac-typescript-definitions";
import {
  assertNotNull,
  collectibleHasTag,
  eRange,
  getCollectibleQuality,
  getPillEffectType,
  getRandomArrayElement,
  getVanillaCollectibleTypesOfQuality,
  includes,
  isActiveCollectible,
  isCard,
  isFamiliarCollectible,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRune,
} from "isaacscript-common";
import { UNLOCKABLE_CARD_TYPES } from "../../../arrays/unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "../../../arrays/unlockableChallenges";
import { UNLOCKABLE_CHARACTERS } from "../../../arrays/unlockableCharacters";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "../../../arrays/unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "../../../arrays/unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_SUB_TYPES,
} from "../../../arrays/unlockablePickupTypes";
import { UNLOCKABLE_PILL_EFFECTS } from "../../../arrays/unlockablePillEffects";
import { UNLOCKABLE_ROOM_TYPES } from "../../../arrays/unlockableRoomTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "../../../arrays/unlockableSlotVariants";
import { UNLOCKABLE_TRINKET_TYPES } from "../../../arrays/unlockableTrinketTypes";
import type { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import type { UnlockableArea } from "../../../enums/UnlockableArea";
import { CARD_QUALITIES } from "../../../objects/cardQualities";
import { TRINKET_QUALITIES } from "../../../objects/trinketQualities";
import { getUnlock, getUnlockFromID } from "../../../types/Unlock";
import { getUnlockID } from "../../../types/UnlockID";
import { getCardTypesOfQuality } from "./cardQuality";
import { getTrinketTypesOfQuality } from "./trinketQuality";
import { v } from "./v";

const QUALITY_THRESHOLD_PERCENT = 0.5;

const SOUL_HEART_SUB_TYPES = [
  HeartSubType.SOUL, // 3
  HeartSubType.BLACK, // 6
  HeartSubType.HALF_SOUL, // 8
  HeartSubType.BLENDED, // 10
] as const;

// ----------------------------
// Unlock - Character functions
// ----------------------------

export function isCharacterUnlocked(
  character: PlayerType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CHARACTERS.includes(character)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.CHARACTER, character);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// -----------------------
// Unlock - Area functions
// -----------------------

export function isAreaUnlocked(
  unlockableArea: UnlockableArea,
  forRun: boolean,
): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.AREA, unlockableArea);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// -----------------------
// Unlock - Room functions
// -----------------------

export function isRoomTypeUnlocked(
  roomType: RoomType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_ROOM_TYPES, roomType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.ROOM, roomType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// ----------------------------
// Unlock - Challenge functions
// ----------------------------

export function isChallengeUnlocked(
  challenge: Challenge,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CHALLENGES.includes(challenge)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.CHALLENGE, challenge);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// ------------------------------
// Unlock - Collectible functions
// ------------------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_COLLECTIBLE_TYPES.includes(collectibleType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
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
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlockedCollectibleTypes: CollectibleType[] = [];

  for (const completedUnlockID of completedUnlockIDs) {
    const completedUnlock = getUnlockFromID(completedUnlockID);
    if (completedUnlock.type === UnlockType.COLLECTIBLE) {
      unlockedCollectibleTypes.push(completedUnlock.collectibleType);
    }
  }

  return unlockedCollectibleTypes;
}

export function getWorseLockedCollectibleType(
  collectibleType: CollectibleType,
): CollectibleType | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse collectible type since the seed was null.",
  );

  const quality = getCollectibleQuality(collectibleType);

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityCollectibleTypes = [
      ...getVanillaCollectibleTypesOfQuality(lowerQuality),
    ];
    const unlockedLowerQualityCollectibleTypes =
      lowerQualityCollectibleTypes.filter((lowerQualityCollectibleType) =>
        isCollectibleTypeUnlocked(lowerQualityCollectibleType, false),
      );

    if (
      unlockedLowerQualityCollectibleTypes.length <
      lowerQualityCollectibleTypes.length * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityCollectibleTypes =
        lowerQualityCollectibleTypes.filter(
          (lowerQualityCollectibleType) =>
            !isCollectibleTypeUnlocked(lowerQualityCollectibleType, false),
        );

      return getRandomArrayElement(
        lockedLowerQualityCollectibleTypes,
        v.persistent.seed,
      );
    }
  }

  return undefined;
}

// --------------------------
// Unlock - Trinket functions
// --------------------------

export function anyTrinketTypesUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some((unlock) => unlock.type === UnlockType.TRINKET);
}

export function isTrinketTypeUnlocked(
  trinketType: TrinketType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_TRINKET_TYPES.includes(trinketType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.TRINKET, trinketType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getUnlockedTrinketTypes(forRun: boolean): TrinketType[] {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlockedTrinketTypes: TrinketType[] = [];

  for (const completedUnlockID of completedUnlockIDs) {
    const completedUnlock = getUnlockFromID(completedUnlockID);
    if (completedUnlock.type === UnlockType.TRINKET) {
      unlockedTrinketTypes.push(completedUnlock.trinketType);
    }
  }

  return unlockedTrinketTypes;
}

export function getWorseLockedTrinketType(
  trinketType: TrinketType,
): TrinketType | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse trinket type since the seed was null.",
  );

  const quality = TRINKET_QUALITIES[trinketType];

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityTrinketTypes = getTrinketTypesOfQuality(lowerQuality);
    const unlockedLowerQualityTrinketTypes = lowerQualityTrinketTypes.filter(
      (lowerQualityTrinketType) =>
        isTrinketTypeUnlocked(lowerQualityTrinketType, false),
    );

    if (
      unlockedLowerQualityTrinketTypes.length <
      lowerQualityTrinketTypes.length * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityTrinketTypes = lowerQualityTrinketTypes.filter(
        (lowerQualityTrinketType) =>
          !isTrinketTypeUnlocked(lowerQualityTrinketType, false),
      );
      const lockedLowerQualityTrinketTypesInPlaythrough =
        lockedLowerQualityTrinketTypes.filter((lowerQualityTrinketType) => {
          const unlock = getUnlock(UnlockType.TRINKET, lowerQualityTrinketType);
          const unlockID = getUnlockID(unlock);
          const objectiveID =
            v.persistent.unlockIDToObjectiveIDMap.get(unlockID);

          return objectiveID !== undefined;
        });

      return getRandomArrayElement(
        lockedLowerQualityTrinketTypesInPlaythrough,
        v.persistent.seed,
      );
    }
  }

  return undefined;
}

// -----------------------
// Unlock - Card functions
// -----------------------

export function anyCardTypesUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some((unlock) => unlock.type === UnlockType.CARD);
}

export function anyCardsUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some(
    (unlock) => unlock.type === UnlockType.CARD && isCard(unlock.cardType),
  );
}

export function anyRunesUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some(
    (unlock) => unlock.type === UnlockType.CARD && isRune(unlock.cardType),
  );
}

export function isCardTypeUnlocked(
  cardType: CardType,
  forRun: boolean,
): boolean {
  if (!UNLOCKABLE_CARD_TYPES.includes(cardType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.CARD, cardType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getNumCardsUnlocked(forRun: boolean): int {
  const unlockedCardTypes = getUnlockedCardTypes(forRun);
  const unlockedCards = unlockedCardTypes.filter((cardType) =>
    isCard(cardType),
  );

  return unlockedCards.length;
}

export function getUnlockedCardTypes(forRun: boolean): CardType[] {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlockedCardTypes: CardType[] = [];

  for (const completedUnlockID of completedUnlockIDs) {
    const completedUnlock = getUnlockFromID(completedUnlockID);
    if (completedUnlock.type === UnlockType.CARD) {
      unlockedCardTypes.push(completedUnlock.cardType);
    }
  }

  return unlockedCardTypes;
}

export function getWorseLockedCardType(
  cardType: CardType,
): CardType | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse card type since the seed was null.",
  );

  const quality = CARD_QUALITIES[cardType];

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityCardTypes = getCardTypesOfQuality(lowerQuality);
    const unlockedLowerQualityCardTypes = lowerQualityCardTypes.filter(
      (lowerQualityCardType) => isCardTypeUnlocked(lowerQualityCardType, false),
    );

    if (
      unlockedLowerQualityCardTypes.length <
      lowerQualityCardTypes.length * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityCardTypes = lowerQualityCardTypes.filter(
        (lowerQualityCardType) =>
          !isCardTypeUnlocked(lowerQualityCardType, false),
      );

      return getRandomArrayElement(
        lockedLowerQualityCardTypes,
        v.persistent.seed,
      );
    }
  }

  return undefined;
}

// ------------------------------
// Unlock - Pill effect functions
// ------------------------------

export function anyPillEffectsUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some(
    (unlock) => unlock.type === UnlockType.PILL_EFFECT,
  );
}

export function anyGoodPillEffectsUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some(
    (unlock) =>
      unlock.type === UnlockType.PILL_EFFECT &&
      getPillEffectType(unlock.pillEffect) ===
        ItemConfigPillEffectType.POSITIVE,
  );
}

export function anyBadPillEffectsUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some(
    (unlock) =>
      unlock.type === UnlockType.PILL_EFFECT &&
      getPillEffectType(unlock.pillEffect) ===
        ItemConfigPillEffectType.NEGATIVE,
  );
}

export function isPillEffectUnlocked(
  pillEffect: PillEffect,
  forRun: boolean,
): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.PILL_EFFECT, pillEffect);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function isAllPillEffectsUnlocked(forRun: boolean): boolean {
  const pillEffects = getUnlockedPillEffects(forRun);
  return pillEffects.length === UNLOCKABLE_PILL_EFFECTS.length;
}

export function getUnlockedPillEffects(forRun: boolean): PillEffect[] {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlockedPillEffects: PillEffect[] = [];

  for (const completedUnlockID of completedUnlockIDs) {
    const completedUnlock = getUnlockFromID(completedUnlockID);
    if (completedUnlock.type === UnlockType.PILL_EFFECT) {
      unlockedPillEffects.push(completedUnlock.pillEffect);
    }
  }

  return unlockedPillEffects;
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
  const unlockedPillEffects = getUnlockedPillEffects(forRun);
  const unlockedPillEffectsSet = new Set(unlockedPillEffects);

  return UNLOCKABLE_PILL_EFFECTS.filter(
    (pillEffect) => !unlockedPillEffectsSet.has(pillEffect),
  );
}

// -------------------------------
// Unlock - Other pickup functions
// -------------------------------

export function isHeartSubTypeUnlocked(
  heartSubType: HeartSubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_HEART_SUB_TYPES, heartSubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.HEART, heartSubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function anySoulHeartUnlocked(forRun: boolean): boolean {
  return SOUL_HEART_SUB_TYPES.some((heartSubType) =>
    isHeartSubTypeUnlocked(heartSubType, forRun),
  );
}

export function getWorseLockedHeartSubType(
  heartSubType: HeartSubType,
): HeartSubType | undefined {
  const quality = UNLOCKABLE_HEART_SUB_TYPES.indexOf(
    heartSubType as (typeof UNLOCKABLE_HEART_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for heart sub-type: ${heartSubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityHeartSubType = UNLOCKABLE_HEART_SUB_TYPES[lowerQuality];
    if (
      lowerQualityHeartSubType !== undefined &&
      !isHeartSubTypeUnlocked(lowerQualityHeartSubType, false)
    ) {
      return lowerQualityHeartSubType;
    }
  }

  return undefined;
}

export function isCoinSubTypeUnlocked(
  coinSubType: CoinSubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_COIN_SUB_TYPES, coinSubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.COIN, coinSubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedCoinSubType(
  coinSubType: CoinSubType,
): CoinSubType | undefined {
  const quality = UNLOCKABLE_COIN_SUB_TYPES.indexOf(
    coinSubType as (typeof UNLOCKABLE_COIN_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for coin sub-type: ${coinSubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityCoinSubType = UNLOCKABLE_COIN_SUB_TYPES[lowerQuality];
    if (
      lowerQualityCoinSubType !== undefined &&
      !isCoinSubTypeUnlocked(lowerQualityCoinSubType, false)
    ) {
      return lowerQualityCoinSubType;
    }
  }

  return undefined;
}

export function isBombSubTypeUnlocked(
  bombSubType: BombSubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_BOMB_SUB_TYPES, bombSubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.BOMB, bombSubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedBombSubType(
  bombSubType: BombSubType,
): BombSubType | undefined {
  const quality = UNLOCKABLE_BOMB_SUB_TYPES.indexOf(
    bombSubType as (typeof UNLOCKABLE_BOMB_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for bomb sub-type: ${bombSubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityBombSubType = UNLOCKABLE_BOMB_SUB_TYPES[lowerQuality];
    if (
      lowerQualityBombSubType !== undefined &&
      !isBombSubTypeUnlocked(lowerQualityBombSubType, false)
    ) {
      return lowerQualityBombSubType;
    }
  }

  return undefined;
}

export function isKeySubTypeUnlocked(
  keySubType: KeySubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_KEY_SUB_TYPES, keySubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.KEY, keySubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedKeySubType(
  keySubType: KeySubType,
): KeySubType | undefined {
  const quality = UNLOCKABLE_KEY_SUB_TYPES.indexOf(
    keySubType as (typeof UNLOCKABLE_KEY_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for key sub-type: ${keySubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityKeySubType = UNLOCKABLE_KEY_SUB_TYPES[lowerQuality];
    if (
      lowerQualityKeySubType !== undefined &&
      !isKeySubTypeUnlocked(lowerQualityKeySubType, false)
    ) {
      return lowerQualityKeySubType;
    }
  }

  return undefined;
}

export function isBatterySubTypeUnlocked(
  batterySubType: BatterySubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_BATTERY_SUB_TYPES, batterySubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.BATTERY, batterySubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedBatterySubType(
  batterySubType: BatterySubType,
): BatterySubType | undefined {
  const quality = UNLOCKABLE_BATTERY_SUB_TYPES.indexOf(
    batterySubType as (typeof UNLOCKABLE_BATTERY_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for battery sub-type: ${batterySubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityBatterySubType =
      UNLOCKABLE_BATTERY_SUB_TYPES[lowerQuality];
    if (
      lowerQualityBatterySubType !== undefined &&
      !isBatterySubTypeUnlocked(lowerQualityBatterySubType, false)
    ) {
      return lowerQualityBatterySubType;
    }
  }

  return undefined;
}

export function isSackSubTypeUnlocked(
  sackSubType: SackSubType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_SACK_SUB_TYPES, sackSubType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.SACK, sackSubType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedSackSubType(
  sackSubType: SackSubType,
): SackSubType | undefined {
  const quality = UNLOCKABLE_SACK_SUB_TYPES.indexOf(
    sackSubType as (typeof UNLOCKABLE_SACK_SUB_TYPES)[number],
  );
  if (quality === -1) {
    error(`Failed to get the quality for battery sub-type: ${sackSubType}`);
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualitySackSubType = UNLOCKABLE_SACK_SUB_TYPES[lowerQuality];
    if (
      lowerQualitySackSubType !== undefined &&
      !isSackSubTypeUnlocked(lowerQualitySackSubType, false)
    ) {
      return lowerQualitySackSubType;
    }
  }

  return undefined;
}

export function anyChestPickupVariantUnlocked(forRun: boolean): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const completedUnlocks = completedUnlockIDs.map((unlockID) =>
    getUnlockFromID(unlockID),
  );

  return completedUnlocks.some((unlock) => unlock.type === UnlockType.CHEST);
}

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_CHEST_PICKUP_VARIANTS, pickupVariant)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.CHEST, pickupVariant);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

export function getWorseLockedChestPickupVariant(
  pickupVariant: PickupVariant,
): PickupVariant | undefined {
  const quality = UNLOCKABLE_CHEST_PICKUP_VARIANTS.indexOf(
    pickupVariant as (typeof UNLOCKABLE_CHEST_PICKUP_VARIANTS)[number],
  );
  if (quality === -1) {
    error(
      `Failed to get the quality for chest pickup variant: ${pickupVariant}`,
    );
  }

  for (const lowerQuality of eRange(quality)) {
    const lowerQualityChestPickupVariant =
      UNLOCKABLE_CHEST_PICKUP_VARIANTS[lowerQuality];
    if (
      lowerQualityChestPickupVariant !== undefined &&
      !isChestPickupVariantUnlocked(lowerQualityChestPickupVariant, false)
    ) {
      return lowerQualityChestPickupVariant;
    }
  }

  return undefined;
}

// -----------------------
// Unlock - Slot functions
// -----------------------

export function isSlotVariantUnlocked(
  slotVariant: SlotVariant,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_SLOT_VARIANTS, slotVariant)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.SLOT, slotVariant);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// ------------------------------
// Unlock - Grid entity functions
// ------------------------------

export function isGridEntityTypeUnlocked(
  gridEntityType: GridEntityType,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_GRID_ENTITY_TYPES, gridEntityType)) {
    return true;
  }

  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.GRID_ENTITY, gridEntityType);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}

// ------------------------
// Unlock - Other functions
// ------------------------

export function isOtherUnlockKindUnlocked(
  otherUnlockKind: OtherUnlockKind,
  forRun: boolean,
): boolean {
  const completedUnlockIDs = forRun
    ? v.persistent.completedUnlockIDsForRun
    : v.persistent.completedUnlockIDs;

  const unlock = getUnlock(UnlockType.OTHER, otherUnlockKind);
  const unlockID = getUnlockID(unlock);

  return completedUnlockIDs.includes(unlockID);
}
