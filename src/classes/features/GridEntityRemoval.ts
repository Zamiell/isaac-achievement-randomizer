import {
  GridEntityType,
  PoopGridEntityVariant,
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

  // 14
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT, GridEntityType.POOP)
  postGridEntityInitPoop(gridEntity: GridEntity): void {
    const gridEntityVariant = gridEntity.GetVariant() as PoopGridEntityVariant;

    switch (gridEntityVariant) {
      // 3
      case PoopGridEntityVariant.GOLDEN: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.GOLDEN_POOP)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      // 4
      case PoopGridEntityVariant.RAINBOW: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.RAINBOW_POOP)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      // 5
      case PoopGridEntityVariant.BLACK: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.BLACK_POOP)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      // 11
      case PoopGridEntityVariant.CHARMING: {
        if (!isOtherAchievementsUnlocked(OtherAchievementKind.CHARMING_POOP)) {
          gridEntity.SetType(GridEntityType.ROCK);
        }

        break;
      }

      default: {
        break;
      }
    }

    if (!isPathUnlocked(UnlockablePath.ASCENT)) {
      gridEntity.SetType(GridEntityType.ROCK);
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
    if (!isPathUnlocked(UnlockablePath.ASCENT)) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }
}
