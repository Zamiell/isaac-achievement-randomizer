// This file contains logic for "swapping" achievements. This allows us to prevent the situation
// where you can unlock useless items. For example, if you unlock The Relic before unlocking soul
// hearts, the unlock will be swapped and you will actually unlock soul hearts, and the objective
// that would have normally unlocked soul hearts will instead unlock The Relic.

import {
  BatterySubType,
  BombSubType,
  CardType,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  HeartSubType,
  ItemConfigTag,
  ItemPoolType,
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
  ReadonlyMap,
  collectibleHasTag,
  getChallengeBoss,
  getChallengeCharacter,
  getChallengeCollectibleTypes,
  getChallengeTrinketType,
  getCollectibleQuality,
  getRandomArrayElement,
  includes,
  isActiveCollectible,
  isCollectibleTypeInDefaultItemPool,
  isFamiliarCollectible,
  isRune,
  isStoryBossID,
  shuffleArray,
} from "isaacscript-common";
import { CORE_STAT_COLLECTIBLES } from "../../../arrays/unlockableCollectibleTypes";
import { UNLOCKABLE_ROOM_TYPES } from "../../../arrays/unlockableRoomTypes";
import { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import {
  STATIC_UNLOCKABLE_AREAS,
  UnlockableArea,
  getUnlockableAreaFromStoryBoss,
} from "../../../enums/UnlockableArea";
import { CARD_QUALITIES } from "../../../objects/cardQualities";
import { PILL_EFFECT_QUALITIES } from "../../../objects/pillEffectQualities";
import { TRINKET_QUALITIES } from "../../../objects/trinketQualities";
import {
  DICE_CARDS,
  DICE_COLLECTIBLES,
  DICE_TRINKETS,
} from "../../../sets/diceObjects";
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
} from "../../../types/Unlock";
import { getUnlock, getUnlockFromID } from "../../../types/Unlock";
import type { UnlockID } from "../../../types/UnlockID";
import { getUnlockID } from "../../../types/UnlockID";
import {
  anyActiveCollectibleUnlocked,
  anyBadPillEffectsUnlocked,
  anyCardTypesUnlocked,
  anyCardsUnlocked,
  anyChestPickupVariantUnlocked,
  anyFamiliarCollectibleUnlocked,
  anyGoodPillEffectsUnlocked,
  anyPillEffectsUnlocked,
  anyRunesUnlocked,
  anySoulHeartUnlocked,
  anyTrinketTypesUnlocked,
  getLockedCardTypes,
  getLockedChestPickupVariants,
  getLockedCollectibleTypes,
  getLockedPillEffects,
  getLockedTrinketTypes,
  getNextCharacterUnlock,
  getNumCardsUnlocked,
  getNumUnlockedCollectibleTypes,
  getNumUnlockedTrinketTypes,
  getUncompletedNonCollectiblesNonTrinkets,
  getWorseLockedBatterySubType,
  getWorseLockedBombSubType,
  getWorseLockedCardType,
  getWorseLockedChestPickupVariant,
  getWorseLockedCoinSubType,
  getWorseLockedCollectibleType,
  getWorseLockedHeartSubType,
  getWorseLockedKeySubType,
  getWorseLockedPillEffect,
  getWorseLockedSackSubType,
  getWorseLockedTrinketType,
  isAreaUnlocked,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGridEntityTypeUnlocked,
  isHeartSubTypeUnlocked,
  isKeySubTypeUnlocked,
  isOtherUnlockKindUnlocked,
  isRoomTypeUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
  isTrinketTypeUnlocked,
} from "./completedUnlocks";
import {
  getCharacterUnlockOrder,
  getNumCollectibleTypesInPlaythrough,
  getNumTrinketTypesInPlaythrough,
  isHardcoreMode,
} from "./v";

const SWAPPED_UNLOCK_FUNCTIONS = {
  [UnlockType.CHARACTER]: getSwappedUnlockCharacter,
  [UnlockType.AREA]: getSwappedUnlockArea,
  [UnlockType.ROOM]: getSwappedUnlockRoom,
  [UnlockType.CHALLENGE]: getSwappedUnlockChallenge,
  [UnlockType.COLLECTIBLE]: getSwappedUnlockCollectible,
  [UnlockType.TRINKET]: getSwappedUnlockTrinket,
  [UnlockType.CARD]: getSwappedUnlockCard,
  [UnlockType.PILL_EFFECT]: getSwappedUnlockPillEffect,
  [UnlockType.HEART]: getSwappedUnlockHeart,
  [UnlockType.COIN]: getSwappedUnlockCoin,
  [UnlockType.BOMB]: getSwappedUnlockBomb,
  [UnlockType.KEY]: getSwappedUnlockKey,
  [UnlockType.BATTERY]: getSwappedUnlockBattery,
  [UnlockType.SACK]: getSwappedUnlockSack,
  [UnlockType.CHEST]: getSwappedUnlockChest,
  [UnlockType.SLOT]: getSwappedUnlockSlot,
  [UnlockType.GRID_ENTITY]: getSwappedUnlockGridEntity,
  [UnlockType.OTHER]: getSwappedUnlockOther,
} as const satisfies Record<
  UnlockType,
  ((unlock: Unlock, seed: Seed) => void) | undefined
>;

export function getSwappedUnlockID(
  unlockID: UnlockID,
  seed: Seed,
): UnlockID | undefined {
  const unlock = getUnlockFromID(unlockID);
  if (!isUnlockSwappable(unlock)) {
    return undefined;
  }

  // Guarantee some stat collectibles as the very first unlocks.
  const shuffledFirstUnlockCollectibles = shuffleArray(
    CORE_STAT_COLLECTIBLES,
    seed,
  );
  for (const collectibleType of shuffledFirstUnlockCollectibles) {
    if (!isCollectibleTypeUnlocked(collectibleType, false)) {
      const swappedUnlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
      return getUnlockID(swappedUnlock);
    }
  }

  const func = SWAPPED_UNLOCK_FUNCTIONS[unlock.type];
  const swappedUnlock = func(unlock, seed);
  if (swappedUnlock === undefined) {
    return undefined;
  }

  return getUnlockID(swappedUnlock);
}

function isUnlockSwappable(unlock: Unlock): boolean {
  if (
    unlock.type === UnlockType.AREA &&
    includes(STATIC_UNLOCKABLE_AREAS, unlock.unlockableArea)
  ) {
    return false;
  }

  if (
    unlock.type === UnlockType.COLLECTIBLE &&
    includes(CORE_STAT_COLLECTIBLES, unlock.collectibleType)
  ) {
    return false;
  }

  if (
    unlock.type === UnlockType.CHARACTER &&
    unlock.character === getNextCharacterUnlock()
  ) {
    return false;
  }

  return true;
}

function getSwappedUnlockCharacter(
  unlock: Unlock,
  _seed: Seed,
): Unlock | undefined {
  const characterUnlock = unlock as CharacterUnlock;
  const characterUnlockOrder = getCharacterUnlockOrder();

  for (const character of characterUnlockOrder) {
    if (!isCharacterUnlocked(character, false)) {
      return character === characterUnlock.character
        ? undefined
        : getUnlock(UnlockType.CHARACTER, character);
    }
  }

  return undefined;
}

const SWAPPED_UNLOCK_AREA_FUNCTIONS = new ReadonlyMap<
  UnlockableArea,
  (seed: Seed) => Unlock | undefined
>([
  [
    UnlockableArea.ASCENT,
    () =>
      isCardTypeUnlocked(CardType.FOOL, false)
        ? undefined
        : getUnlock(UnlockType.CARD, CardType.FOOL),
  ],
]);

function getSwappedUnlockArea(unlock: Unlock, seed: Seed): Unlock | undefined {
  const areaUnlock = unlock as AreaUnlock;
  const func = SWAPPED_UNLOCK_AREA_FUNCTIONS.get(areaUnlock.unlockableArea);
  return func === undefined ? undefined : func(seed);
}

const SWAPPED_UNLOCK_ROOM_FUNCTIONS = new ReadonlyMap<
  RoomType,
  (seed: Seed) => Unlock | undefined
>([
  // 9
  [
    RoomType.ARCADE,
    () =>
      isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BLOOD_DONATION_MACHINE),
  ],

  // 10
  [
    RoomType.CURSE,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.RED_CHEST),
  ],

  // 20
  [
    RoomType.VAULT,
    (seed) =>
      anyChestPickupVariantUnlocked(false)
        ? undefined
        : getRandomChestUnlock(seed),
  ],

  // 22
  [
    RoomType.BLACK_MARKET,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.CRAWL_SPACE),
  ],
]);

function getSwappedUnlockRoom(unlock: Unlock, seed: Seed): Unlock | undefined {
  const roomUnlock = unlock as RoomUnlock;
  const func = SWAPPED_UNLOCK_ROOM_FUNCTIONS.get(roomUnlock.roomType);
  return func === undefined ? undefined : func(seed);
}

function getSwappedUnlockChallenge(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const challengeUnlock = unlock as ChallengeUnlock;

  const challengeCharacter = getChallengeCharacter(challengeUnlock.challenge);
  if (!isCharacterUnlocked(challengeCharacter, false)) {
    return getUnlock(UnlockType.CHARACTER, challengeCharacter);
  }

  // All the challenge bosses are story bosses.
  const challengeBossID = getChallengeBoss(challengeUnlock.challenge);
  if (!isStoryBossID(challengeBossID)) {
    error(
      `The challenge boss ID of "${challengeBossID}" was not a story boss ID.`,
    );
  }

  const unlockableArea = getUnlockableAreaFromStoryBoss(challengeBossID);
  if (unlockableArea !== undefined && !isAreaUnlocked(unlockableArea, false)) {
    return getUnlock(UnlockType.AREA, unlockableArea);
  }

  const collectibleTypes = getChallengeCollectibleTypes(
    challengeUnlock.challenge,
  );
  const shuffledCollectibleTypes = shuffleArray(collectibleTypes, seed);

  for (const collectibleType of shuffledCollectibleTypes) {
    if (!isCollectibleTypeUnlocked(collectibleType, false)) {
      return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
    }
  }

  const trinketType = getChallengeTrinketType(challengeUnlock.challenge);
  if (trinketType !== undefined && !isTrinketTypeUnlocked(trinketType, false)) {
    return getUnlock(UnlockType.TRINKET, trinketType);
  }

  return undefined;
}

const SWAPPED_UNLOCK_COLLECTIBLE_FUNCTIONS = new ReadonlyMap<
  CollectibleType,
  (seed: Seed) => Unlock | undefined
>([
  // 9
  [
    CollectibleType.SKATOLE,
    () =>
      isSlotVariantUnlocked(SlotVariant.SHELL_GAME, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.SHELL_GAME),
  ],

  // 18
  [
    CollectibleType.DOLLAR,
    () => {
      if (!isRoomTypeUnlocked(RoomType.SHOP, false)) {
        return getUnlock(UnlockType.ROOM, RoomType.SHOP);
      }

      if (!isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)) {
        return getUnlock(UnlockType.SLOT, SlotVariant.SLOT_MACHINE);
      }

      return undefined;
    },
  ],

  // 63
  [
    CollectibleType.BATTERY,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 74
  [
    CollectibleType.QUARTER,
    () =>
      isRoomTypeUnlocked(RoomType.SHOP, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SHOP),
  ],

  // 75
  [
    CollectibleType.PHD,
    (seed) =>
      anyGoodPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 84
  [
    CollectibleType.WE_NEED_TO_GO_DEEPER,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.CRAWL_SPACE),
  ],

  // 85
  [
    CollectibleType.DECK_OF_CARDS,
    (seed) =>
      anyCardsUnlocked(false) ? undefined : getRandomCardTypeUnlock(seed),
  ],

  // 90
  [
    CollectibleType.SMALL_ROCK,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.ROCK_TINTED, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.ROCK_TINTED),
  ],

  // 98
  [
    CollectibleType.RELIC,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 102
  [
    CollectibleType.MOMS_BOTTLE_OF_PILLS,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 116
  [
    CollectibleType.NINE_VOLT,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 119
  [
    CollectibleType.BLOOD_BAG,
    () =>
      isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BLOOD_DONATION_MACHINE),
  ],

  // 135
  [
    CollectibleType.IV_BAG,
    () =>
      isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BLOOD_DONATION_MACHINE),
  ],

  // 139
  [
    CollectibleType.MOMS_PURSE,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 156
  [
    CollectibleType.HABIT,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 158
  [
    CollectibleType.CRYSTAL_BALL,
    () =>
      isSlotVariantUnlocked(SlotVariant.FORTUNE_TELLING_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.FORTUNE_TELLING_MACHINE),
  ],

  // 161
  [
    CollectibleType.ANKH,
    () =>
      isCharacterUnlocked(PlayerType.BLUE_BABY, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.BLUE_BABY),
  ],

  // 173
  [
    CollectibleType.MITRE,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 195
  [
    CollectibleType.MOMS_COIN_PURSE,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 199
  [
    CollectibleType.MOMS_KEY,
    (seed) =>
      anyChestPickupVariantUnlocked(false)
        ? undefined
        : getRandomChestUnlock(seed),
  ],

  // 203
  [
    CollectibleType.HUMBLEING_BUNDLE,
    () =>
      isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)
        ? undefined
        : getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK),
  ],

  // 205
  [
    CollectibleType.SHARP_PLUG,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 215
  [
    CollectibleType.GOAT_HEAD,
    () =>
      isRoomTypeUnlocked(RoomType.DEVIL, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.DEVIL),
  ],

  // 250
  [
    CollectibleType.BOGO_BOMBS,
    () =>
      isBombSubTypeUnlocked(BombSubType.DOUBLE_PACK, false)
        ? undefined
        : getUnlock(UnlockType.BOMB, BombSubType.DOUBLE_PACK),
  ],

  // 251
  [
    CollectibleType.STARTER_DECK,
    (seed) =>
      anyCardTypesUnlocked(false) ? undefined : getRandomCardTypeUnlock(seed),
  ],

  // 252
  [
    CollectibleType.LITTLE_BAGGY,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 263
  [
    CollectibleType.CLEAR_RUNE,
    () =>
      anyRunesUnlocked(false)
        ? undefined
        : getUnlock(UnlockType.CARD, CardType.RUNE_BLANK),
  ],

  // 278
  [
    CollectibleType.DARK_BUM,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
  ],

  // 286
  [
    CollectibleType.BLANK_CARD,
    (seed) =>
      anyCardsUnlocked(false) ? undefined : getRandomCardTypeUnlock(seed),
  ],

  // 296
  [
    CollectibleType.CONVERTER,
    () =>
      anySoulHeartUnlocked(false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 311
  [
    CollectibleType.JUDAS_SHADOW,
    () => {
      if (!isCharacterUnlocked(PlayerType.JUDAS, false)) {
        return getUnlock(UnlockType.CHARACTER, PlayerType.JUDAS);
      }

      if (!anySoulHeartUnlocked(false)) {
        return getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL);
      }

      return undefined;
    },
  ],

  // 332
  [
    CollectibleType.LAZARUS_RAGS,
    () =>
      isCharacterUnlocked(PlayerType.LAZARUS, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.LAZARUS),
  ],

  // 348
  [
    CollectibleType.PLACEBO,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 356
  [
    CollectibleType.CAR_BATTERY,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 389
  [
    CollectibleType.RUNE_BAG,
    (seed) => (anyRunesUnlocked(false) ? undefined : getRandomRuneUnlock(seed)),
  ],

  // 416
  [
    CollectibleType.DEEP_POCKETS,
    () =>
      isRoomTypeUnlocked(RoomType.SHOP, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SHOP),
  ],

  // 424
  [
    CollectibleType.SACK_HEAD,
    () =>
      isSackSubTypeUnlocked(SackSubType.NORMAL, false)
        ? undefined
        : getUnlock(UnlockType.SACK, SackSubType.NORMAL),
  ],

  // 439
  [
    CollectibleType.MOMS_BOX,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 448
  [
    CollectibleType.SHARD_OF_GLASS,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.FULL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.FULL),
  ],

  // 451
  [
    CollectibleType.TAROT_CLOTH,
    (seed) =>
      anyCardsUnlocked(false) ? undefined : getRandomCardTypeUnlock(seed),
  ],

  // 454
  [
    CollectibleType.POLYDACTYLY,
    (seed) =>
      anyCardsUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 458
  [
    CollectibleType.BELLY_BUTTON,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 472
  [
    CollectibleType.KING_BABY,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 479
  [
    CollectibleType.SMELTER,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 484
  [
    CollectibleType.WAIT_WHAT,
    () =>
      isCollectibleTypeUnlocked(CollectibleType.BUTTER_BEAN, false)
        ? undefined
        : getUnlock(UnlockType.COLLECTIBLE, CollectibleType.BUTTER_BEAN),
  ],

  // 491
  [
    CollectibleType.ACID_BABY,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 499
  [
    CollectibleType.EUCHARIST,
    () =>
      isRoomTypeUnlocked(RoomType.ANGEL, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.ANGEL),
  ],

  // 500
  [
    CollectibleType.SACK_OF_SACKS,
    () =>
      isSackSubTypeUnlocked(SackSubType.NORMAL, false)
        ? undefined
        : getUnlock(UnlockType.SACK, SackSubType.NORMAL),
  ],

  // 520
  [
    CollectibleType.JUMPER_CABLES,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 534
  [
    CollectibleType.SCHOOLBAG,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 536
  [
    CollectibleType.SACRIFICIAL_ALTAR,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 538
  [
    CollectibleType.MARBLES,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 557
  [
    CollectibleType.FORTUNE_COOKIE,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 580
  [CollectibleType.RED_KEY, swapAnyRoomUnlock],

  // 580
  [
    CollectibleType.VOODOO_HEAD,
    () =>
      isRoomTypeUnlocked(RoomType.CURSE, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.CURSE),
  ],

  // 603
  [
    CollectibleType.BATTERY_PACK,
    () =>
      isBatterySubTypeUnlocked(BatterySubType.NORMAL, false)
        ? undefined
        : getUnlock(UnlockType.BATTERY, BatterySubType.NORMAL),
  ],

  // 624
  [
    CollectibleType.BOOSTER_PACK,
    (seed) =>
      getNumCardsUnlocked(false) >= 4 // Chosen because there are only 4 quality 0 cards.
        ? undefined
        : getRandomCardTypeUnlock(seed),
  ],

  // 647
  [
    CollectibleType.FOUR_FIVE_VOLT,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 654
  [
    CollectibleType.FALSE_PHD,
    (seed) =>
      anyBadPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 673
  [
    CollectibleType.REDEMPTION,
    () =>
      isRoomTypeUnlocked(RoomType.SACRIFICE, false) ||
      isSlotVariantUnlocked(SlotVariant.CONFESSIONAL, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SACRIFICE),
  ],

  // 686
  [
    CollectibleType.SOUL_LOCKET,
    () =>
      anySoulHeartUnlocked(false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 700
  [
    CollectibleType.ECHO_CHAMBER,
    (seed) =>
      anyCardTypesUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 715
  [
    CollectibleType.HOLD,
    () =>
      isCharacterUnlocked(PlayerType.BLUE_BABY_B, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.BLUE_BABY_B),
  ],
]);

function getSwappedUnlockCollectible(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const collectibleUnlock = unlock as CollectibleUnlock;

  // 2
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.SHOP,
    ) &&
    !isRoomTypeUnlocked(RoomType.SHOP, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.SHOP);
  }

  // 4
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.TREASURE,
    ) &&
    !isRoomTypeUnlocked(RoomType.TREASURE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.TREASURE);
  }

  // 7
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.SECRET,
    ) &&
    !isRoomTypeUnlocked(RoomType.SECRET, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.SECRET);
  }

  // 8
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.SECRET,
    ) &&
    !isRoomTypeUnlocked(RoomType.SUPER_SECRET, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.SUPER_SECRET);
  }

  // 10
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.CURSE,
    ) &&
    !isRoomTypeUnlocked(RoomType.CURSE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.CURSE);
  }

  // 11
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.BOSS,
    ) &&
    !isRoomTypeUnlocked(RoomType.CHALLENGE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.CHALLENGE);
  }

  // 12
  if (
    collectibleHasTag(collectibleUnlock.collectibleType, ItemConfigTag.BOOK) &&
    !isRoomTypeUnlocked(RoomType.LIBRARY, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.LIBRARY);
  }

  // 13
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.ANGEL,
    ) &&
    !isRoomTypeUnlocked(RoomType.SACRIFICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.SACRIFICE);
  }

  // 14
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.DEVIL,
    ) &&
    !isRoomTypeUnlocked(RoomType.DEVIL, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.DEVIL);
  }

  // 15
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.ANGEL,
    ) &&
    !isRoomTypeUnlocked(RoomType.ANGEL, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.ANGEL);
  }

  // 20
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.GOLDEN_CHEST,
    ) &&
    !isRoomTypeUnlocked(RoomType.VAULT, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.VAULT);
  }

  // 21
  if (
    DICE_COLLECTIBLES.has(collectibleUnlock.collectibleType) &&
    !isRoomTypeUnlocked(RoomType.DICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.DICE);
  }

  // 24
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.PLANETARIUM,
    ) &&
    !isRoomTypeUnlocked(RoomType.PLANETARIUM, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.PLANETARIUM);
  }

  if (isAtLeastHalfCollectiblesUnlocked()) {
    // We have to filter for non-swappable unlocks to prevent an infinite loop.
    const unlockIDs = getUncompletedNonCollectiblesNonTrinkets();
    const nonSwappableUnlockIDs = unlockIDs.filter(
      (unlockID) => getSwappedUnlockID(unlockID, seed) === undefined,
    );
    if (nonSwappableUnlockIDs.length > 0) {
      const unlockID = getRandomArrayElement(nonSwappableUnlockIDs, seed);
      return getUnlockFromID(unlockID);
    }
  }

  if (isHardcoreMode()) {
    const worseCollectibleType = getWorseLockedCollectibleType(
      collectibleUnlock.collectibleType,
    );
    if (worseCollectibleType !== undefined) {
      return getUnlock(UnlockType.COLLECTIBLE, worseCollectibleType);
    }
  }

  const func = SWAPPED_UNLOCK_COLLECTIBLE_FUNCTIONS.get(
    collectibleUnlock.collectibleType,
  );
  return func === undefined ? undefined : func(seed);
}

function isAtLeastHalfCollectiblesUnlocked(): boolean {
  const numCollectibleTypesInPlaythrough =
    getNumCollectibleTypesInPlaythrough();
  const numUnlockedCollectibleTypes = getNumUnlockedCollectibleTypes(false);

  return numUnlockedCollectibleTypes / numCollectibleTypesInPlaythrough >= 0.5;
}

const SWAPPED_UNLOCK_TRINKET_FUNCTIONS = new ReadonlyMap<
  TrinketType,
  (seed: Seed) => Unlock | undefined
>([
  // 3
  [
    TrinketType.AAA_BATTERY,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 4
  [
    TrinketType.BROKEN_REMOTE,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 17
  [
    TrinketType.BLACK_LIPSTICK,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
  ],

  // 18
  [
    TrinketType.BIBLE_TRACT,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.ETERNAL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.ETERNAL),
  ],

  // 19
  [
    TrinketType.PAPER_CLIP,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST),
  ],

  // 20
  [
    TrinketType.MONKEY_PAW,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
  ],

  // 21
  [
    TrinketType.MYSTERIOUS_PAPER,
    () =>
      isCharacterUnlocked(PlayerType.LOST, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.LOST),
  ],

  // 22
  [
    TrinketType.DAEMONS_TAIL,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
  ],

  // 23
  [
    TrinketType.MISSING_POSTER,
    () =>
      isCharacterUnlocked(PlayerType.LOST, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.LOST),
  ],

  // 28
  [
    TrinketType.BROKEN_ANKH,
    () =>
      isCharacterUnlocked(PlayerType.BLUE_BABY, false)
        ? undefined
        : getUnlock(UnlockType.CHARACTER, PlayerType.BLUE_BABY),
  ],

  // 38
  [
    TrinketType.MOMS_PEARL,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 44
  [
    TrinketType.SAFETY_CAP,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 45
  [
    TrinketType.ACE_OF_SPADES,
    (seed) =>
      anyCardsUnlocked(false) ? undefined : getRandomCardTypeUnlock(seed),
  ],

  // 61
  [
    TrinketType.LEFT_HAND,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.RED_CHEST),
  ],

  // 76
  [
    TrinketType.POKER_CHIP,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.CHEST),
  ],

  // 79
  [
    TrinketType.ENDLESS_NAMELESS,
    (seed) =>
      anyCardTypesUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 80
  [
    TrinketType.BLACK_FEATHER,
    () =>
      isCollectibleTypeUnlocked(CollectibleType.MISSING_PAGE_2, false)
        ? undefined
        : getUnlock(UnlockType.COLLECTIBLE, CollectibleType.MISSING_PAGE_2),
  ],

  // 87
  [
    TrinketType.MOMS_LOCKET,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.FULL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.FULL),
  ],

  // 88
  [
    TrinketType.NO,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 89
  [
    TrinketType.CHILD_LEASH,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 91
  [
    TrinketType.MECONIUM,
    () =>
      isOtherUnlockKindUnlocked(OtherUnlockKind.BLACK_POOP, false)
        ? undefined
        : getUnlock(UnlockType.OTHER, OtherUnlockKind.BLACK_POOP),
  ],

  // 100
  [
    TrinketType.VIBRANT_BULB,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 101
  [
    TrinketType.DIM_BULB,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 103
  [
    TrinketType.EQUALITY,
    () => {
      if (!isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)) {
        return getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK);
      }

      if (!isBombSubTypeUnlocked(BombSubType.DOUBLE_PACK, false)) {
        return getUnlock(UnlockType.BOMB, BombSubType.DOUBLE_PACK);
      }

      if (!isKeySubTypeUnlocked(KeySubType.DOUBLE_PACK, false)) {
        return getUnlock(UnlockType.KEY, KeySubType.DOUBLE_PACK);
      }

      return undefined;
    },
  ],

  // 107
  [
    TrinketType.CROW_HEART,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 109
  [
    TrinketType.DUCT_TAPE,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 112
  [
    TrinketType.PAY_TO_WIN,
    () =>
      isSlotVariantUnlocked(SlotVariant.SHOP_RESTOCK_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.SHOP_RESTOCK_MACHINE),
  ],

  // 120
  [
    TrinketType.HAIRPIN,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 122
  [
    TrinketType.BUTTER,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 125
  [
    TrinketType.EXTENSION_CORD,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 127
  [
    TrinketType.BABY_BENDER,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 131
  [
    TrinketType.BLESSED_PENNY,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 138
  [TrinketType.M, swapAnyRoomUnlock], // 'M can give Red Key.

  // 141
  [
    TrinketType.FORGOTTEN_LULLABY,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 143
  [
    TrinketType.OLD_CAPACITOR,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 147
  [
    TrinketType.CHARGED_PENNY,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 148
  [
    TrinketType.FRIENDSHIP_NECKLACE,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 149
  [
    TrinketType.PANIC_BUTTON,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 152
  [
    TrinketType.TELESCOPE_LENS,
    () =>
      isRoomTypeUnlocked(RoomType.PLANETARIUM, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.PLANETARIUM),
  ],

  // 159
  [
    TrinketType.GILDED_KEY,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST),
  ],

  // 160
  [
    TrinketType.LUCKY_SACK,
    () =>
      isSackSubTypeUnlocked(SackSubType.NORMAL, false)
        ? undefined
        : getUnlock(UnlockType.SACK, SackSubType.NORMAL),
  ],

  // 168
  [
    TrinketType.HOLLOW_HEART,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BONE, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BONE),
  ],

  // 175
  [
    TrinketType.STRANGE_KEY,
    () =>
      isAreaUnlocked(UnlockableArea.BLUE_WOMB, false)
        ? undefined
        : getUnlock(UnlockType.AREA, UnlockableArea.BLUE_WOMB),
  ],

  // 179
  [
    TrinketType.RC_REMOTE,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],

  // 181
  [
    TrinketType.EXPANSION_PACK,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 184
  [
    TrinketType.ADOPTION_PAPERS,
    (seed) =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(seed),
  ],
]);

function getSwappedUnlockTrinket(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const trinketUnlock = unlock as TrinketUnlock;

  // 21
  if (
    DICE_TRINKETS.has(trinketUnlock.trinketType) &&
    !isRoomTypeUnlocked(RoomType.DICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.DICE);
  }

  if (isAtLeastHalfTrinketsUnlocked()) {
    // We have to filter for non-swappable unlocks to prevent an infinite loop.
    const unlockIDs = getUncompletedNonCollectiblesNonTrinkets();
    const nonSwappableUnlockIDs = unlockIDs.filter(
      (unlockID) => getSwappedUnlockID(unlockID, seed) === undefined,
    );
    if (nonSwappableUnlockIDs.length > 0) {
      const unlockID = getRandomArrayElement(nonSwappableUnlockIDs, seed);
      return getUnlockFromID(unlockID);
    }
  }

  if (isHardcoreMode()) {
    const worseTrinketType = getWorseLockedTrinketType(
      trinketUnlock.trinketType,
    );
    if (worseTrinketType !== undefined) {
      return getUnlock(UnlockType.TRINKET, worseTrinketType);
    }
  }

  const func = SWAPPED_UNLOCK_TRINKET_FUNCTIONS.get(trinketUnlock.trinketType);
  return func === undefined ? undefined : func(seed);
}

function isAtLeastHalfTrinketsUnlocked(): boolean {
  const numTrinketTypesInPlaythrough = getNumTrinketTypesInPlaythrough();
  const numUnlockedTrinketTypes = getNumUnlockedTrinketTypes(false);

  return numUnlockedTrinketTypes / numTrinketTypesInPlaythrough >= 0.5;
}

const SWAPPED_UNLOCK_CARD_FUNCTIONS = new ReadonlyMap<
  CardType,
  (seed: Seed) => Unlock | undefined
>([
  // 6
  [
    CardType.HIEROPHANT,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 10
  [
    CardType.HERMIT,
    () =>
      isRoomTypeUnlocked(RoomType.SHOP, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SHOP),
  ],

  // 11
  [
    CardType.WHEEL_OF_FORTUNE,
    () =>
      isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.SLOT_MACHINE),
  ],

  // 15
  [
    CardType.TEMPERANCE,
    () =>
      isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BLOOD_DONATION_MACHINE),
  ],

  // 18
  [
    CardType.STARS,
    () =>
      isRoomTypeUnlocked(RoomType.TREASURE, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.TREASURE),
  ],

  // 19
  [
    CardType.MOON,
    () =>
      isRoomTypeUnlocked(RoomType.SECRET, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SECRET),
  ],

  // 21
  [
    CardType.JUDGEMENT,
    () =>
      isSlotVariantUnlocked(SlotVariant.BEGGAR, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BEGGAR),
  ],

  // 31
  [
    CardType.JOKER,
    () =>
      isRoomTypeUnlocked(RoomType.DEVIL, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.DEVIL),
  ],

  // 43
  [
    CardType.CREDIT,
    () =>
      isRoomTypeUnlocked(RoomType.SHOP, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SHOP),
  ],

  // 48
  [
    CardType.QUESTION_MARK,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 53
  [
    CardType.ANCIENT_RECALL,
    (seed) =>
      getNumCardsUnlocked(false) >= 4 // Chosen because there are only 4 quality 0 cards.
        ? undefined
        : getRandomCardTypeUnlock(seed),
  ],

  // 61
  [
    CardType.REVERSE_HIEROPHANT,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BONE, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BONE),
  ],

  // 64
  [
    CardType.REVERSE_JUSTICE,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST),
  ],

  // 65
  [
    CardType.REVERSE_HERMIT,
    () => {
      if (!isRoomTypeUnlocked(RoomType.SHOP, false)) {
        return getUnlock(UnlockType.ROOM, RoomType.SHOP);
      }

      if (!isCoinSubTypeUnlocked(CoinSubType.NICKEL, false)) {
        return getUnlock(UnlockType.COIN, CoinSubType.NICKEL);
      }

      return undefined;
    },
  ],

  // 70
  [
    CardType.REVERSE_TEMPERANCE,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  // 72
  [
    CardType.REVERSE_TOWER,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.ROCK_TINTED, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.ROCK_TINTED),
  ],

  // 74
  [CardType.REVERSE_MOON, swapAnyRoomUnlock],

  // 76
  [
    CardType.REVERSE_JUDGEMENT,
    () =>
      isSlotVariantUnlocked(SlotVariant.SHOP_RESTOCK_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.SHOP_RESTOCK_MACHINE),
  ],

  // 77
  [
    CardType.REVERSE_WORLD,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.CRAWL_SPACE),
  ],

  // 78
  [CardType.CRACKED_KEY, swapAnyRoomUnlock],

  // 83
  [CardType.SOUL_OF_CAIN, swapAnyRoomUnlock],

  // 93
  [
    CardType.SOUL_OF_KEEPER,
    () =>
      isRoomTypeUnlocked(RoomType.SHOP, false)
        ? undefined
        : getUnlock(UnlockType.ROOM, RoomType.SHOP),
  ],
]);

function getSwappedUnlockCard(unlock: Unlock, seed: Seed): Unlock | undefined {
  const cardUnlock = unlock as CardUnlock;

  // 21
  if (
    DICE_CARDS.has(cardUnlock.cardType) &&
    !isRoomTypeUnlocked(RoomType.DICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.DICE);
  }

  if (isHardcoreMode()) {
    const worseCardType = getWorseLockedCardType(cardUnlock.cardType);
    if (worseCardType !== undefined) {
      return getUnlock(UnlockType.CARD, worseCardType);
    }
  }

  const func = SWAPPED_UNLOCK_CARD_FUNCTIONS.get(cardUnlock.cardType);
  return func === undefined ? undefined : func(seed);
}

const SWAPPED_UNLOCK_PILL_EFFECT_FUNCTIONS = new ReadonlyMap<
  PillEffect,
  (seed: Seed) => Unlock | undefined
>([
  // 20
  [
    PillEffect.FORTY_EIGHT_HOUR_ENERGY,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],

  // 43
  [
    PillEffect.GULP,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  // 46
  [
    PillEffect.VURP,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],
]);

function getSwappedUnlockPillEffect(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const pillEffectUnlock = unlock as PillEffectUnlock;

  if (isHardcoreMode()) {
    const worsePillEffect = getWorseLockedPillEffect(
      pillEffectUnlock.pillEffect,
    );
    if (worsePillEffect !== undefined) {
      return getUnlock(UnlockType.PILL_EFFECT, worsePillEffect);
    }
  }

  const func = SWAPPED_UNLOCK_PILL_EFFECT_FUNCTIONS.get(
    pillEffectUnlock.pillEffect,
  );
  return func === undefined ? undefined : func(seed);
}

function getSwappedUnlockHeart(
  unlock: Unlock,
  _seed: Seed,
): Unlock | undefined {
  const heartUnlock = unlock as HeartUnlock;

  // 18
  if (!isRoomTypeUnlocked(RoomType.CLEAN_BEDROOM, false)) {
    return getUnlock(UnlockType.ROOM, RoomType.CLEAN_BEDROOM);
  }

  if (isHardcoreMode()) {
    const worseHeartSubType = getWorseLockedHeartSubType(
      heartUnlock.heartSubType,
    );
    if (worseHeartSubType !== undefined) {
      return getUnlock(UnlockType.HEART, worseHeartSubType);
    }
  }

  return undefined;
}

function getSwappedUnlockCoin(unlock: Unlock, _seed: Seed): Unlock | undefined {
  const coinUnlock = unlock as CoinUnlock;

  if (isHardcoreMode()) {
    const worseCoinSubType = getWorseLockedCoinSubType(coinUnlock.coinSubType);
    if (worseCoinSubType !== undefined) {
      return getUnlock(UnlockType.COIN, worseCoinSubType);
    }
  }

  return undefined;
}

function getSwappedUnlockBomb(unlock: Unlock, _seed: Seed): Unlock | undefined {
  const bombUnlock = unlock as BombUnlock;

  if (isHardcoreMode()) {
    const worseBombSubType = getWorseLockedBombSubType(bombUnlock.bombSubType);
    if (worseBombSubType !== undefined) {
      return getUnlock(UnlockType.BOMB, worseBombSubType);
    }
  }

  return undefined;
}

const SWAPPED_UNLOCK_KEY_FUNCTIONS = new ReadonlyMap<
  KeySubType,
  (seed: Seed) => Unlock | undefined
>([
  // 4
  [
    KeySubType.CHARGED,
    (seed) =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(seed),
  ],
]);

function getSwappedUnlockKey(unlock: Unlock, seed: Seed): Unlock | undefined {
  const keyUnlock = unlock as KeyUnlock;

  if (isHardcoreMode()) {
    const worseKeySubType = getWorseLockedKeySubType(keyUnlock.keySubType);
    if (worseKeySubType !== undefined) {
      return getUnlock(UnlockType.KEY, worseKeySubType);
    }
  }

  const func = SWAPPED_UNLOCK_KEY_FUNCTIONS.get(keyUnlock.keySubType);
  return func === undefined ? undefined : func(seed);
}

function getSwappedUnlockBattery(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const batteryUnlock = unlock as BatteryUnlock;

  if (!anyActiveCollectibleUnlocked(false)) {
    return getRandomActiveCollectibleUnlock(seed);
  }

  if (isHardcoreMode()) {
    const worseBatterySubType = getWorseLockedBatterySubType(
      batteryUnlock.batterySubType,
    );
    if (worseBatterySubType !== undefined) {
      return getUnlock(UnlockType.BATTERY, worseBatterySubType);
    }
  }

  return undefined;
}

function getSwappedUnlockSack(unlock: Unlock, _seed: Seed): Unlock | undefined {
  const sackUnlock = unlock as SackUnlock;

  if (isHardcoreMode()) {
    const worseSackSubType = getWorseLockedSackSubType(sackUnlock.sackSubType);
    if (worseSackSubType !== undefined) {
      return getUnlock(UnlockType.SACK, worseSackSubType);
    }
  }

  return undefined;
}

const SWAPPED_UNLOCK_CHEST_FUNCTIONS = new ReadonlyMap<
  PickupVariant,
  (seed: Seed) => Unlock | undefined
>([
  // 54
  [
    PickupVariant.MIMIC_CHEST,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.SPIKED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.SPIKED_CHEST),
  ],
]);

function getSwappedUnlockChest(unlock: Unlock, seed: Seed): Unlock | undefined {
  const chestUnlock = unlock as ChestUnlock;

  if (isHardcoreMode()) {
    const worseChestPickupVariant = getWorseLockedChestPickupVariant(
      chestUnlock.pickupVariant,
    );
    if (worseChestPickupVariant !== undefined) {
      return getUnlock(UnlockType.CHEST, worseChestPickupVariant);
    }
  }

  const func = SWAPPED_UNLOCK_CHEST_FUNCTIONS.get(chestUnlock.pickupVariant);
  return func === undefined ? undefined : func(seed);
}

function getSwappedUnlockSlot(unlock: Unlock, _seed: Seed): Unlock | undefined {
  const slotUnlock = unlock as SlotUnlock;

  if (slotUnlock.slotVariant === SlotVariant.BLOOD_DONATION_MACHINE) {
    return undefined;
  }

  return isRoomTypeUnlocked(RoomType.ARCADE, false)
    ? undefined
    : getUnlock(UnlockType.ROOM, RoomType.ARCADE);
}

const SWAPPED_UNLOCK_GRID_ENTITY_FUNCTIONS = new ReadonlyMap<
  GridEntityType,
  (seed: Seed) => Unlock | undefined
>([
  // 4
  [
    GridEntityType.ROCK_TINTED,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  // 22
  [
    GridEntityType.ROCK_SUPER_SPECIAL,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],
]);

function getSwappedUnlockGridEntity(
  unlock: Unlock,
  seed: Seed,
): Unlock | undefined {
  const gridEntityUnlock = unlock as GridEntityUnlock;

  const func = SWAPPED_UNLOCK_GRID_ENTITY_FUNCTIONS.get(
    gridEntityUnlock.gridEntityType,
  );
  return func === undefined ? undefined : func(seed);
}

const SWAPPED_UNLOCK_OTHER_FUNCTIONS = new ReadonlyMap<
  OtherUnlockKind,
  (seed: Seed) => Unlock | undefined
>([
  [
    OtherUnlockKind.GOLD_TRINKETS,
    (seed) =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(seed),
  ],

  [
    OtherUnlockKind.GOLD_PILLS,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],

  [
    OtherUnlockKind.HORSE_PILLS,
    (seed) =>
      anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(seed),
  ],
]);

function getSwappedUnlockOther(unlock: Unlock, seed: Seed): Unlock | undefined {
  const otherUnlock = unlock as OtherUnlock;

  const func = SWAPPED_UNLOCK_OTHER_FUNCTIONS.get(otherUnlock.kind);
  return func === undefined ? undefined : func(seed);
}

/**
 * Some collectibles/cards allow traveling into red rooms. Before this occurs, we must ensure that
 * all room types are unlocked (because off-grid rooms can be any room type).
 */
function swapAnyRoomUnlock(seed: Seed) {
  const shuffledRoomTypes = shuffleArray(UNLOCKABLE_ROOM_TYPES, seed);
  for (const roomType of shuffledRoomTypes) {
    if (!isRoomTypeUnlocked(roomType, false)) {
      return getUnlock(UnlockType.ROOM, roomType);
    }
  }

  return undefined;
}

/**
 * It is possible to get into an infinite swapping loop with this function.
 *
 * e.g. Lil' Battery --> The Candle --> Battery Pack --> Lil' Battery
 *
 * Thus, we want to hardcode this to only consistent of active items with no other conditions.
 */
function getRandomActiveCollectibleUnlock(seed: Seed): CollectibleUnlock {
  const lockedCollectibleTypes = getLockedCollectibleTypes();

  const collectibleTypesWithNoLogic = lockedCollectibleTypes.filter(
    (collectibleType) =>
      SWAPPED_UNLOCK_COLLECTIBLE_FUNCTIONS.get(collectibleType) === undefined,
  );

  const activeCollectibleTypes = collectibleTypesWithNoLogic.filter(
    (collectibleType) => isActiveCollectible(collectibleType),
  );

  const activeCollectibleTypesQuality0 = activeCollectibleTypes.filter(
    (collectibleType) => getCollectibleQuality(collectibleType) === 0,
  );

  const collectibleTypes = isHardcoreMode()
    ? activeCollectibleTypesQuality0
    : activeCollectibleTypes;

  const collectibleType = getRandomArrayElement(collectibleTypes, seed);

  return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
}

/** This function copies the logic from the `getRandomActiveCollectibleUnlock` function. */
function getRandomFamiliarCollectibleUnlock(seed: Seed): CollectibleUnlock {
  const lockedCollectibleTypes = getLockedCollectibleTypes();

  const collectibleTypesWithNoLogic = lockedCollectibleTypes.filter(
    (collectibleType) =>
      SWAPPED_UNLOCK_COLLECTIBLE_FUNCTIONS.get(collectibleType) === undefined,
  );

  const familiarCollectibleTypes = collectibleTypesWithNoLogic.filter(
    (collectibleType) => isFamiliarCollectible(collectibleType),
  );

  const familiarCollectibleTypesQuality0 = familiarCollectibleTypes.filter(
    (collectibleType) => getCollectibleQuality(collectibleType) === 0,
  );

  const collectibleTypes = isHardcoreMode()
    ? familiarCollectibleTypesQuality0
    : familiarCollectibleTypes;

  const collectibleType = getRandomArrayElement(collectibleTypes, seed);

  return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
}

function getRandomTrinketUnlock(seed: Seed): TrinketUnlock {
  const lockedTrinketTypes = getLockedTrinketTypes();

  const trinketTypesWithNoLogic = lockedTrinketTypes.filter(
    (trinketType) =>
      SWAPPED_UNLOCK_TRINKET_FUNCTIONS.get(trinketType) === undefined,
  );

  const trinketTypesQuality0 = trinketTypesWithNoLogic.filter(
    (trinketType) => TRINKET_QUALITIES[trinketType] === 0,
  );

  const trinketTypes = isHardcoreMode()
    ? trinketTypesQuality0
    : trinketTypesWithNoLogic;

  const trinketType = getRandomArrayElement(trinketTypes, seed);

  return {
    type: UnlockType.TRINKET,
    trinketType,
  };
}

function getRandomCardTypeUnlock(seed: Seed): CardUnlock {
  const lockedCardTypes = getLockedCardTypes();

  const cardTypesWithNoLogic = lockedCardTypes.filter(
    (cardType) => SWAPPED_UNLOCK_CARD_FUNCTIONS.get(cardType) === undefined,
  );

  const cardTypesQuality0 = cardTypesWithNoLogic.filter(
    (cardType) => CARD_QUALITIES[cardType] === 0,
  );

  const cardTypes = isHardcoreMode() ? cardTypesQuality0 : cardTypesWithNoLogic;

  const cardType = getRandomArrayElement(cardTypes, seed);

  return {
    type: UnlockType.CARD,
    cardType,
  };
}

function getRandomRuneUnlock(seed: Seed): CardUnlock {
  const lockedCardTypes = getLockedCardTypes();

  const cardTypesWithNoLogic = lockedCardTypes.filter(
    (cardType) => SWAPPED_UNLOCK_CARD_FUNCTIONS.get(cardType) === undefined,
  );

  const runeCardTypes = cardTypesWithNoLogic.filter((cardType) =>
    isRune(cardType),
  );

  const runeCardTypesQuality0 = runeCardTypes.filter(
    (cardType) => CARD_QUALITIES[cardType] === 0,
  );

  const cardTypes = isHardcoreMode() ? runeCardTypesQuality0 : runeCardTypes;

  const cardType = getRandomArrayElement(cardTypes, seed);

  return {
    type: UnlockType.CARD,
    cardType,
  };
}

function getRandomPillEffectUnlock(seed: Seed): PillEffectUnlock {
  const lockedPillEffects = getLockedPillEffects();

  const pillEffectsWithNoLogic = lockedPillEffects.filter(
    (pillEffect) =>
      SWAPPED_UNLOCK_PILL_EFFECT_FUNCTIONS.get(pillEffect) === undefined,
  );

  const pillEffectsQuality0 = pillEffectsWithNoLogic.filter(
    (pillEffect) => PILL_EFFECT_QUALITIES[pillEffect] === 0,
  );

  const pillEffects = isHardcoreMode()
    ? pillEffectsQuality0
    : pillEffectsWithNoLogic;

  const pillEffect = getRandomArrayElement(pillEffects, seed);

  return {
    type: UnlockType.PILL_EFFECT,
    pillEffect,
  };
}

function getRandomChestUnlock(seed: Seed): ChestUnlock {
  const lockedChestPickupVariants = getLockedChestPickupVariants();

  const chestPickupVariantsWithNoLogic = lockedChestPickupVariants.filter(
    (pickupVariant) =>
      SWAPPED_UNLOCK_CHEST_FUNCTIONS.get(pickupVariant) === undefined,
  );

  const pickupVariant = getRandomArrayElement(
    chestPickupVariantsWithNoLogic,
    seed,
  );

  return {
    type: UnlockType.CHEST,
    pickupVariant,
  };
}
