import type {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  GridEntityType,
  HeartSubType,
  KeySubType,
  LevelStage,
  PickupVariant,
  PillEffect,
  PlayerType,
  SackSubType,
  SlotVariant,
  StageType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CollectibleType,
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
  getVanillaPillEffectsOfType,
  includes,
  isActiveCollectible,
  isCard,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRune,
} from "isaacscript-common";
import type { AltFloor } from "../../../enums/AltFloor";
import { getAltFloor } from "../../../enums/AltFloor";
import type { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import type { UnlockablePath } from "../../../enums/UnlockablePath";
import { UNLOCKABLE_CARD_TYPES } from "../../../unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "../../../unlockableChallenges";
import { UNLOCKABLE_CHARACTERS } from "../../../unlockableCharacters";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../../unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "../../../unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_KEY_SUB_TYPES,
} from "../../../unlockablePickupTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "../../../unlockableSlotVariants";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../../unlockableTrinketTypes";
import {
  getAdjustedCollectibleQuality,
  getAdjustedCollectibleTypesOfQuality,
} from "./collectibleQuality";
import { v } from "./v";

const QUALITY_THRESHOLD_PERCENT = 0.75;

// ----------------------------
// Unlock - Character functions
// ----------------------------

export function isCharacterUnlocked(
  character: PlayerType,
  forRun = true,
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
  forRun = true,
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

export function isAltFloorUnlocked(altFloor: AltFloor, forRun = true): boolean {
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
): boolean {
  const altFloor = getAltFloor(stage, stageType);
  if (altFloor === undefined) {
    return true;
  }

  return isAltFloorUnlocked(altFloor);
}

// ----------------------------
// Unlock - Challenge functions
// ----------------------------

export function isChallengeUnlocked(
  challenge: Challenge,
  forRun = true,
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
  forRun = true,
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
      isPassiveOrFamiliarCollectible(collectibleType) &&
      collectibleType !== CollectibleType.TMTRAINER,
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

export function anyTrinketTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.TRINKET);
}

export function isTrinketTypeUnlocked(
  trinketType: TrinketType,
  forRun = true,
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

// -----------------------
// Unlock - Card functions
// -----------------------

export function anyCardTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.CARD);
}

export function anyCardsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) => unlock.type === UnlockType.CARD && isCard(unlock.cardType),
  );
}

export function anyRunesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) => unlock.type === UnlockType.CARD && isRune(unlock.cardType),
  );
}

export function isCardTypeUnlocked(cardType: CardType, forRun = true): boolean {
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

// ------------------------------
// Unlock - Pill effect functions
// ------------------------------

export function anyPillEffectsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some((unlock) => unlock.type === UnlockType.PILL_EFFECT);
}

export function anyGoodPillEffectsUnlocked(forRun = true): boolean {
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

export function anyBadPillEffectsUnlocked(forRun = true): boolean {
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
  forRun = true,
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

  // Some collectibles result in a won run and should be treated as maximum quality.
  const pillEffectType = getPillEffectType(pillEffect);
  const worsePillEffectTypes =
    getWorseItemConfigPillEffectTypes(pillEffectType);

  for (const worsePillEffectType of worsePillEffectTypes) {
    const worsePillEffects = getVanillaPillEffectsOfType(worsePillEffectType);
    const unlockedWorsePillEffects = worsePillEffects.filter(
      (worsePillEffect) => isPillEffectUnlocked(worsePillEffect, false),
    );

    if (
      unlockedWorsePillEffects.length <
      worsePillEffects.length * QUALITY_THRESHOLD_PERCENT
    ) {
      const lockedWorsePillEffects = worsePillEffects.filter(
        (worsePillEffect) => !isPillEffectUnlocked(worsePillEffect, false),
      );

      return getRandomArrayElement(lockedWorsePillEffects, v.persistent.seed);
    }
  }

  return undefined;
}

function getWorseItemConfigPillEffectTypes(
  pillEffectType: ItemConfigPillEffectType,
): ItemConfigPillEffectType[] {
  switch (pillEffectType) {
    // -1, 1, 3
    case ItemConfigPillEffectType.NULL:
    case ItemConfigPillEffectType.NEGATIVE:
    case ItemConfigPillEffectType.MODDED: {
      return [];
    }

    // 0
    case ItemConfigPillEffectType.POSITIVE: {
      return [
        ItemConfigPillEffectType.NEUTRAL,
        ItemConfigPillEffectType.NEGATIVE,
      ];
    }

    // 2
    case ItemConfigPillEffectType.NEUTRAL: {
      return [ItemConfigPillEffectType.NEGATIVE];
    }
  }
}

// -------------------------------
// Unlock - Other pickup functions
// -------------------------------

export function isHeartSubTypeUnlocked(
  heartSubType: HeartSubType,
  forRun = true,
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

export function isCoinSubTypeUnlocked(
  coinSubType: CoinSubType,
  forRun = true,
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

export function isBombSubTypeUnlocked(
  bombSubType: BombSubType,
  forRun = true,
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

export function isKeySubTypeUnlocked(
  keySubType: KeySubType,
  forRun = true,
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

export function isBatterySubTypeUnlocked(
  batterySubType: BatterySubType,
  forRun = true,
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

export function isSackSubTypeUnlocked(
  sackSubType: SackSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_SACK_KEY_SUB_TYPES, sackSubType)) {
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

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
  forRun = true,
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

// -----------------------
// Unlock - Slot functions
// -----------------------

export function isSlotVariantUnlocked(
  slotVariant: SlotVariant,
  forRun = true,
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
  forRun = true,
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
  forRun = true,
): boolean {
  const array = forRun
    ? v.persistent.completedUnlocksForRun
    : v.persistent.completedUnlocks;

  return array.some(
    (unlock) =>
      unlock.type === UnlockType.OTHER && unlock.kind === otherUnlockKind,
  );
}
