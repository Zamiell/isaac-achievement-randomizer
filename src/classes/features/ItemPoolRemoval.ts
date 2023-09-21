import type {
  PillColor,
  PillEffect,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CardType,
  CoinSubType,
  CollectibleType,
  ModCallback,
  PickupVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  FIRST_PILL_COLOR,
  ModCallbackCustom,
  copySet,
  game,
  getNormalPillColorFromHorse,
  getRandomArrayElement,
  getRandomSetElement,
  isGoldPill,
  isHorsePill,
  isRune,
  isSuitCard,
  removeCollectibleFromPools,
  setCollectibleSubType,
} from "isaacscript-common";
import { mod } from "../../mod";
import {
  BANNED_COLLECTIBLE_TYPES,
  getRandomizedCollectibleTypes,
} from "../../randomizedCollectibleTypes";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  anyCardTypesUnlocked,
  anyPillEffectsUnlocked,
  getUnlockedCardTypes,
  getUnlockedPillEffects,
  getUnlockedTrinketTypes,
  isCardTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGoldPillUnlocked,
  isHorsePillsUnlocked,
  isPillEffectUnlocked,
  isTrinketTypeUnlocked,
} from "./AchievementTracker";

export class ItemPoolRemoval extends RandomizerModFeature {
  /**
   * Set items are unlockable, but they will show up even if they are removed from pools. Replace
   * them with Breakfast.
   */
  // 34, 100
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.COLLECTIBLE)
  postPickupInitCollectible(pickup: EntityPickup): void {
    const collectible = pickup as EntityPickupCollectible;
    if (!isCollectibleTypeUnlocked(collectible.SubType)) {
      setCollectibleSubType(collectible, CollectibleType.BREAKFAST);
    }
  }

  // 65
  @Callback(ModCallback.GET_PILL_EFFECT)
  getPillEffect(
    pillEffect: PillEffect,
    _pillColor: PillColor,
  ): PillEffect | undefined {
    if (isPillEffectUnlocked(pillEffect)) {
      return undefined;
    }

    const unlockedPillEffects = getUnlockedPillEffects();

    // If there are no unlocked pill effects, the pill will be replaced with a coin in the
    // `POST_PICKUP_SELECTION_FILTER` callback.
    if (unlockedPillEffects.size === 0) {
      return undefined;
    }

    return getRandomSetElement(unlockedPillEffects);
  }

  // 65
  @Callback(ModCallback.GET_CARD)
  getCard(
    _rng: RNG,
    cardType: CardType,
    includePlayingCards: boolean,
    includeRunes: boolean,
    onlyRunes: boolean,
  ): CardType | undefined {
    if (isCardTypeUnlocked(cardType)) {
      return undefined;
    }

    const unlockedCardTypes = getUnlockedCardTypes();

    // If there are no unlocked card types, the card will be replaced with a coin in the
    // `POST_PICKUP_SELECTION_FILTER` callback.
    if (unlockedCardTypes.size === 0) {
      return undefined;
    }

    const runeCardTypes = [...unlockedCardTypes].filter((unlockedCardType) =>
      isRune(unlockedCardType),
    );

    if (onlyRunes) {
      return runeCardTypes.length === 0
        ? CardType.RUNE_SHARD
        : getRandomArrayElement(runeCardTypes);
    }

    const playingCardTypes = [...unlockedCardTypes].filter((unlockedCardType) =>
      isSuitCard(unlockedCardType),
    );

    const cardTypesToUse = copySet(unlockedCardTypes);

    if (!includePlayingCards) {
      for (const playingCardType of playingCardTypes) {
        cardTypesToUse.delete(playingCardType);
      }
    }

    if (!includeRunes) {
      for (const runeCardType of runeCardTypes) {
        cardTypesToUse.delete(runeCardType);
      }
    }

    return getRandomSetElement(cardTypesToUse);
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const itemPool = game.GetItemPool();
    const randomizedCollectibleTypes = getRandomizedCollectibleTypes();

    for (const collectibleType of randomizedCollectibleTypes) {
      if (!isCollectibleTypeUnlocked(collectibleType)) {
        itemPool.RemoveCollectible(collectibleType);
      }
    }

    const trinketArray = mod.getTrinketArray();
    for (const trinketType of trinketArray) {
      if (!isTrinketTypeUnlocked(trinketType)) {
        itemPool.RemoveTrinket(trinketType);
      }
    }

    removeCollectibleFromPools(...BANNED_COLLECTIBLE_TYPES);
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.PILL, // 70
  )
  postPickupSelectionPill(
    _pickup: EntityPickup,
    _variant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyPillEffectsUnlocked()) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    const pillColor = subType as PillColor;

    if (isGoldPill(pillColor) && !isGoldPillUnlocked()) {
      return [PickupVariant.PILL, FIRST_PILL_COLOR];
    }

    if (isHorsePill(pillColor) && !isHorsePillsUnlocked()) {
      const normalPillColor = getNormalPillColorFromHorse(pillColor);
      return [PickupVariant.PILL, normalPillColor];
    }

    return undefined;
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.TAROT_CARD, // 300
  )
  postPickupSelectionTarotCard(
    _pickup: EntityPickup,
    _variant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyCardTypesUnlocked()) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    // We make Rune Shards elsewhere in this feature to signify that the card should be replaced
    // with a penny.
    const cardType = subType as CardType;
    if (cardType === CardType.RUNE_SHARD) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    return undefined;
  }

  /**
   * If the trinket pool is depleted, it will automatically refill the pool with every trinket. In
   * other words, this is no analogous "Breakfast" mechanic for trinkets. Thus, we must manually
   * replace locked trinket types with a random unlocked trinket type. (If no trinket types are
   * unlocked, we replace all trinkets with pennies.)
   */
  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.TRINKET, // 350
  )
  postPickupSelectionTrinket(
    _pickup: EntityPickup,
    _variant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const trinketType = subType as TrinketType;
    const unlockedTrinketTypes = getUnlockedTrinketTypes();
    if (unlockedTrinketTypes.has(trinketType)) {
      return undefined;
    }

    if (unlockedTrinketTypes.size === 0) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    const newTrinketType = getRandomSetElement(unlockedTrinketTypes);
    return [PickupVariant.TRINKET, newTrinketType];
  }
}
