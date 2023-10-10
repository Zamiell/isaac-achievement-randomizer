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
  LevelStage,
  PickupVariant,
  PillEffect,
  PlayerType,
  RoomType,
  SackSubType,
  SlotVariant,
  StageType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  ItemConfigPillEffectType,
  ItemConfigTag,
} from "isaac-typescript-definitions";
import {
  assertNotNull,
  collectibleHasTag,
  eRange,
  filterMap,
  getPillEffectType,
  getRandomArrayElement,
  includes,
  isActiveCollectible,
  isCard,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRune,
} from "isaacscript-common";
import { PILL_EFFECT_QUALITIES } from "../../../arrays/pillEffectQualities";
import { UNLOCKABLE_CARD_TYPES } from "../../../arrays/unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "../../../arrays/unlockableChallenges";
import { UNLOCKABLE_CHARACTERS } from "../../../arrays/unlockableCharacters";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../../arrays/unlockableCollectibleTypes";
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
import { UNLOCKABLE_SLOT_VARIANTS } from "../../../arrays/unlockableSlotVariants";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../../arrays/unlockableTrinketTypes";
import type { AltFloor } from "../../../enums/AltFloor";
import { getAltFloor } from "../../../enums/AltFloor";
import type { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import type { UnlockablePath } from "../../../enums/UnlockablePath";
import { CARD_QUALITIES } from "../../../objects/cardQualities";
import { TRINKET_QUALITIES } from "../../../objects/trinketQualities";
import { getCardTypesOfQuality } from "./cardQuality";
import {
  getAdjustedCollectibleQuality,
  getAdjustedCollectibleTypesOfQuality,
} from "./collectibleQuality";
import { getPillEffectsOfQuality } from "./pillEffectQuality";
import { getTrinketTypesOfQuality } from "./trinketQuality";
import { v } from "./v";

const QUALITY_THRESHOLD_PERCENT = 0.5;

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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.CHARACTER && unlock.character === character,
  );
}

// -----------------------
// Unlock - Path functions
// -----------------------

export function isPathUnlocked(
  unlockablePath: UnlockablePath,
  forRun: boolean,
): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.PATH &&
      unlock.unlockablePath === unlockablePath,
  );
}

// ----------------------------
// Unlock - Alt floor functions
// ----------------------------

export function isAltFloorUnlocked(
  altFloor: AltFloor,
  forRun: boolean,
): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.ALT_FLOOR && unlock.altFloor === altFloor,
  );
}

export function isStageTypeUnlocked(
  stage: LevelStage,
  stageType: StageType,
  forRun: boolean,
): boolean {
  const altFloor = getAltFloor(stage, stageType);
  if (altFloor === undefined) {
    return true;
  }

  return isAltFloorUnlocked(altFloor, forRun);
}

// -----------------------
// Unlock - Room functions
// -----------------------

export function isRoomTypeUnlocked(
  roomType: RoomType,
  forRun: boolean,
): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) => unlock.type === UnlockType.ROOM && unlock.roomType === roomType,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.CHALLENGE && unlock.challenge === challenge,
  );
}

// ------------------------------
// Unlock - Collectible functions
// ------------------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
  forRun: boolean,
): boolean {
  if (ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.COLLECTIBLE &&
      unlock.collectibleType === collectibleType,
  );
}

export function getUnlockedEdenActiveCollectibleTypes(): CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes();

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isActiveCollectible(collectibleType),
  );
}

export function getUnlockedEdenPassiveCollectibleTypes(): CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes();

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isPassiveOrFamiliarCollectible(collectibleType),
  );
}

function getUnlockedCollectibleTypes(): CollectibleType[] {
  return filterMap(v.persistent.completedUnlocksForRun, (unlock) =>
    unlock.type === UnlockType.COLLECTIBLE ? unlock.collectibleType : undefined,
  );
}

export function getWorseLockedCollectibleType(
  collectibleType: CollectibleType,
): CollectibleType | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse collectible type since the seed was null.",
  );

  const quality = getAdjustedCollectibleQuality(collectibleType);

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityCollectibleTypes =
      getAdjustedCollectibleTypesOfQuality(lowerQuality);
    const unlockedLowerQualityCollectibleTypes = [
      ...lowerQualityCollectibleTypes,
    ].filter((lowerQualityCollectibleType) =>
      isCollectibleTypeUnlocked(lowerQualityCollectibleType, false),
    );

    if (
      unlockedLowerQualityCollectibleTypes.length <
      lowerQualityCollectibleTypes.size * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityCollectibleTypes = [
        ...lowerQualityCollectibleTypes,
      ].filter(
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
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.TRINKET);
}

export function isTrinketTypeUnlocked(
  trinketType: TrinketType,
  forRun: boolean,
): boolean {
  if (ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.TRINKET && unlock.trinketType === trinketType,
  );
}

export function getUnlockedTrinketTypes(): TrinketType[] {
  return filterMap(v.persistent.completedUnlocksForRun, (unlock) =>
    unlock.type === UnlockType.TRINKET ? unlock.trinketType : undefined,
  );
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
    const unlockedLowerQualityTrinketTypes = [
      ...lowerQualityTrinketTypes,
    ].filter((lowerQualityTrinketType) =>
      isTrinketTypeUnlocked(lowerQualityTrinketType, false),
    );

    if (
      unlockedLowerQualityTrinketTypes.length <
      lowerQualityTrinketTypes.size * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityTrinketTypes = [
        ...lowerQualityTrinketTypes,
      ].filter(
        (lowerQualityTrinketType) =>
          !isTrinketTypeUnlocked(lowerQualityTrinketType, false),
      );

      return getRandomArrayElement(
        lockedLowerQualityTrinketTypes,
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
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.CARD);
}

export function anyCardsUnlocked(forRun: boolean): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) => unlock.type === UnlockType.CARD && isCard(unlock.cardType),
  );
}

export function anyRunesUnlocked(forRun: boolean): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) => unlock.type === UnlockType.CARD && unlock.cardType === cardType,
  );
}

export function getUnlockedCardTypes(): CardType[] {
  return filterMap(v.persistent.completedUnlocksForRun, (unlock) =>
    unlock.type === UnlockType.CARD ? unlock.cardType : undefined,
  );
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
    const unlockedLowerQualityCardTypes = [...lowerQualityCardTypes].filter(
      (lowerQualityCardType) => isCardTypeUnlocked(lowerQualityCardType, false),
    );

    if (
      unlockedLowerQualityCardTypes.length <
      lowerQualityCardTypes.size * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityCardTypes = [...lowerQualityCardTypes].filter(
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
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.PILL_EFFECT);
}

export function anyGoodPillEffectsUnlocked(forRun: boolean): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.PILL_EFFECT &&
      getPillEffectType(unlock.pillEffect) ===
        ItemConfigPillEffectType.POSITIVE,
  );
}

export function anyBadPillEffectsUnlocked(forRun: boolean): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
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
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.PILL_EFFECT &&
      unlock.pillEffect === pillEffect,
  );
}

export function getUnlockedPillEffects(): PillEffect[] {
  return filterMap(v.persistent.completedUnlocksForRun, (unlock) =>
    unlock.type === UnlockType.PILL_EFFECT ? unlock.pillEffect : undefined,
  );
}

export function getWorseLockedPillEffect(
  pillEffect: PillEffect,
): PillEffect | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse pill effect since the seed was null.",
  );

  const quality = PILL_EFFECT_QUALITIES[pillEffect];

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityPillEffects = getPillEffectsOfQuality(lowerQuality);
    const unlockedLowerQualityPillEffects = [...lowerQualityPillEffects].filter(
      (lowerQualityPillEffect) =>
        isPillEffectUnlocked(lowerQualityPillEffect, false),
    );

    if (
      unlockedLowerQualityPillEffects.length <
      lowerQualityPillEffects.size * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedLowerQualityTrinketTypes = [
        ...lowerQualityPillEffects,
      ].filter(
        (lowerQualityPillEffect) =>
          !isPillEffectUnlocked(lowerQualityPillEffect, false),
      );

      return getRandomArrayElement(
        lockedLowerQualityTrinketTypes,
        v.persistent.seed,
      );
    }
  }

  return undefined;
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.HEART && unlock.heartSubType === heartSubType,
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.COIN && unlock.coinSubType === coinSubType,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.BOMB && unlock.bombSubType === bombSubType,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.KEY && unlock.keySubType === keySubType,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.BATTERY &&
      unlock.batterySubType === batterySubType,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.SACK && unlock.sackSubType === sackSubType,
  );
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

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
  forRun: boolean,
): boolean {
  if (!includes(UNLOCKABLE_CHEST_PICKUP_VARIANTS, pickupVariant)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.CHEST &&
      unlock.pickupVariant === pickupVariant,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.SLOT && unlock.slotVariant === slotVariant,
  );
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

  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.GRID_ENTITY &&
      unlock.gridEntityType === gridEntityType,
  );
}

// ------------------------
// Unlock - Other functions
// ------------------------

export function isOtherUnlockKindUnlocked(
  otherUnlockKind: OtherUnlockKind,
  forRun: boolean,
): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.OTHER && unlock.kind === otherUnlockKind,
  );
}
