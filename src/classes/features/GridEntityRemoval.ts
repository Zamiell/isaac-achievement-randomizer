import { GridEntityType } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isOtherAchievementsUnlocked,
  isPathUnlocked,
} from "./AchievementTracker";

export class GridEntityRemoval extends RandomizerModFeature {
  // 4
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_TINTED,
  )
  postGridEntityInitRockTinted(gridEntity: GridEntity): void {
    if (!isOtherAchievementsUnlocked(OtherAchievementKind.TINTED_ROCKS)) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }

  // 22
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_SUPER_SPECIAL,
  )
  postGridEntityInitRockSuperSpecial(gridEntity: GridEntity): void {
    if (!isOtherAchievementsUnlocked(OtherAchievementKind.SUPER_TINTED_ROCKS)) {
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
    if (!isOtherAchievementsUnlocked(OtherAchievementKind.FOOLS_GOLD)) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }
}
