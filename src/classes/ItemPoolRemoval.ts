import {
  CoinSubType,
  PickupVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
  game,
  getRandomSetElement,
} from "isaacscript-common";
import { mod } from "../mod";
import {
  getUnlockedTrinketTypes,
  isRandomizerEnabled,
} from "./AchievementTracker";
import { getRandomizedCollectibleTypes } from "./randomizedCollectibleTypes";

export class ItemPoolRemoval extends ModFeature {
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
