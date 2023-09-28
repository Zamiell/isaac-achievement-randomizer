import {
  GridEntityType,
  PressurePlateVariant,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  RockAltType,
  getRockAltType,
} from "isaacscript-common";
import { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isGridEntityTypeUnlocked,
  isOtherAchievementsUnlocked,
  isPathUnlocked,
} from "./AchievementTracker";

export class GridEntityRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT)
  postGridEntityInit(gridEntity: GridEntity): void {
    const gridEntityType = gridEntity.GetType();

    if (!isGridEntityTypeUnlocked(gridEntityType)) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }

  // 6
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_ALT,
  )
  postGridEntityInitRockAlt(gridEntity: GridEntity): void {
    const rockAltType = getRockAltType();
    switch (rockAltType) {
      case RockAltType.URN: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.URNS)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      case RockAltType.MUSHROOM: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.MUSHROOMS)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      case RockAltType.SKULL: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.SKULLS)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      case RockAltType.POLYP: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.POLYPS)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      case RockAltType.BUCKET_DOWNPOUR:
      case RockAltType.BUCKET_DROSS: {
        break;
      }
    }
  }

  // 20, 1
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.PRESSURE_PLATE,
    PressurePlateVariant.REWARD_PLATE,
  )
  postGridEntityInitRewardPlate(gridEntity: GridEntity): void {
    if (!isOtherAchievementsUnlocked(OtherAchievementKind.REWARD_PLATES)) {
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
}
