import {
  BombSubType,
  CoinSubType,
  CollectibleType,
  ModCallback,
  PickupVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
  game,
  getRandomSetElement,
  setCollectibleSubType,
} from "isaacscript-common";
import { mod } from "../mod";
import { getRandomizedCollectibleTypes } from "../randomizedCollectibleTypes";
import {
  getUnlockedTrinketTypes,
  isCollectibleTypeUnlocked,
  isRandomizerEnabled,
} from "./AchievementTracker";

export class ItemPoolRemoval extends ModFeature {
  /**
   * Set items are unlockable, but they will show up even if they are removed from pools. Replace
   * them with Breakfast.
   */
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

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    if (!isRandomizerEnabled()) {
      return;
    }

    const itemPool = game.GetItemPool();
    const randomizedCollectibleTypes = getRandomizedCollectibleTypes();

    for (const collectibleType of randomizedCollectibleTypes) {
      itemPool.RemoveCollectible(collectibleType);
    }

    const trinketArray = mod.getTrinketArray();
    for (const trinketType of trinketArray) {
      if (trinketType !== TrinketType.BABY_BENDER) {
        itemPool.RemoveTrinket(trinketType);
      }
    }
  }

  @Callback(ModCallback.POST_PICKUP_SELECTION)
  postPickupSelection(
    _pickup: EntityPickup,
    variant: PickupVariant,
    subType: int,
  ): undefined {
    if (variant === PickupVariant.BOMB && subType === BombSubType.TROLL) {
      Isaac.DebugString("GETTING HERE");
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
    PickupVariant.TRINKET,
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
