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
  arrayRemove,
  assertDefined,
  assertNotNull,
  collectibleHasTag,
  getChallengeBoss,
  getChallengeCharacter,
  getChallengeCollectibleTypes,
  getChallengeTrinketType,
  getRandomArrayElement,
  isCollectibleTypeInDefaultItemPool,
  log,
  shuffleArray,
} from "isaacscript-common";
import {
  UNLOCKABLE_CARD_TYPES,
  UNLOCKABLE_RUNE_CARD_TYPES,
} from "../../../arrays/unlockableCardTypes";
import {
  UNLOCKABLE_ACTIVE_COLLECTIBLE_TYPES,
  UNLOCKABLE_FAMILIAR_COLLECTIBLE_TYPES,
} from "../../../arrays/unlockableCollectibleTypes";
import { UNLOCKABLE_CHEST_PICKUP_VARIANTS } from "../../../arrays/unlockablePickupTypes";
import { UNLOCKABLE_PILL_EFFECTS } from "../../../arrays/unlockablePillEffects";
import { getUnlockableRoomTypes } from "../../../arrays/unlockableRoomTypes";
import { UNLOCKABLE_TRINKET_TYPES } from "../../../arrays/unlockableTrinketTypes";
import { ALT_FLOORS } from "../../../cachedEnums";
import { AltFloor } from "../../../enums/AltFloor";
import { OtherUnlockKind } from "../../../enums/OtherUnlockKind";
import { UnlockType } from "../../../enums/UnlockType";
import {
  UnlockablePath,
  getUnlockablePathFromStoryBoss,
} from "../../../enums/UnlockablePath";
import {
  DICE_CARDS,
  DICE_COLLECTIBLES,
  DICE_TRINKETS,
} from "../../../sets/diceObjects";
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
  GridEntityUnlock,
  HeartUnlock,
  KeyUnlock,
  OtherUnlock,
  PathUnlock,
  PillEffectUnlock,
  RoomUnlock,
  SackUnlock,
  SlotUnlock,
  TrinketUnlock,
  Unlock,
} from "../../../types/Unlock";
import { getUnlock, getUnlockText } from "../../../types/Unlock";
import { getCardTypesOfQuality, getRunesOfQuality } from "./cardQuality";
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
  getNumCardsUnlocked,
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
  isKeySubTypeUnlocked,
  isOtherUnlockKindUnlocked,
  isPathUnlocked,
  isRoomTypeUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
  isTrinketTypeUnlocked,
} from "./completedUnlocks";
import { getPillEffectsOfQuality } from "./pillEffectQuality";
import { getTrinketTypesOfQuality } from "./trinketQuality";
import { isHardcoreMode, isNightmareMode, v } from "./v";

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

const SWAPPED_UNLOCK_ROOM_FUNCTIONS = new ReadonlyMap<
  RoomType,
  () => Unlock | undefined
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
    () =>
      anyChestPickupVariantUnlocked(false) ? undefined : getRandomChestUnlock(),
  ],
]);

function getSwappedUnlockRoom(unlock: Unlock): Unlock | undefined {
  const roomUnlock = unlock as RoomUnlock;
  const func = SWAPPED_UNLOCK_ROOM_FUNCTIONS.get(roomUnlock.roomType);
  return func === undefined ? undefined : func();
}

function getSwappedUnlockChallenge(unlock: Unlock): Unlock | undefined {
  const challengeUnlock = unlock as ChallengeUnlock;

  const challengeCharacter = getChallengeCharacter(challengeUnlock.challenge);
  if (!isCharacterUnlocked(challengeCharacter, false)) {
    return getUnlock(UnlockType.CHARACTER, challengeCharacter);
  }

  // All the challenge bosses are story bosses.
  const challengeBossID = getChallengeBoss(challengeUnlock.challenge);
  const unlockablePath = getUnlockablePathFromStoryBoss(challengeBossID);
  if (unlockablePath !== undefined && !isPathUnlocked(unlockablePath, false)) {
    return getUnlock(UnlockType.PATH, unlockablePath);
  }

  assertNotNull(
    v.persistent.seed,
    "Failed to swap achievements due to the seed being null.",
  );

  const collectibleTypes = getChallengeCollectibleTypes(
    challengeUnlock.challenge,
  );
  const shuffledCollectibleTypes = shuffleArray(
    collectibleTypes,
    v.persistent.seed,
  );

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
  () => Unlock | undefined
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
    () =>
      isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.SLOT_MACHINE),
  ],

  // 63
  [
    CollectibleType.BATTERY,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 75
  [
    CollectibleType.PHD,
    () =>
      anyGoodPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(),
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
    () => (anyCardsUnlocked(false) ? undefined : getRandomCardUnlock()),
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
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],

  // 116
  [
    CollectibleType.NINE_VOLT,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
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
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
  ],

  // 156
  [
    CollectibleType.HABIT,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 158
  [
    CollectibleType.CRYSTAL_BALL,
    () =>
      isSlotVariantUnlocked(SlotVariant.FORTUNE_TELLING_MACHINE, false)
        ? undefined
        : getUnlock(UnlockType.SLOT, SlotVariant.FORTUNE_TELLING_MACHINE),
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
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],

  // 199
  [
    CollectibleType.MOMS_KEY,
    () =>
      anyChestPickupVariantUnlocked(false) ? undefined : getRandomChestUnlock(),
  ],

  // 203
  [
    CollectibleType.HUMBLING_BUNDLE,
    () =>
      isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)
        ? undefined
        : getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK),
  ],

  // 205
  [
    CollectibleType.SHARP_PLUG,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
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
    () => (anyCardTypesUnlocked(false) ? undefined : getRandomCardUnlock()),
  ],

  // 252
  [
    CollectibleType.LITTLE_BAGGY,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
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
    () => (anyCardsUnlocked(false) ? undefined : getRandomCardUnlock()),
  ],

  // 296
  [
    CollectibleType.CONVERTER,
    () =>
      anySoulHeartUnlocked(false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 348
  [
    CollectibleType.PLACEBO,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],

  // 356
  [
    CollectibleType.CAR_BATTERY,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 389
  [
    CollectibleType.RUNE_BAG,
    () => (anyRunesUnlocked(false) ? undefined : getRandomRuneUnlock()),
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
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
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
    () => (anyCardsUnlocked(false) ? undefined : getRandomCardUnlock()),
  ],

  // 454
  [
    CollectibleType.POLYDACTYLY,
    () =>
      anyCardsUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(),
  ],

  // 458
  [
    CollectibleType.BELLY_BUTTON,
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
  ],

  // 472
  [
    CollectibleType.KING_BABY,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 479
  [
    CollectibleType.SMELTER,
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
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
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
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
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 534
  [
    CollectibleType.SCHOOLBAG,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 536
  [
    CollectibleType.SACRIFICIAL_ALTAR,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 538
  [
    CollectibleType.MARBLES,
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
  ],

  // 557
  [
    CollectibleType.FORTUNE_COOKIE,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
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
    () => (anyCardsUnlocked(false) ? undefined : getRandomCardUnlock()),
  ],

  // 647
  [
    CollectibleType.FOUR_FIVE_VOLT,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 654
  [
    CollectibleType.FALSE_PHD,
    () =>
      anyBadPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(),
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
    () =>
      anyCardTypesUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(),
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

function getSwappedUnlockCollectible(unlock: Unlock): Unlock | undefined {
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

  // 29
  if (
    isCollectibleTypeInDefaultItemPool(
      collectibleUnlock.collectibleType,
      ItemPoolType.ULTRA_SECRET,
    ) &&
    !isRoomTypeUnlocked(RoomType.ULTRA_SECRET, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.ULTRA_SECRET);
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
  // 3
  [
    TrinketType.AAA_BATTERY,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 4
  [
    TrinketType.BROKEN_REMOTE,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
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

  // 22
  [
    TrinketType.DAEMONS_TAIL,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.BLACK, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.BLACK),
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
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],

  // 45
  [
    TrinketType.ACE_OF_SPADES,
    () => (anyCardsUnlocked(false) ? undefined : getRandomCardUnlock()),
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
    () =>
      anyCardTypesUnlocked(false) || anyPillEffectsUnlocked(false)
        ? undefined
        : getRandomPillEffectUnlock(),
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
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 89
  [
    TrinketType.CHILD_LEASH,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
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
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 101
  [
    TrinketType.DIM_BULB,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
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
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
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
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 122
  [
    TrinketType.BUTTER,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 125
  [
    TrinketType.EXTENSION_CORD,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 127
  [
    TrinketType.BABY_BENDER,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 131
  [
    TrinketType.BLESSED_PENNY,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL),
  ],

  // 141
  [
    TrinketType.FORGOTTEN_LULLABY,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 143
  [
    TrinketType.OLD_CAPACITOR,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 147
  [
    TrinketType.CHARGED_PENNY,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 148
  [
    TrinketType.FRIENDSHIP_NECKLACE,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 149
  [
    TrinketType.PANIC_BUTTON,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
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
      isPathUnlocked(UnlockablePath.BLUE_WOMB, false)
        ? undefined
        : getUnlock(UnlockType.PATH, UnlockablePath.BLUE_WOMB),
  ],

  // 179
  [
    TrinketType.RC_REMOTE,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],

  // 181
  [
    TrinketType.EXPANSION_PACK,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 184
  [
    TrinketType.ADOPTION_PAPERS,
    () =>
      anyFamiliarCollectibleUnlocked(false)
        ? undefined
        : getRandomFamiliarCollectibleUnlock(),
  ],
]);

function getSwappedUnlockTrinket(unlock: Unlock): Unlock | undefined {
  const trinketUnlock = unlock as TrinketUnlock;

  // 21
  if (
    DICE_TRINKETS.has(trinketUnlock.trinketType) &&
    !isRoomTypeUnlocked(RoomType.DICE, false)
  ) {
    return getUnlock(UnlockType.ROOM, RoomType.DICE);
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

  // 48
  [
    CardType.QUESTION_MARK,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 53
  [
    CardType.ANCIENT_RECALL,
    () =>
      getNumCardsUnlocked(false) >= 10 ? undefined : getRandomCardUnlock(),
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
    () =>
      isCoinSubTypeUnlocked(CoinSubType.NICKEL, false)
        ? undefined
        : getUnlock(UnlockType.COIN, CoinSubType.NICKEL),
  ],

  // 70
  [
    CardType.REVERSE_TEMPERANCE,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
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
  return func === undefined ? undefined : func();
}

const SWAPPED_PILL_EFFECT_FUNCTIONS = new ReadonlyMap<
  PillEffect,
  () => Unlock | undefined
>([
  // 20
  [
    PillEffect.FORTY_EIGHT_HOUR_ENERGY,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],

  // 43
  [
    PillEffect.GULP,
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
  ],

  // 46
  [
    PillEffect.VURP,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],
]);

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

  const func = SWAPPED_PILL_EFFECT_FUNCTIONS.get(pillEffectUnlock.pillEffect);
  return func === undefined ? undefined : func();
}

function getSwappedUnlockHeart(unlock: Unlock): Unlock | undefined {
  const heartUnlock = unlock as HeartUnlock;

  // 18
  if (!isRoomTypeUnlocked(RoomType.CLEAN_BEDROOM, false)) {
    return getUnlock(UnlockType.ROOM, RoomType.CLEAN_BEDROOM);
  }

  // 19
  if (!isRoomTypeUnlocked(RoomType.DIRTY_BEDROOM, false)) {
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

const SWAPPED_KEY_FUNCTIONS = new ReadonlyMap<
  KeySubType,
  () => Unlock | undefined
>([
  // 4
  [
    KeySubType.CHARGED,
    () =>
      anyActiveCollectibleUnlocked(false)
        ? undefined
        : getRandomActiveCollectibleUnlock(),
  ],
]);

function getSwappedUnlockKey(unlock: Unlock): Unlock | undefined {
  const keyUnlock = unlock as KeyUnlock;

  if (isHardcoreMode()) {
    const worseKeySubType = getWorseLockedKeySubType(keyUnlock.keySubType);
    if (worseKeySubType !== undefined) {
      return getUnlock(UnlockType.KEY, worseKeySubType);
    }
  }

  const func = SWAPPED_KEY_FUNCTIONS.get(keyUnlock.keySubType);
  return func === undefined ? undefined : func();
}

function getSwappedUnlockBattery(unlock: Unlock): Unlock | undefined {
  const batteryUnlock = unlock as BatteryUnlock;

  if (!anyActiveCollectibleUnlocked(false)) {
    return getRandomActiveCollectibleUnlock();
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

function getSwappedUnlockSlot(unlock: Unlock): Unlock | undefined {
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
  () => Unlock | undefined
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

function getSwappedUnlockGridEntity(unlock: Unlock): Unlock | undefined {
  const gridEntityUnlock = unlock as GridEntityUnlock;

  const func = SWAPPED_UNLOCK_GRID_ENTITY_FUNCTIONS.get(
    gridEntityUnlock.gridEntityType,
  );
  return func === undefined ? undefined : func();
}

const SWAPPED_UNLOCK_OTHER_FUNCTIONS = new ReadonlyMap<
  OtherUnlockKind,
  () => Unlock | undefined
>([
  [
    OtherUnlockKind.BEDS,
    () => {
      // 18
      if (!isRoomTypeUnlocked(RoomType.CLEAN_BEDROOM, false)) {
        return getUnlock(UnlockType.ROOM, RoomType.CLEAN_BEDROOM);
      }

      // 19
      if (!isRoomTypeUnlocked(RoomType.DIRTY_BEDROOM, false)) {
        return getUnlock(UnlockType.ROOM, RoomType.CLEAN_BEDROOM);
      }

      return undefined;
    },
  ],

  [
    OtherUnlockKind.BLUE_FIREPLACES,
    () => {
      if (
        isHardcoreMode() &&
        !isOtherUnlockKindUnlocked(OtherUnlockKind.PURPLE_FIREPLACES, false)
      ) {
        return getUnlock(UnlockType.OTHER, OtherUnlockKind.PURPLE_FIREPLACES);
      }

      return isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL);
    },
  ],

  [
    OtherUnlockKind.PURPLE_FIREPLACES,
    () =>
      isHeartSubTypeUnlocked(HeartSubType.SOUL, false)
        ? undefined
        : getUnlock(UnlockType.HEART, HeartSubType.SOUL),
  ],

  [
    OtherUnlockKind.GOLD_TRINKETS,
    () =>
      anyTrinketTypesUnlocked(false) ? undefined : getRandomTrinketUnlock(),
  ],

  [
    OtherUnlockKind.GOLD_PILLS,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],

  [
    OtherUnlockKind.HORSE_PILLS,
    () =>
      anyPillEffectsUnlocked(false) ? undefined : getRandomPillEffectUnlock(),
  ],
]);

function getSwappedUnlockOther(unlock: Unlock): Unlock | undefined {
  const otherUnlock = unlock as OtherUnlock;

  const func = SWAPPED_UNLOCK_OTHER_FUNCTIONS.get(otherUnlock.kind);
  return func === undefined ? undefined : func();
}

/**
 * Some collectibles/cards allow traveling into red rooms. Before this occurs, we must ensure that
 * all room types are unlocked (because off-grid rooms can be any room type).
 */
function swapAnyRoomUnlock() {
  assertNotNull(
    v.persistent.seed,
    "Failed to swap achievements due to the seed being null.",
  );

  const nightmareMode = isNightmareMode();
  const unlockableRoomTypes = getUnlockableRoomTypes(nightmareMode);
  const shuffledRoomTypes = shuffleArray(
    unlockableRoomTypes,
    v.persistent.seed,
  );
  for (const roomType of shuffledRoomTypes) {
    if (!isRoomTypeUnlocked(roomType, false)) {
      return getUnlock(UnlockType.ROOM, roomType);
    }
  }

  return undefined;
}

function getRandomActiveCollectibleUnlock(): CollectibleUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random active collectible unlock since the seed was null.",
  );
  const collectibleType = getRandomArrayElement(
    UNLOCKABLE_ACTIVE_COLLECTIBLE_TYPES,
    v.persistent.seed,
  );
  return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
}

function getRandomFamiliarCollectibleUnlock(): CollectibleUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random familiar collectible unlock since the seed was null.",
  );

  const collectibleType = getRandomArrayElement(
    UNLOCKABLE_FAMILIAR_COLLECTIBLE_TYPES,
    v.persistent.seed,
  );
  return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
}

function getRandomTrinketUnlock(): TrinketUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random trinket unlock since the seed was null.",
  );

  const trinketTypes = isHardcoreMode()
    ? getTrinketTypesOfQuality(0).filter((trinketType) =>
        UNLOCKABLE_TRINKET_TYPES.includes(trinketType),
      )
    : UNLOCKABLE_TRINKET_TYPES;

  const trinketType = getRandomArrayElement(trinketTypes, v.persistent.seed);

  return {
    type: UnlockType.TRINKET,
    trinketType,
  };
}

function getRandomCardUnlock(): CardUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random card unlock since the seed was null.",
  );

  const cardTypes = isHardcoreMode()
    ? getCardTypesOfQuality(0).filter((cardType) =>
        UNLOCKABLE_CARD_TYPES.includes(cardType),
      )
    : UNLOCKABLE_CARD_TYPES;

  const cardType = getRandomArrayElement(cardTypes, v.persistent.seed);

  return {
    type: UnlockType.CARD,
    cardType,
  };
}

function getRandomRuneUnlock(): CardUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random rune unlock since the seed was null.",
  );

  const cardTypes = isHardcoreMode()
    ? getRunesOfQuality(0).filter((cardType) =>
        UNLOCKABLE_CARD_TYPES.includes(cardType),
      )
    : UNLOCKABLE_RUNE_CARD_TYPES;

  const cardType = getRandomArrayElement(cardTypes, v.persistent.seed);

  return {
    type: UnlockType.CARD,
    cardType,
  };
}

function getRandomPillEffectUnlock(): PillEffectUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random pill effect unlock since the seed was null.",
  );

  const pillEffects = isHardcoreMode()
    ? getPillEffectsOfQuality(0).filter((pillEffect) =>
        UNLOCKABLE_PILL_EFFECTS.includes(pillEffect),
      )
    : UNLOCKABLE_PILL_EFFECTS;

  // We never want to randomly unlock Vurp, since that could lead to infinite loops.
  const modifiedPillEffects = arrayRemove(pillEffects, PillEffect.VURP);

  const pillEffect = getRandomArrayElement(
    modifiedPillEffects,
    v.persistent.seed,
  );

  return {
    type: UnlockType.PILL_EFFECT,
    pillEffect,
  };
}

function getRandomChestUnlock(): ChestUnlock {
  assertNotNull(
    v.persistent.seed,
    "Failed to get a random chest unlock since the seed was null.",
  );

  const pickupVariant = getRandomArrayElement(
    UNLOCKABLE_CHEST_PICKUP_VARIANTS,
    v.persistent.seed,
  );

  return {
    type: UnlockType.CHEST,
    pickupVariant,
  };
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
