import {
  GridEntityType,
  PressurePlateVariant,
} from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isGridEntityTypeUnlocked } from "./AchievementTracker";

export class GridEntityRemoval extends RandomizerModFeature {
  // 4
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT)
  postGridEntityInit(gridEntity: GridEntity): void {
    const gridEntityType = gridEntity.GetType();
    const gridEntityVariant = gridEntity.GetVariant();

    if (
      gridEntityType !== GridEntityType.PRESSURE_PLATE &&
      !isGridEntityTypeUnlocked(gridEntityType)
    ) {
      gridEntity.SetType(GridEntityType.ROCK);
    }

    if (
      gridEntityType === GridEntityType.PRESSURE_PLATE &&
      gridEntityVariant === PressurePlateVariant.REWARD_PLATE &&
      !isGridEntityTypeUnlocked(gridEntityType)
    ) {
      gridEntity.SetType(GridEntityType.ROCK);
    }
  }
}
