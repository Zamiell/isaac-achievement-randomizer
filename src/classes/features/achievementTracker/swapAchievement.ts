import {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  HeartSubType,
  PickupVariant,
  PillEffect,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  ReadonlyMap,
  assertDefined,
  getChallengeBoss,
  getChallengeCharacter,
  log,
} from "isaacscript-common";
import { ALT_FLOORS } from "../../../cachedEnums";
import { AltFloor } from "../../../enums/AltFloor";
import { UnlockType } from "../../../enums/UnlockType";
import {
  UnlockablePath,
  getUnlockablePathFromStoryBoss,
} from "../../../enums/UnlockablePath";
import { getObjectiveFromID, getObjectiveText } from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import type { Unlock } from "../../../types/Unlock";
import { getUnlock, getUnlockText } from "../../../types/Unlock";
import {
  anyBadPillEffectsUnlocked,
  anyCardTypesUnlocked,
  anyCardsUnlocked,
  anyGoodPillEffectsUnlocked,
  anyPillEffectsUnlocked,
  anyRunesUnlocked,
  anyTrinketTypesUnlocked,
  getWorseLockedCardType,
  getWorseLockedCollectibleType,
  getWorseLockedPillEffect,
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
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
} from "./completedUnlocks";
import { v } from "./v";

const DEFAULT_TRINKET_UNLOCK = getUnlock(UnlockType.TRINKET, TrinketType.ERROR);

const DEFAULT_CARD_UNLOCK = getUnlock(UnlockType.CARD, CardType.FOOL);

const DEFAULT_PILL_UNLOCK = getUnlock(
  UnlockType.PILL_EFFECT,
  PillEffect.PARALYSIS,
);

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
    )}`,
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

function getSwappedUnlock(unlock: Unlock): Unlock | undefined {
  switch (unlock.type) {
    case UnlockType.PATH: {
      switch (unlock.unlockablePath) {
        case UnlockablePath.VOID: {
          if (!isPathUnlocked(UnlockablePath.BLUE_WOMB, false)) {
            return getUnlock(UnlockType.PATH, UnlockablePath.BLUE_WOMB);
          }

          return undefined;
        }

        case UnlockablePath.ASCENT: {
          if (!isCardTypeUnlocked(CardType.FOOL, false)) {
            return getUnlock(UnlockType.CARD, CardType.FOOL);
          }

          return undefined;
        }

        case UnlockablePath.BLACK_MARKETS: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.ALT_FLOOR: {
      switch (unlock.altFloor) {
        case AltFloor.DROSS:
        case AltFloor.ASHPIT:
        case AltFloor.GEHENNA: {
          if (!isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS, false)) {
            return getUnlock(UnlockType.PATH, UnlockablePath.REPENTANCE_FLOORS);
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.CHALLENGE: {
      const challengeCharacter = getChallengeCharacter(unlock.challenge);
      if (!isCharacterUnlocked(challengeCharacter)) {
        return getUnlock(UnlockType.CHARACTER, challengeCharacter);
      }

      // All the challenge bosses are story bosses.
      const challengeBossID = getChallengeBoss(unlock.challenge);
      const unlockablePath = getUnlockablePathFromStoryBoss(challengeBossID);
      if (unlockablePath !== undefined && !isPathUnlocked(unlockablePath)) {
        return getUnlock(UnlockType.PATH, unlockablePath);
      }

      const requiredCollectibleTypes =
        CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP.get(unlock.challenge);
      if (requiredCollectibleTypes !== undefined) {
        for (const collectibleType of requiredCollectibleTypes) {
          if (!isCollectibleTypeUnlocked(collectibleType, false)) {
            return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
          }
        }
      }

      return undefined;
    }

    case UnlockType.COLLECTIBLE: {
      // First, check to see if there is a worse collectible available to unlock.
      const worseCollectibleType = getWorseLockedCollectibleType(
        unlock.collectibleType,
      );
      if (worseCollectibleType !== undefined) {
        return getUnlock(UnlockType.COLLECTIBLE, worseCollectibleType);
      }

      switch (unlock.collectibleType) {
        // 75
        case CollectibleType.PHD: {
          if (!anyGoodPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 84
        case CollectibleType.WE_NEED_TO_GO_DEEPER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        // 85
        case CollectibleType.DECK_OF_CARDS: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 102
        case CollectibleType.MOMS_BOTTLE_OF_PILLS: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 139
        case CollectibleType.MOMS_PURSE: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 195
        case CollectibleType.MOMS_COIN_PURSE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 203
        case CollectibleType.HUMBLING_BUNDLE: {
          if (!isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)) {
            return getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK);
          }

          return undefined;
        }

        // 250
        case CollectibleType.BOGO_BOMBS: {
          if (!isBombSubTypeUnlocked(BombSubType.DOUBLE_PACK, false)) {
            return getUnlock(UnlockType.BOMB, BombSubType.DOUBLE_PACK);
          }

          return undefined;
        }

        // 251
        case CollectibleType.STARTER_DECK: {
          if (!anyCardTypesUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 252
        case CollectibleType.LITTLE_BAGGY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 263
        case CollectibleType.CLEAR_RUNE: {
          if (!anyRunesUnlocked(false)) {
            return getUnlock(UnlockType.CARD, CardType.RUNE_BLANK);
          }

          return undefined;
        }

        // 286
        case CollectibleType.BLANK_CARD: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 348
        case CollectibleType.PLACEBO: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 424
        case CollectibleType.SACK_HEAD: {
          if (!isSackSubTypeUnlocked(SackSubType.NORMAL, false)) {
            return getUnlock(UnlockType.SACK, SackSubType.NORMAL);
          }

          return undefined;
        }

        // 439
        case CollectibleType.MOMS_BOX: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 451
        case CollectibleType.TAROT_CLOTH: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 458
        case CollectibleType.BELLY_BUTTON: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 479
        case CollectibleType.SMELTER: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 491
        case CollectibleType.ACID_BABY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 538
        case CollectibleType.MARBLES: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 566
        case CollectibleType.DREAM_CATCHER: {
          for (const altFloor of ALT_FLOORS) {
            if (!isAltFloorUnlocked(altFloor, false)) {
              return getUnlock(UnlockType.ALT_FLOOR, altFloor);
            }
          }

          return undefined;
        }

        // 603
        case CollectibleType.BATTERY_PACK: {
          if (!isBatterySubTypeUnlocked(BatterySubType.NORMAL, false)) {
            return getUnlock(UnlockType.BATTERY, BatterySubType.NORMAL);
          }

          return undefined;
        }

        // 624
        case CollectibleType.BOOSTER_PACK: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 654
        case CollectibleType.FALSE_PHD: {
          if (!anyBadPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.TRINKET: {
      // First, check to see if there is a worse trinket available to unlock.
      const worseTrinketType = getWorseLockedTrinketType(unlock.trinketType);
      if (worseTrinketType !== undefined) {
        return getUnlock(UnlockType.TRINKET, worseTrinketType);
      }

      switch (unlock.trinketType) {
        // 22
        case TrinketType.DAEMONS_TAIL: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BLACK, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BLACK);
          }

          return undefined;
        }

        // 44
        case TrinketType.SAFETY_CAP: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 45
        case TrinketType.ACE_OF_SPADES: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 61
        case TrinketType.LEFT_HAND: {
          if (!isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)) {
            return getUnlock(UnlockType.CHEST, PickupVariant.RED_CHEST);
          }

          return undefined;
        }

        // 131
        case TrinketType.BLESSED_PENNY: {
          if (!isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL);
          }

          return undefined;
        }

        // 159
        case TrinketType.GILDED_KEY: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST);
          }

          return undefined;
        }

        // 168
        case TrinketType.HOLLOW_HEART: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.CARD: {
      // First, check to see if there is a worse trinket available to unlock.
      const worseCardType = getWorseLockedCardType(unlock.cardType);
      if (worseCardType !== undefined) {
        return getUnlock(UnlockType.CARD, worseCardType);
      }

      switch (unlock.cardType) {
        // 6
        case CardType.HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.SOUL, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.SOUL);
          }

          return undefined;
        }

        // 11
        case CardType.WHEEL_OF_FORTUNE: {
          if (!isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.SLOT_MACHINE);
          }

          return undefined;
        }

        // 15
        case CardType.TEMPERANCE: {
          if (
            !isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
          ) {
            return getUnlock(
              UnlockType.SLOT,
              SlotVariant.BLOOD_DONATION_MACHINE,
            );
          }

          return undefined;
        }

        // 21
        case CardType.JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.BEGGAR, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.BEGGAR);
          }

          return undefined;
        }

        // 6
        case CardType.REVERSE_HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        // 64
        case CardType.REVERSE_JUSTICE: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST);
          }

          return undefined;
        }

        // 70
        case CardType.REVERSE_TEMPERANCE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 72
        case CardType.REVERSE_TOWER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.ROCK_TINTED, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.ROCK_TINTED,
            );
          }

          return undefined;
        }

        // 76
        case CardType.REVERSE_JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.SHOP_RESTOCK_MACHINE, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.SHOP_RESTOCK_MACHINE);
          }

          return undefined;
        }

        // 77
        case CardType.REVERSE_WORLD: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.PILL_EFFECT: {
      // Check to see if there is a worse pill effect to unlock.
      const worsePillEffect = getWorseLockedPillEffect(unlock.pillEffect);
      if (worsePillEffect !== undefined) {
        return getUnlock(UnlockType.PILL_EFFECT, worsePillEffect);
      }

      return undefined;
    }

    default: {
      return undefined;
    }
  }
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
