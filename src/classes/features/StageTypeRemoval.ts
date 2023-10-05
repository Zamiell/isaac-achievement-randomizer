import type { LevelStage } from "isaac-typescript-definitions";
import { StageType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  getPlayerHealth,
  goToStage,
  log,
  setPlayerHealth,
} from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isStageTypeUnlocked } from "./AchievementTracker";
import { hasErrors } from "./checkErrors/v";

export class StageTypeRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_LEVEL_REORDERED)
  postNewLevelReordered(stage: LevelStage, stageType: StageType): void {
    if (hasErrors()) {
      return;
    }

    if (isStageTypeUnlocked(stage, stageType)) {
      return;
    }

    log(
      `Locked stage type detected (${stageType}). Going to the original version of the stage.`,
    );

    // Reloading the stage will cause collectibles (Dream Catcher, Empty Heart) and trinkets
    // (Maggy's Faith, Hollow Heart) to give extra health.
    const player = Isaac.GetPlayer();
    const playerHealth = getPlayerHealth(player);
    player.AddEternalHearts(-1);
    goToStage(stage, StageType.ORIGINAL);
    mod.reorderedCallbacksSetStage(stage, StageType.ORIGINAL);
    setPlayerHealth(player, playerHealth);
  }
}
