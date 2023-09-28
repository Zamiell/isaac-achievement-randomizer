import { GridEntityType } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isFoolsGoldUnlocked,
  isPathUnlocked,
  isTintedRocksUnlocked,
} from "./AchievementTracker";

export class RockRemoval extends RandomizerModFeature {
  // 4
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_TINTED,
  )
  postGridEntityInitRockTinted(gridEntity: GridEntity): void {
    if (!isTintedRocksUnlocked()) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }

  // 26
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_ALT_2,
  )
  postGridEntityInitRockAlt2(gridEntity: GridEntity): void {
    if (!isPathUnlocked(UnlockablePath.THE_ASCENT)) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }

  // 27
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
