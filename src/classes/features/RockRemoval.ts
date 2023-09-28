import { GridEntityType } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isFoolsGoldUnlocked,
  isTintedRocksUnlocked,
} from "./AchievementTracker";

export class RockRemoval extends RandomizerModFeature {
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_TINTED,
  )
  postGridEntityInitRockTinted(gridEntity: GridEntity): void {
    if (!isTintedRocksUnlocked()) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }

  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_GOLD,
  )
  postGridEntityInitRockGold(gridEntity: GridEntity): void {
    if (!isFoolsGoldUnlocked()) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }
}
