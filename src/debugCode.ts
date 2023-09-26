import {
  log,
  logAndPrint,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { startRandomizer } from "./classes/features/AchievementTracker";
import { unlockChar } from "./consoleCommands";
import { mod } from "./mod";

/** Currently, F2 is set to execute this function. */
function debugCode(_params?: string) {
  // Add code here.
  startRandomizer(undefined);
  unlockChar("2");
}

/** Hotkey 1 is bound to F2. */
export function hotkey1Function(): void {
  logAndPrint("Hotkey 1 activated.");
  debugCode();
}

/** Executed from the "debug" console command. */
export function debugFunction(params?: string): void {
  setLogFunctionsGlobal();
  setTracebackFunctionsGlobal();
  mod.saveDataManagerSetGlobal();

  print("Executing debug function.");
  log("Entering debug function.");
  debugCode(params);
  log("Exiting debug function.");
}
