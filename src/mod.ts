import { ISCFeature, upgradeMod } from "isaacscript-common";
import { MOD_NAME } from "./constants";

const FEATURES = [
  ISCFeature.EXTRA_CONSOLE_COMMANDS,
  ISCFeature.SAVE_DATA_MANAGER,
] as const;

const modVanilla = RegisterMod(MOD_NAME, 1);
export const mod = upgradeMod(modVanilla, FEATURES);
