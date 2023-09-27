import { Keyboard } from "isaac-typescript-definitions";
import {
  initModFeatures,
  log,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { AchievementDetection } from "./classes/features/AchievementDetection";
import { AchievementText } from "./classes/features/AchievementText";
import { AchievementTracker } from "./classes/features/AchievementTracker";
import { CheckErrors } from "./classes/features/CheckErrors";
import { PathRemoval } from "./classes/features/PathRemoval";
import { PickupRemoval } from "./classes/features/PickupRemoval";
import { PreventPause } from "./classes/features/PreventPause";
import { PreventSaveAndQuit } from "./classes/features/PreventSaveAndQuit";
import { PreventVictoryLapPopup } from "./classes/features/PreventVictoryLapPopup";
import { RemoveDonationMachines } from "./classes/features/RemoveDonationMachines";
import { StartingRoomInfo } from "./classes/features/StartingRoomInfo";
import { Timer } from "./classes/features/Timer";
import { initConsoleCommands } from "./consoleCommands";
import { IS_DEV, MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";
import { debugFunction, hotkey1Function, hotkey2Function } from "./debugCode";
import { mod } from "./mod";

const MOD_FEATURES = [
  AchievementDetection,
  AchievementText,
  AchievementTracker,
  CheckErrors,
  PathRemoval,
  PickupRemoval,
  PreventPause,
  PreventSaveAndQuit,
  PreventVictoryLapPopup,
  RemoveDonationMachines,
  StartingRoomInfo,
  Timer,
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
    mod.setHotkey(Keyboard.F3, hotkey1Function);
    mod.setHotkey(Keyboard.F4, hotkey2Function);
  }

  initDeadSeaScrolls();
  initModFeatures(mod, MOD_FEATURES);
  initConsoleCommands();
}
