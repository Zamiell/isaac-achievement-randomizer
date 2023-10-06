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
  MAX_QUALITY,
  ReadonlySet,
  assertNotNull,
  collectibleHasTag,
  eRange,
  filterMap,
  getCollectibleQuality,
  getPillEffectType,
  getRandomArrayElement,
  getVanillaCollectibleTypesOfQuality,
  getVanillaPillEffectsOfType,
  includes,
  isActiveCollectible,
  isCard,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRune,
} from "isaacscript-common";
import { AchievementType } from "../../../enums/AchievementType";
import type { AltFloor } from "../../../enums/AltFloor";
import { getAltFloor } from "../../../enums/AltFloor";
import type { OtherAchievementKind } from "../../../enums/OtherAchievementKind";
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
import { v } from "./v";

const QUALITY_THRESHOLD_PERCENT = 0.75;

const GOOD_COLLECTIBLES = new ReadonlySet([
  CollectibleType.CHOCOLATE_MILK, // 69 (quality 3)
  CollectibleType.BOOK_OF_REVELATIONS, // 78 (quality 3)
  CollectibleType.RELIC, // 98 (quality 3)
  CollectibleType.GNAWED_LEAF, // 210 (quality 1)
  CollectibleType.CRICKETS_BODY, // 224 (quality 3)
  CollectibleType.MONSTROS_LUNG, // 229 (quality 2)
  CollectibleType.DEATHS_TOUCH, // 237 (quality 3)
  CollectibleType.TECH_5, // 244 (quality 3)
  CollectibleType.PROPTOSIS, // 261 (quality 3)
  CollectibleType.CANCER, // 301 (quality 3)
  CollectibleType.DEAD_EYE, // 373 (quality 3)
  CollectibleType.MAW_OF_THE_VOID, // 399 (quality 3)
  CollectibleType.ROCK_BOTTOM, // 562 (quality 3)
  CollectibleType.SPIRIT_SWORD, // 579 (quality 3)
  CollectibleType.ECHO_CHAMBER, // 700 (quality 3)
  CollectibleType.TMTRAINER, // 721 (quality 0)
]);

// ---------------------------------
// Achievement - Character functions
// ---------------------------------

export function isCharacterUnlocked(
  character: PlayerType,
  forRun = true,
): boolean {
  if (!UNLOCKABLE_CHARACTERS.includes(character)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CHARACTER &&
      achievement.character === character,
  );
}

// ----------------------------
// Achievement - Path functions
// ----------------------------

export function isPathUnlocked(
  unlockablePath: UnlockablePath,
  forRun = true,
): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.PATH &&
      achievement.unlockablePath === unlockablePath,
  );
}

// ---------------------------------
// Achievement - Alt floor functions
// ---------------------------------

export function isAltFloorUnlocked(altFloor: AltFloor, forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.ALT_FLOOR &&
      achievement.altFloor === altFloor,
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

// ---------------------------------
// Achievement - Challenge functions
// ---------------------------------

export function isChallengeUnlocked(
  challenge: Challenge,
  forRun = true,
): boolean {
  if (!UNLOCKABLE_CHALLENGES.includes(challenge)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CHALLENGE &&
      achievement.challenge === challenge,
  );
}

// -----------------------------------
// Achievement - Collectible functions
// -----------------------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
  forRun = true,
): boolean {
  if (ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.COLLECTIBLE &&
      achievement.collectibleType === collectibleType,
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
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.COLLECTIBLE
      ? achievement.collectibleType
      : undefined,
  );
}

export function getWorseLockedCollectibleType(
  collectibleType: CollectibleType,
): CollectibleType | undefined {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a worse collectible type since the seed was null.",
  );

  // Some collectibles result in a won run and should be treated as maximum quality.
  const quality = GOOD_COLLECTIBLES.has(collectibleType)
    ? MAX_QUALITY
    : getCollectibleQuality(collectibleType);

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityCollectibleTypes =
      getVanillaCollectibleTypesOfQuality(lowerQuality);
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

// -------------------------------
// Achievement - Trinket functions
// -------------------------------

export function anyTrinketTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) => achievement.type === AchievementType.TRINKET,
  );
}

export function isTrinketTypeUnlocked(
  trinketType: TrinketType,
  forRun = true,
): boolean {
  if (ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.TRINKET &&
      achievement.trinketType === trinketType,
  );
}

export function getUnlockedTrinketTypes(): TrinketType[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.TRINKET
      ? achievement.trinketType
      : undefined,
  );
}

// ----------------------------
// Achievement - Card functions
// ----------------------------

export function anyCardTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some((achievement) => achievement.type === AchievementType.CARD);
}

export function anyCardsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD && isCard(achievement.cardType),
  );
}

export function anyRunesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD && isRune(achievement.cardType),
  );
}

export function isCardTypeUnlocked(cardType: CardType, forRun = true): boolean {
  if (!UNLOCKABLE_CARD_TYPES.includes(cardType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD &&
      achievement.cardType === cardType,
  );
}

export function getUnlockedCardTypes(): CardType[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.CARD
      ? achievement.cardType
      : undefined,
  );
}

// -----------------------------------
// Achievement - Pill effect functions
// -----------------------------------

export function anyPillEffectsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) => achievement.type === AchievementType.PILL_EFFECT,
  );
}

export function anyGoodPillEffectsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.PILL_EFFECT &&
      getPillEffectType(achievement.pillEffect) ===
        ItemConfigPillEffectType.POSITIVE,
  );
}

export function anyBadPillEffectsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.PILL_EFFECT &&
      getPillEffectType(achievement.pillEffect) ===
        ItemConfigPillEffectType.NEGATIVE,
  );
}

export function isPillEffectUnlocked(
  pillEffect: PillEffect,
  forRun = true,
): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.PILL_EFFECT &&
      achievement.pillEffect === pillEffect,
  );
}

export function getUnlockedPillEffects(): PillEffect[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.PILL_EFFECT
      ? achievement.pillEffect
      : undefined,
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

// ------------------------------------
// Achievement - Other pickup functions
// ------------------------------------

export function isHeartSubTypeUnlocked(
  heartSubType: HeartSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_HEART_SUB_TYPES, heartSubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.HEART &&
      achievement.heartSubType === heartSubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.COIN &&
      achievement.coinSubType === coinSubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.BOMB &&
      achievement.bombSubType === bombSubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.KEY &&
      achievement.keySubType === keySubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.BATTERY &&
      achievement.batterySubType === batterySubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.SACK &&
      achievement.sackSubType === sackSubType,
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
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CHEST &&
      achievement.pickupVariant === pickupVariant,
  );
}

// ----------------------------
// Achievement - Slot functions
// ----------------------------

export function isSlotVariantUnlocked(
  slotVariant: SlotVariant,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_SLOT_VARIANTS, slotVariant)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.SLOT &&
      achievement.slotVariant === slotVariant,
  );
}

// -----------------------------------
// Achievement - Grid entity functions
// -----------------------------------

export function isGridEntityTypeUnlocked(
  gridEntityType: GridEntityType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_GRID_ENTITY_TYPES, gridEntityType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.GRID_ENTITY &&
      achievement.gridEntityType === gridEntityType,
  );
}

// -----------------------------
// Achievement - Other functions
// -----------------------------

export function isOtherAchievementUnlocked(
  otherAchievementKind: OtherAchievementKind,
  forRun = true,
): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.OTHER &&
      achievement.kind === otherAchievementKind,
  );
}
