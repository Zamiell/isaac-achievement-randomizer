import type {
  PillColor,
  PillEffect,
  TrinketType,
} from "isaac-typescript-definitions";
import {
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
  ModFeature,
  game,
  getNormalPillColorFromHorse,
  getRandomSetElement,
  isGoldPill,
  isHorsePill,
  removeCollectibleFromPools,
  setCollectibleSubType,
} from "isaacscript-common";
import { mod } from "../mod";
import {
  BANNED_COLLECTIBLE_TYPES,
  getRandomizedCollectibleTypes,
} from "../randomizedCollectibleTypes";
import {
  anyPillEffectsUnlocked,
  getUnlockedPillEffects,
  getUnlockedTrinketTypes,
  isCollectibleTypeUnlocked,
  isGoldPillUnlocked,
  isHorsePillsUnlocked,
  isPillEffectUnlocked,
  isRandomizerEnabled,
  isTrinketTypeUnlocked,
} from "./AchievementTracker";

export class ItemPoolRemoval extends ModFeature {
  /**
   * Set items are unlockable, but they will show up even if they are removed from pools. Replace
   * them with Breakfast.
   */
  // 34, 100
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.COLLECTIBLE)
  postPickupInitCollectible(pickup: EntityPickup): void {
    if (!isRandomizerEnabled()) {
      return;
    }

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
    if (!isPillEffectUnlocked(pillEffect)) {
      const pillEffects = getUnlockedPillEffects();

      // If there are no unlocked pill effects, the pill will be replaced with a coin in the
      // `POST_PICKUP_SELECTION_FILTER` callback.
      return pillEffects.size === 0
        ? undefined
        : getRandomSetElement(pillEffects);
    }

    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    if (!isRandomizerEnabled()) {
      return;
    }

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
  postPickupSelection(
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
    if (!isRandomizerEnabled()) {
      return undefined;
    }

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
