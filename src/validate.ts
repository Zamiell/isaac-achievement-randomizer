import { log } from "isaacscript-common";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { OBJECTIVE_TYPE_VALUES, UNLOCK_TYPE_VALUES } from "./cachedEnumValues";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import type { Objective } from "./types/Objective";
import type { Unlock } from "./types/Unlock";

export function validateObjectivesUnlocksMatch(): void {
  // If there are more unlocks than objectives, then N trinkets will not be unlocked in a completed
  // playthrough. See "achievementAssignment.ts".
  if (ALL_OBJECTIVES.length <= ALL_UNLOCKS.length) {
    return;
  }

  logObjectives(ALL_OBJECTIVES);
  logUnlocks(ALL_UNLOCKS);

  const difference = ALL_UNLOCKS.length - ALL_OBJECTIVES.length;
  error(
    `There were ${ALL_OBJECTIVES.length} total objectives and ${ALL_UNLOCKS.length} total unlocks. You need ${difference} more objective(s) or ${difference} less unlock(s).`,
  );
}

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
