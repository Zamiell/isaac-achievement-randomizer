import { ISCFeature, upgradeMod } from "isaacscript-common";
import { MOD_NAME } from "./constants";

const FEATURES = [
  ISCFeature.CUSTOM_HOTKEYS,
  ISCFeature.EDEN_STARTING_STATS_HEALTH,
  ISCFeature.EXTRA_CONSOLE_COMMANDS,
  ISCFeature.FADE_IN_REMOVER,
  ISCFeature.FAST_RESET,
  ISCFeature.GAME_REORDERED_CALLBACKS,
  ISCFeature.ITEM_POOL_DETECTION,
  ISCFeature.MODDED_ELEMENT_DETECTION,
  ISCFeature.MODDED_ELEMENT_SETS,
  ISCFeature.RERUN_DETECTION,
  ISCFeature.RUN_IN_N_FRAMES,
  ISCFeature.RUN_NEXT_RUN,
  ISCFeature.SAVE_DATA_MANAGER,
] as const;

const modVanilla = RegisterMod(MOD_NAME, 1);
export const mod = upgradeMod(modVanilla, FEATURES);
