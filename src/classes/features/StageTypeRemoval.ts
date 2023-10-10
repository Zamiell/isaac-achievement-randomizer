import type { LevelStage } from "isaac-typescript-definitions";
import { StageType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  getPlayerHealth,
  goToStage,
  log,
  onChallenge,
  setPlayerHealth,
} from "isaacscript-common";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isStageTypeUnlocked } from "./achievementTracker/completedUnlocks";
import { hasErrors } from "./checkErrors/v";

export class StageTypeRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_LEVEL_REORDERED)
  postNewLevelReordered(stage: LevelStage, stageType: StageType): void {
    if (hasErrors()) {
      return;
    }

    if (onChallenge(ChallengeCustom.RANDOMIZER_CHILL_ROOM)) {
      return;
    }

    if (isStageTypeUnlocked(stage, stageType, true)) {
      return;
    }

    const newStageType =
      stageType === StageType.REPENTANCE_B
        ? StageType.REPENTANCE
        : StageType.ORIGINAL;

    log(
      `Locked stage type detected (${stageType}). Warping to: StageType.${StageType[newStageType]} (${newStageType})`,
    );

    // Reloading the stage will cause collectibles (Dream Catcher, Empty Heart) and trinkets
    // (Maggy's Faith, Hollow Heart) to give extra health.
    const player = Isaac.GetPlayer();
    const playerHealth = getPlayerHealth(player);
    player.AddEternalHearts(-1);
    goToStage(stage, newStageType);
    setPlayerHealth(player, playerHealth);

    // Since we can change stages on the 0th frame of the run, we also need to notify the reordered
    // callbacks feature.
    mod.reorderedCallbacksSetStage(stage, newStageType);
  }
}
