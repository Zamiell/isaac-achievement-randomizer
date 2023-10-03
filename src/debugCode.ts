import {
  log,
  logAndPrint,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { startRandomizer } from "./classes/features/AchievementTracker";
import { mod } from "./mod";

/** Currently, F3 is set to execute this function. */
function debugCode(_params?: string) {
  // Add code here.
  startRandomizer(undefined);
}

/** Hotkey 1 is bound to F3. */
export function hotkey1Function(): void {
  logAndPrint("Hotkey 1 activated.");
  debugCode();
}

/** Hotkey 2 is bound to F4. */
export function hotkey2Function(): void {
  logAndPrint("Hotkey 2 activated.");
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
