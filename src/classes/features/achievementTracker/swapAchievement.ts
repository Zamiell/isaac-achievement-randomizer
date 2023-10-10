import {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  HeartSubType,
  ItemConfigTag,
  PickupVariant,
  PillEffect,
  RoomType,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  ReadonlyMap,
  assertDefined,
  assertNotNull,
  collectibleHasTag,
  getChallengeBoss,
  getChallengeCharacter,
  log,
  shuffleArray,
} from "isaacscript-common";
import { UNLOCKABLE_ROOM_TYPES } from "../../../arrays/unlockableRoomTypes";
import { ALT_FLOORS } from "../../../cachedEnums";
import { AltFloor } from "../../../enums/AltFloor";
import { UnlockType } from "../../../enums/UnlockType";
import {
  UnlockablePath,
  getUnlockablePathFromStoryBoss,
} from "../../../enums/UnlockablePath";
import { ANGEL_ROOM_COLLECTIBLES } from "../../../sets/angelRoomCollectibles";
import { CURSE_ROOM_COLLECTIBLES } from "../../../sets/curseRoomCollectibles";
import { PLANETARIUM_COLLECTIBLES } from "../../../sets/planetariumCollectibles";
import { getObjectiveFromID, getObjectiveText } from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import type {
  AltFloorUnlock,
  BatteryUnlock,
  BombUnlock,
  CardUnlock,
  ChallengeUnlock,
  ChestUnlock,
  CoinUnlock,
  CollectibleUnlock,
  HeartUnlock,
  KeyUnlock,
  PathUnlock,
  PillEffectUnlock,
  SackUnlock,
  TrinketUnlock,
  Unlock,
} from "../../../types/Unlock";
import { getUnlock, getUnlockText } from "../../../types/Unlock";
import {
  anyBadPillEffectsUnlocked,
  anyCardTypesUnlocked,
  anyCardsUnlocked,
  anyGoodPillEffectsUnlocked,
  anyPillEffectsUnlocked,
  anyRunesUnlocked,
  anyTrinketTypesUnlocked,
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
  isAltFloorUnlocked,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGridEntityTypeUnlocked,
  isHeartSubTypeUnlocked,
  isPathUnlocked,
  isRoomTypeUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
} from "./completedUnlocks";
import { isHardcoreMode, v } from "./v";

const DEFAULT_TRINKET_UNLOCK = getUnlock(UnlockType.TRINKET, TrinketType.ERROR);

const DEFAULT_CARD_UNLOCK = getUnlock(UnlockType.CARD, CardType.FOOL);

/** X-Lax is the only pill with a class of "0-". */
const DEFAULT_PILL_UNLOCK = getUnlock(UnlockType.PILL_EFFECT, PillEffect.X_LAX);

export function checkSwapProblematicAchievement(
  unlock: Unlock,
  objectiveID: ObjectiveID,
  emulating: boolean,
): Unlock {
  const swappedUnlock = getSwappedUnlock(unlock);
  if (swappedUnlock === undefined) {
    return unlock;
  }

  const swappedObjectiveID = findObjectiveIDForUnlock(swappedUnlock);
  assertDefined(
    swappedObjectiveID,
    `Failed to find the objective ID for swapped unlock: ${getUnlockText(
      swappedUnlock,
    ).join(" - ")}`,
  );

  v.persistent.objectiveToUnlockMap.set(objectiveID, swappedUnlock);
  v.persistent.objectiveToUnlockMap.set(swappedObjectiveID, unlock);

  if (!emulating) {
    log("Swapped objectives:");
    const objective1 = getObjectiveFromID(objectiveID);
    const objective1Text = getObjectiveText(objective1).join(" ");
    log(`1) ${objective1Text}`);

    const objective2 = getObjectiveFromID(swappedObjectiveID);
    const objective2Text = getObjectiveText(objective2).join(" ");
    log(`2) ${objective2Text}`);
  }

  return swappedUnlock;
}

const SWAPPED_UNLOCK_FUNCTIONS = {
  [UnlockType.CHARACTER]: undefined,
  [UnlockType.PATH]: getSwappedUnlockPath,
  [UnlockType.ALT_FLOOR]: getSwappedUnlockAltFloor,
  [UnlockType.ROOM]: undefined,
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
  [UnlockType.GRID_ENTITY]: undefined,
  [UnlockType.OTHER]: undefined,
} as const satisfies Record<UnlockType, ((unlock: Unlock) => void) | undefined>;

function getSwappedUnlock(unlock: Unlock): Unlock | undefined {
  const func = SWAPPED_UNLOCK_FUNCTIONS[unlock.type];
  return func === undefined ? undefined : func(unlock);
}

const SWAPPED_UNLOCK_PATH_FUNCTIONS = new ReadonlyMap<
  UnlockablePath,
  () => Unlock | undefined
>([
  [
    UnlockablePath.VOID,
    () =>
      isPathUnlocked(UnlockablePath.BLUE_WOMB, false)
        ? undefined
        : getUnlock(UnlockType.PATH, UnlockablePath.BLUE_WOMB),
  ],
  [
    UnlockablePath.ASCENT,
    () =>
      isCardTypeUnlocked(CardType.FOOL, false)
        ? undefined
        : getUnlock(UnlockType.CARD, CardType.FOOL),
  ],
  [
    UnlockablePath.BLACK_MARKETS,
    () =>
      isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)
        ? undefined
        : getUnlock(UnlockType.GRID_ENTITY, GridEntityType.CRAWL_SPACE),
  ],
]);

function getSwappedUnlockPath(unlock: Unlock): Unlock | undefined {
  const pathUnlock = unlock as PathUnlock;
  const func = SWAPPED_UNLOCK_PATH_FUNCTIONS.get(pathUnlock.unlockablePath);
  return func === undefined ? undefined : func();
}

function getSwappedPathUnlockAltFloorRepentance(): Unlock | undefined {
  return isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS, false)
    ? undefined
    : getUnlock(UnlockType.PATH, UnlockablePath.REPENTANCE_FLOORS);
}

const SWAPPED_UNLOCK_ALT_FLOOR_FUNCTIONS = new ReadonlyMap<
  AltFloor,
  () => Unlock | undefined
>([
  [AltFloor.DROSS, getSwappedPathUnlockAltFloorRepentance],
  [AltFloor.ASHPIT, getSwappedPathUnlockAltFloorRepentance],
  [AltFloor.GEHENNA, getSwappedPathUnlockAltFloorRepentance],
]);

function getSwappedUnlockAltFloor(unlock: Unlock): Unlock | undefined {
  const pathUnlock = unlock as AltFloorUnlock;
  const func = SWAPPED_UNLOCK_ALT_FLOOR_FUNCTIONS.get(pathUnlock.altFloor);
  return func === undefined ? undefined : func();
}

const CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP = new ReadonlyMap<
  Challenge,
  CollectibleType[]
>([
  // 6
  [
    Challenge.SOLAR_SYSTEM,
    [
      CollectibleType.DISTANT_ADMIRATION, // 57
      CollectibleType.FOREVER_ALONE, // 128
    ],
  ],

  // 8
  [Challenge.CAT_GOT_YOUR_TONGUE, [CollectibleType.GUPPYS_HAIRBALL]],

  // 13
  [
    Challenge.BEANS,
    [
      CollectibleType.BEAN, // 111
      CollectibleType.NINE_VOLT, // 116
    ],
  ],

  // 19
  [Challenge.FAMILY_MAN, [CollectibleType.BROTHER_BOBBY]],

  // 23
  [
    Challenge.BLUE_BOMBER,
    [
      CollectibleType.KAMIKAZE, // 40
      CollectibleType.PYROMANIAC, // 223
    ],
  ],

  // 24
  [
    Challenge.PAY_TO_PLAY,
    [CollectibleType.SACK_OF_PENNIES, CollectibleType.MONEY_EQUALS_POWER],
  ],

  // 25
  [Challenge.HAVE_A_HEART, [CollectibleType.CHARM_OF_THE_VAMPIRE]],

  // 27
  [Challenge.BRAINS, [CollectibleType.BOBS_BRAIN]],

  // 29
  [Challenge.ONANS_STREAK, [CollectibleType.CHOCOLATE_MILK]],

  // 30
  [
    Challenge.GUARDIAN,
    [
      CollectibleType.ISAACS_HEART, // 276
      CollectibleType.PUNCHING_BAG, // 281
      CollectibleType.SPEAR_OF_DESTINY, // 400
    ],
  ],

  // 36
  [
    Challenge.SCAT_MAN,
    [
      CollectibleType.POOP, // 36
      CollectibleType.NINE_VOLT, // 116
      CollectibleType.THUNDER_THIGHS, // 314
      CollectibleType.DIRTY_MIND, // 576
    ],
  ],

  // 37
  [Challenge.BLOODY_MARY, [CollectibleType.BLOOD_OATH]],

  // 38
  [
    Challenge.BAPTISM_BY_FIRE,
    [
      CollectibleType.GUPPYS_PAW, // 133
      CollectibleType.SCHOOLBAG, // 534
      CollectibleType.URN_OF_SOULS, // 640
    ],
  ],

  // 41
  [Challenge.PICA_RUN, [CollectibleType.MOMS_BOX]],

  // 44
  [Challenge.RED_REDEMPTION, [CollectibleType.RED_KEY]],
]);

function getSwappedUnlockChallenge(unlock: Unlock): Unlock | undefined {
  const challengeUnlock = unlock as ChallengeUnlock;

  const challengeCharacter = getChallengeCharacter(challengeUnlock.challenge);
  if (!isCharacterUnlocked(challengeCharacter)) {
    return getUnlock(UnlockType.CHARACTER, challengeCharacter);
  }

  // All the challenge bosses are story bosses.
  const challengeBossID = getChallengeBoss(challengeUnlock.challenge);
  const unlockablePath = getUnlockablePathFromStoryBoss(challengeBossID);
  if (unlockablePath !== undefined && !isPathUnlocked(unlockablePath)) {
    return getUnlock(UnlockType.PATH, unlockablePath);
  }

  const requiredCollectibleTypes = CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP.get(
    challengeUnlock.challenge,
  );
  if (requiredCollectibleTypes !== undefined) {
    assertNotNull(
      v.persistent.seed,
      "Failed to swap achievements due to the seed being null.",
    );
    const shuffledCollectibleTypes = shuffleArray(
      requiredCollectibleTypes,
      v.persistent.seed,
    );
    for (const collectibleType of shuffledCollectibleTypes) {
      if (!isCollectibleTypeUnlocked(collectibleType, false)) {
        return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
      }
    }
  }

  return undefined;
}

const SWAPPED_UNLOCK_COLLECTIBLE_FUNCTIONS = new ReadonlyMap<
  CollectibleType,
  () => Unlock | undefined
>([
  // 75
  [
    CollectibleType.PHD,
    () => (anyGoodPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
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
    () => (anyCardsUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 102
  [
    CollectibleType.MOMS_BOTTLE_OF_PILLS,
    () => {
      if (!anyPillEffectsUnlocked(false)) {
        return DEFAULT_PILL_UNLOCK;
      }

      return undefined;
    },
  ],

  // 139
  [
    CollectibleType.MOMS_PURSE,
    () => (anyTrinketTypesUnlocked(false) ? undefined : DEFAULT_TRINKET_UNLOCK),
  ],

  // 195
  [
    CollectibleType.MOMS_COIN_PURSE,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
  ],

  // 203
  [
    CollectibleType.HUMBLING_BUNDLE,
    () =>
      isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)
        ? undefined
        : getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK),
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
    () => (anyCardTypesUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 252
  [
    CollectibleType.LITTLE_BAGGY,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
  ],

  // 263
  [
    CollectibleType.CLEAR_RUNE,
    () =>
      anyRunesUnlocked(false)
        ? undefined
        : getUnlock(UnlockType.CARD, CardType.RUNE_BLANK),
  ],

  // 286
  [
    CollectibleType.BLANK_CARD,
    () => (anyCardsUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 348
  [
    CollectibleType.PLACEBO,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
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
    () => (anyTrinketTypesUnlocked(false) ? undefined : DEFAULT_TRINKET_UNLOCK),
  ],

  // 451
  [
    CollectibleType.TAROT_CLOTH,
    () => (anyCardsUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 458
  [
    CollectibleType.BELLY_BUTTON,
    () => (anyTrinketTypesUnlocked(false) ? undefined : DEFAULT_TRINKET_UNLOCK),
  ],

  // 479
  [
    CollectibleType.SMELTER,
    () => (anyTrinketTypesUnlocked(false) ? undefined : DEFAULT_TRINKET_UNLOCK),
  ],

  // 491
  [
    CollectibleType.ACID_BABY,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
  ],

  // 538
  [
    CollectibleType.MARBLES,
    () => (anyTrinketTypesUnlocked(false) ? undefined : DEFAULT_TRINKET_UNLOCK),
  ],

  // 566
  [
    CollectibleType.DREAM_CATCHER,
    () => {
      assertNotNull(
        v.persistent.seed,
        "Failed to swap achievements due to the seed being null.",
      );
      const shuffledAltFloors = shuffleArray(ALT_FLOORS, v.persistent.seed);
      for (const altFloor of shuffledAltFloors) {
        if (!isAltFloorUnlocked(altFloor, false)) {
          return getUnlock(UnlockType.ALT_FLOOR, altFloor);
        }
      }

      return undefined;
    },
  ],

  // 580
  [CollectibleType.RED_KEY, swapAnyRoomUnlock],

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
    () => (anyCardsUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 654
  [
    CollectibleType.FALSE_PHD,
    () => (anyBadPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
  ],
]);

function getSwappedUnlockCollectible(unlock: Unlock): Unlock | undefined {
  const collectibleUnlock = unlock as CollectibleUnlock;

  // 10
  if (
    CURSE_ROOM_COLLECTIBLES.has(collectibleUnlock.collectibleType) &&
    !isRoomTypeUnlocked(RoomType.CURSE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.CURSE);
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
    ANGEL_ROOM_COLLECTIBLES.has(collectibleUnlock.collectibleType) &&
    !isRoomTypeUnlocked(RoomType.SACRIFICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.SACRIFICE);
  }

  // 24
  if (
    PLANETARIUM_COLLECTIBLES.has(collectibleUnlock.collectibleType) &&
    !isRoomTypeUnlocked(RoomType.PLANETARIUM, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.PLANETARIUM);
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
  return func === undefined ? undefined : func();
}

const SWAPPED_UNLOCK_TRINKET_FUNCTIONS = new ReadonlyMap<
  TrinketType,
  () => Unlock | undefined
>([
  // 18
  [
    TrinketType.BIBLE_TRACT,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.ETERNAL)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.ETERNAL),
  ],

  // 22
  [
    TrinketType.DAEMONS_TAIL,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
  ],

  // 44
  [
    TrinketType.SAFETY_CAP,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
  ],

  // 45
  [
    TrinketType.ACE_OF_SPADES,
    () => (anyCardsUnlocked(false) ? undefined : DEFAULT_CARD_UNLOCK),
  ],

  // 61
  [
    TrinketType.LEFT_HAND,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.RED_CHEST),
  ],

  // 131
  [
    TrinketType.BLESSED_PENNY,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 159
  [
    TrinketType.GILDED_KEY,
    () =>
      isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
        ? undefined
        : getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST),
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
      isPathUnlocked(UnlockablePath.BLUE_WOMB)
        ? undefined
        : getUnlock(UnlockType.PATH, UnlockablePath.BLUE_WOMB),
  ],
]);

function getSwappedUnlockTrinket(unlock: Unlock): Unlock | undefined {
  const trinketUnlock = unlock as TrinketUnlock;

  if (isHardcoreMode()) {
    const worseTrinketType = getWorseLockedTrinketType(
      trinketUnlock.trinketType,
    );
    if (worseTrinketType !== undefined) {
      return getUnlock(UnlockType.TRINKET, worseTrinketType);
    }
  }

  const func = SWAPPED_UNLOCK_TRINKET_FUNCTIONS.get(trinketUnlock.trinketType);
  return func === undefined ? undefined : func();
}

const SWAPPED_UNLOCK_CARD_FUNCTIONS = new ReadonlyMap<
  CardType,
  () => Unlock | undefined
>([
  // 6
  [
    CardType.HIEROPHANT,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
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

  // 21
  [
    CardType.JUDGEMENT,
    () =>
      isSlotVariantUnlocked(SlotVariant.BEGGAR, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.BEGGAR),
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

  // 70
  [
    CardType.REVERSE_TEMPERANCE,
    () => (anyPillEffectsUnlocked(false) ? undefined : DEFAULT_PILL_UNLOCK),
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
]);

function getSwappedUnlockCard(unlock: Unlock): Unlock | undefined {
  const cardUnlock = unlock as CardUnlock;

  if (isHardcoreMode()) {
    const worseCardType = getWorseLockedCardType(cardUnlock.cardType);
    if (worseCardType !== undefined) {
      return getUnlock(UnlockType.CARD, worseCardType);
    }
  }

  const func = SWAPPED_UNLOCK_CARD_FUNCTIONS.get(cardUnlock.cardType);
  return func === undefined ? undefined : func();
}

function getSwappedUnlockPillEffect(unlock: Unlock): Unlock | undefined {
  const pillEffectUnlock = unlock as PillEffectUnlock;

  if (isHardcoreMode()) {
    const worsePillEffect = getWorseLockedPillEffect(
      pillEffectUnlock.pillEffect,
    );
    if (worsePillEffect !== undefined) {
      return getUnlock(UnlockType.PILL_EFFECT, worsePillEffect);
    }
  }

  return undefined;
}

function getSwappedUnlockHeart(unlock: Unlock): Unlock | undefined {
  const heartUnlock = unlock as HeartUnlock;

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

function getSwappedUnlockCoin(unlock: Unlock): Unlock | undefined {
  const coinUnlock = unlock as CoinUnlock;

  if (isHardcoreMode()) {
    const worseCoinSubType = getWorseLockedCoinSubType(coinUnlock.coinSubType);
    if (worseCoinSubType !== undefined) {
      return getUnlock(UnlockType.COIN, worseCoinSubType);
    }
  }

  return undefined;
}

function getSwappedUnlockBomb(unlock: Unlock): Unlock | undefined {
  const bombUnlock = unlock as BombUnlock;

  if (isHardcoreMode()) {
    const worseBombSubType = getWorseLockedBombSubType(bombUnlock.bombSubType);
    if (worseBombSubType !== undefined) {
      return getUnlock(UnlockType.BOMB, worseBombSubType);
    }
  }

  return undefined;
}

function getSwappedUnlockKey(unlock: Unlock): Unlock | undefined {
  const keyUnlock = unlock as KeyUnlock;

  if (isHardcoreMode()) {
    const worseKeySubType = getWorseLockedKeySubType(keyUnlock.keySubType);
    if (worseKeySubType !== undefined) {
      return getUnlock(UnlockType.KEY, worseKeySubType);
    }
  }

  return undefined;
}

function getSwappedUnlockBattery(unlock: Unlock): Unlock | undefined {
  const batteryUnlock = unlock as BatteryUnlock;

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

function getSwappedUnlockSack(unlock: Unlock): Unlock | undefined {
  const sackUnlock = unlock as SackUnlock;

  if (isHardcoreMode()) {
    const worseSackSubType = getWorseLockedSackSubType(sackUnlock.sackSubType);
    if (worseSackSubType !== undefined) {
      return getUnlock(UnlockType.SACK, worseSackSubType);
    }
  }

  return undefined;
}

function getSwappedUnlockChest(unlock: Unlock): Unlock | undefined {
  const chestUnlock = unlock as ChestUnlock;

  if (isHardcoreMode()) {
    const worseChestPickupVariant = getWorseLockedChestPickupVariant(
      chestUnlock.pickupVariant,
    );
    if (worseChestPickupVariant !== undefined) {
      return getUnlock(UnlockType.CHEST, worseChestPickupVariant);
    }
  }

  return undefined;
}

function getSwappedUnlockSlot(): Unlock | undefined {
  return isRoomTypeUnlocked(RoomType.ARCADE, false)
    ? undefined
    : getUnlock(UnlockType.ROOM, RoomType.ARCADE);
}

function swapAnyRoomUnlock() {
  assertNotNull(
    v.persistent.seed,
    "Failed to swap achievements due to the seed being null.",
  );
  const shuffledRoomTypes = shuffleArray(
    UNLOCKABLE_ROOM_TYPES,
    v.persistent.seed,
  );
  for (const roomType of shuffledRoomTypes) {
    if (!isRoomTypeUnlocked(roomType)) {
      return getUnlock(UnlockType.ROOM, roomType);
    }
  }

  return undefined;
}

function findObjectiveIDForUnlock(
  unlockToMatch: Unlock,
): ObjectiveID | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;

    switch (unlock.type) {
      case UnlockType.CHARACTER: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.character === unlockToMatch.character
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.PATH: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.unlockablePath === unlockToMatch.unlockablePath
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.ALT_FLOOR: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.altFloor === unlockToMatch.altFloor
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.ROOM: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.roomType === unlockToMatch.roomType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CHALLENGE: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.challenge === unlockToMatch.challenge
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.COLLECTIBLE: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.collectibleType === unlockToMatch.collectibleType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.TRINKET: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.trinketType === unlockToMatch.trinketType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CARD: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.cardType === unlockToMatch.cardType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.PILL_EFFECT: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.pillEffect === unlockToMatch.pillEffect
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.HEART: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.heartSubType === unlockToMatch.heartSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.COIN: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.coinSubType === unlockToMatch.coinSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.BOMB: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.bombSubType === unlockToMatch.bombSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.KEY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.keySubType === unlockToMatch.keySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.BATTERY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.batterySubType === unlockToMatch.batterySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.SACK: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.sackSubType === unlockToMatch.sackSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CHEST: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.pickupVariant === unlockToMatch.pickupVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.SLOT: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.slotVariant === unlockToMatch.slotVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.GRID_ENTITY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.gridEntityType === unlockToMatch.gridEntityType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.OTHER: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.kind === unlockToMatch.kind
        ) {
          return objectiveID;
        }

        break;
      }
    }
  }

  return undefined;
}
