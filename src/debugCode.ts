import { PlayerType } from "isaac-typescript-definitions";
import {
  log,
  logAndPrint,
  restart,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { FIRST_UNLOCK_COLLECTIBLES } from "./classes/features/achievementTracker/swapUnlock";
import { mod } from "./mod";

/** Currently, F3 is set to execute this function. (`IS_DEV` must be set to true.) */
function debugCode(_params?: string) {
  // Add code here.
  for (const collectibleType of FIRST_UNLOCK_COLLECTIBLES) {
    Isaac.ExecuteCommand(`unlockCollectible ${collectibleType}`);
  }

  Isaac.ExecuteCommand(`unlockCharacter ${PlayerType.CAIN_B}`);
  restart(); // We need to restart the run for the unlocks to take effect.
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

/** Executed from the "d" console command. */
export function debugFunction(params?: string): void {
  setLogFunctionsGlobal();
  setTracebackFunctionsGlobal();
  mod.saveDataManagerSetGlobal();

  print("Executing debug function.");
  log("Entering debug function.");
  debugCode(params);
  log("Exiting debug function.");
}
