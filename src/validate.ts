import { log } from "isaacscript-common";
import { OBJECTIVE_TYPE_VALUES, UNLOCK_TYPE_VALUES } from "./cachedEnumValues";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import type { Objective } from "./types/Objective";
import type { Unlock } from "./types/Unlock";

export function logObjectives(objectives: readonly Objective[]): void {
  log(`Logging all objectives (${objectives.length}):`);

  for (const objectiveType of OBJECTIVE_TYPE_VALUES) {
    const thisTypeObjectives = objectives.filter(
      (objective) => objective.type === objectiveType,
    );
    log(`- ${ObjectiveType[objectiveType]} - ${thisTypeObjectives.length}`);
  }
}

export function logUnlocks(unlocks: readonly Unlock[]): void {
  log(`Logging all unlocks (${unlocks.length}):`);

  for (const unlockType of UNLOCK_TYPE_VALUES) {
    const thisTypeUnlocks = unlocks.filter(
      (unlock) => unlock.type === unlockType,
    );
    log(`- ${UnlockType[unlockType]} - ${thisTypeUnlocks.length}`);
  }
}
