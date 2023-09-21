import { Keyboard } from "isaac-typescript-definitions";
import {
  initModFeatures,
  log,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { AchievementTracker } from "./classes/AchievementTracker";
import { BossKillDetection } from "./classes/BossKillDetection";
import { CheckErrors } from "./classes/CheckErrors";
import { ItemPoolRemoval } from "./classes/ItemPoolRemoval";
import { IS_DEV, MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";
import { debugFunction, hotkey1Function } from "./debugCode";
import { mod } from "./mod";

const MOD_FEATURES = [
  AchievementTracker,
  BossKillDetection,
  CheckErrors,
  ItemPoolRemoval,
] as const;

export function main(): void {
  log(`${MOD_NAME} initialized.`);

  if (IS_DEV) {
    setLogFunctionsGlobal();
    setTracebackFunctionsGlobal();
    mod.saveDataManagerSetGlobal();

    mod.enableFastReset();
    mod.removeFadeIn();

    mod.addConsoleCommand("d", debugFunction);
    mod.setHotkey(Keyboard.F2, hotkey1Function);
  }

  initDeadSeaScrolls();
  initModFeatures(mod, MOD_FEATURES);
}
