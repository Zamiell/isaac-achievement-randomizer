import {
  log,
  logAndPrint,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { showNewAchievement } from "./classes/features/AchievementText";
import { startRandomizer } from "./classes/features/AchievementTracker";
import { unlockCharacter, unlockCollectible } from "./consoleCommands";
import { AchievementType } from "./enums/AchievementType";
import { UnlockablePath } from "./enums/UnlockablePath";
import { mod } from "./mod";

/** Currently, F2 is set to execute this function. */
function debugCode(_params?: string) {
  // Add code here.
  startRandomizer(undefined);
  unlockCharacter("2");
  unlockCollectible("Moms Knife");
}

/** Hotkey 1 is bound to F2. */
export function hotkey1Function(): void {
  logAndPrint("Hotkey 1 activated.");
  debugCode();
}

/** Hotkey 2 is bound to F3. */
export function hotkey2Function(): void {
  logAndPrint("Hotkey 2 activated.");

  showNewAchievement({
    type: AchievementType.PATH,
    unlockablePath: UnlockablePath.THE_CHEST,
  });
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
