import { LevelStage, StageType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  getPlayerHealth,
  goToStage,
  isGreedMode,
  log,
  setPlayerHealth,
} from "isaacscript-common";
import { AltFloor } from "../../enums/AltFloor";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isAltFloorUnlocked } from "./AchievementTracker";

export class StageTypeRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_LEVEL_REORDERED)
  postNewLevelReordered(stage: LevelStage, stageType: StageType): void {
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
    setPlayerHealth(player, playerHealth);
  }
}

function isStageTypeUnlocked(stage: LevelStage, stageType: StageType): boolean {
  if (isGreedMode()) {
    return isStageTypeUnlockedGreedMode(stage, stageType);
  }

  switch (stage) {
    // 1, 2
    case LevelStage.BASEMENT_1:
    case LevelStage.BASEMENT_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.CELLAR);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.BURNING_BASEMENT);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.DROSS);
        }

        default: {
          return true;
        }
      }
    }

    // 3, 4
    case LevelStage.CAVES_1:
    case LevelStage.CAVES_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.CATACOMBS);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.FLOODED_CAVES);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.ASHPIT);
        }

        default: {
          return true;
        }
      }
    }

    // 5, 6
    case LevelStage.DEPTHS_1:
    case LevelStage.DEPTHS_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.NECROPOLIS);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.DANK_DEPTHS);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.GEHENNA);
        }

        default: {
          return true;
        }
      }
    }

    // 7, 8
    case LevelStage.WOMB_1:
    case LevelStage.WOMB_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.UTERO);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.SCARRED_WOMB);
        }

        default: {
          return true;
        }
      }
    }

    default: {
      return true;
    }
  }
}

function isStageTypeUnlockedGreedMode(
  stage: LevelStage,
  stageType: StageType,
): boolean {
  switch (stage) {
    // 1
    case LevelStage.BASEMENT_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.CELLAR);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.BURNING_BASEMENT);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.DROSS);
        }

        default: {
          return true;
        }
      }
    }

    // 2
    case LevelStage.CAVES_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.CATACOMBS);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.FLOODED_CAVES);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.ASHPIT);
        }

        default: {
          return true;
        }
      }
    }

    // 3
    case LevelStage.DEPTHS_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.NECROPOLIS);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.DANK_DEPTHS);
        }

        // 5
        case StageType.REPENTANCE_B: {
          return isAltFloorUnlocked(AltFloor.GEHENNA);
        }

        default: {
          return true;
        }
      }
    }

    // 4
    case LevelStage.WOMB_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return isAltFloorUnlocked(AltFloor.UTERO);
        }

        // 2
        case StageType.AFTERBIRTH: {
          return isAltFloorUnlocked(AltFloor.SCARRED_WOMB);
        }

        default: {
          return true;
        }
      }
    }

    default: {
      return true;
    }
  }
}
