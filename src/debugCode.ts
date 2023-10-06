import { BossID, PlayerType } from "isaac-typescript-definitions";
import {
  log,
  logAndPrint,
  setLogFunctionsGlobal,
  setTracebackFunctionsGlobal,
} from "isaacscript-common";
import { addObjective } from "./classes/features/achievementTracker/addObjective";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { mod } from "./mod";
import { getObjective } from "./types/Objective";

/** Currently, F3 is set to execute this function. */
function debugCode(_params?: string) {
  // Add code here.
  /// startRandomizer(RandomizerMode.HARDCORE, undefined);
  addObjective(getObjective(ObjectiveType.BOSS, BossID.MONSTRO));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_BASEMENT_1,
    ),
  );
  addObjective(getObjective(ObjectiveType.BOSS, BossID.GEMINI));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_BASEMENT_2,
    ),
  );
  addObjective(getObjective(ObjectiveType.BOSS, BossID.RAG_MEGA));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_CAVES_1,
    ),
  );
  addObjective(getObjective(ObjectiveType.BOSS, BossID.CHUB));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_CAVES_2,
    ),
  );
  addObjective(getObjective(ObjectiveType.BOSS, BossID.WAR));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_DEPTHS_1,
    ),
  );
  addObjective(getObjective(ObjectiveType.BOSS, BossID.MOM));
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.NO_HIT_DEPTHS_2,
    ),
  );
  addObjective(
    getObjective(
      ObjectiveType.CHARACTER,
      PlayerType.ISAAC,
      CharacterObjectiveKind.MOM,
    ),
  );
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
