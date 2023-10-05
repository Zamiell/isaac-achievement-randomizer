import { LevelStage, StageType } from "isaac-typescript-definitions";
import { isGreedMode } from "isaacscript-common";

export enum AltFloor {
  CELLAR,
  BURNING_BASEMENT,
  CATACOMBS,
  FLOODED_CAVES,
  NECROPOLIS,
  DANK_DEPTHS,
  UTERO,
  SCARRED_WOMB,
  DROSS,
  ASHPIT,
  GEHENNA,
}

export function getAltFloor(
  stage: LevelStage,
  stageType: StageType,
): AltFloor | undefined {
  if (isGreedMode()) {
    return getAltFloorGreedMode(stage, stageType);
  }

  switch (stage) {
    // 1, 2
    case LevelStage.BASEMENT_1:
    case LevelStage.BASEMENT_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.CELLAR;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.BURNING_BASEMENT;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.DROSS;
        }

        default: {
          return undefined;
        }
      }
    }

    // 3, 4
    case LevelStage.CAVES_1:
    case LevelStage.CAVES_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.CATACOMBS;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.FLOODED_CAVES;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.ASHPIT;
        }

        default: {
          return undefined;
        }
      }
    }

    // 5, 6
    case LevelStage.DEPTHS_1:
    case LevelStage.DEPTHS_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.NECROPOLIS;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.DANK_DEPTHS;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.GEHENNA;
        }

        default: {
          return undefined;
        }
      }
    }

    // 7, 8
    case LevelStage.WOMB_1:
    case LevelStage.WOMB_2: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.UTERO;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.SCARRED_WOMB;
        }

        default: {
          return undefined;
        }
      }
    }

    default: {
      return undefined;
    }
  }
}

function getAltFloorGreedMode(
  stage: LevelStage,
  stageType: StageType,
): AltFloor | undefined {
  switch (stage) {
    // 1
    case LevelStage.BASEMENT_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.CELLAR;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.BURNING_BASEMENT;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.DROSS;
        }

        default: {
          return undefined;
        }
      }
    }

    // 2
    case LevelStage.CAVES_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.CATACOMBS;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.FLOODED_CAVES;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.ASHPIT;
        }

        default: {
          return undefined;
        }
      }
    }

    // 3
    case LevelStage.DEPTHS_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.NECROPOLIS;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.DANK_DEPTHS;
        }

        // 5
        case StageType.REPENTANCE_B: {
          return AltFloor.GEHENNA;
        }

        default: {
          return undefined;
        }
      }
    }

    // 4
    case LevelStage.WOMB_GREED_MODE: {
      switch (stageType) {
        // 1
        case StageType.WRATH_OF_THE_LAMB: {
          return AltFloor.UTERO;
        }

        // 2
        case StageType.AFTERBIRTH: {
          return AltFloor.SCARRED_WOMB;
        }

        default: {
          return undefined;
        }
      }
    }

    default: {
      return undefined;
    }
  }
}

export function getAltFloorName(altFloor: AltFloor): string {
  switch (altFloor) {
    case AltFloor.CELLAR: {
      return "Cellar";
    }

    case AltFloor.BURNING_BASEMENT: {
      return "Burning Basement";
    }

    case AltFloor.CATACOMBS: {
      return "Catacombs";
    }

    case AltFloor.FLOODED_CAVES: {
      return "Flooded Caves";
    }

    case AltFloor.NECROPOLIS: {
      return "Necropolis";
    }

    case AltFloor.DANK_DEPTHS: {
      return "Dank Depths";
    }

    case AltFloor.UTERO: {
      return "Utero";
    }

    case AltFloor.SCARRED_WOMB: {
      return "Scarred Womb";
    }

    case AltFloor.DROSS: {
      return "Dross";
    }

    case AltFloor.ASHPIT: {
      return "Ashpit";
    }

    case AltFloor.GEHENNA: {
      return "Gehenna";
    }
  }
}
