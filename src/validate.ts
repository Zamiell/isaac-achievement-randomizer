import { log } from "isaacscript-common";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { OBJECTIVE_TYPES, UNLOCK_TYPES } from "./cachedEnums";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import type { Objective } from "./types/Objective";
import type { Unlock } from "./types/Unlock";

export function validateObjectivesUnlocksMatch(): void {
  if (ALL_OBJECTIVES.length === ALL_UNLOCKS.length) {
    return;
  }

  logObjectives(ALL_OBJECTIVES);
  logUnlocks(ALL_UNLOCKS);

  let errorText = `There were ${ALL_OBJECTIVES.length} total objectives and ${ALL_UNLOCKS.length} total unlocks. You need `;
  errorText +=
    ALL_OBJECTIVES.length > ALL_UNLOCKS.length
      ? `${ALL_OBJECTIVES.length - ALL_UNLOCKS.length} more unlock(s) or ${
          ALL_OBJECTIVES.length - ALL_UNLOCKS.length
        } less objective(s).`
      : `${ALL_UNLOCKS.length - ALL_OBJECTIVES.length} more objective(s) or ${
          ALL_UNLOCKS.length - ALL_OBJECTIVES.length
        } less unlock(s).`;

  error(errorText);
}

function logObjectives(objectives: readonly Objective[]) {
  log(`Logging all objectives (${objectives.length}):`);

  for (const objectiveType of OBJECTIVE_TYPES) {
    const thisTypeObjectives = objectives.filter(
      (objective) => objective.type === objectiveType,
    );
    log(`- ${ObjectiveType[objectiveType]} - ${thisTypeObjectives.length}`);
  }
}

function logUnlocks(unlocks: readonly Unlock[]) {
  log(`Logging all unlocks (${unlocks.length}):`);

  for (const unlockType of UNLOCK_TYPES) {
    const thisTypeUnlocks = unlocks.filter(
      (unlock) => unlock.type === unlockType,
    );
    log(`- ${UnlockType[unlockType]} - ${thisTypeUnlocks.length}`);
  }
}
