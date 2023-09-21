import {
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
  game,
} from "isaacscript-common";
import { RANDOMIZED_COLLECTIBLE_TYPES } from "../constantsCollectibles";

export class ItemPoolRemoval extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const itemPool = game.GetItemPool();
    for (const collectibleType of RANDOMIZED_COLLECTIBLE_TYPES) {
      itemPool.RemoveCollectible(collectibleType);
    }
  }
}
