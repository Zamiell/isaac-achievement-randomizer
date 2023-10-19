import { log } from "isaacscript-common";
import { ALL_OBJECTIVES } from "./arrays/objectives";
import { getAllUnlocks } from "./arrays/unlocks";
import { OBJECTIVE_TYPES, UNLOCK_TYPES } from "./cachedEnums";
import { ObjectiveType } from "./enums/ObjectiveType";
import { RandomizerMode } from "./enums/RandomizerMode";
import { UnlockType } from "./enums/UnlockType";
import type { Objective } from "./types/Objective";
import type { Unlock } from "./types/Unlock";

export function validateObjectivesUnlocksMatch(
  randomizerMode: RandomizerMode,
): void {
  const nightmareMode = randomizerMode === RandomizerMode.NIGHTMARE;
  const allUnlocks = getAllUnlocks(nightmareMode);

  // In Nightmare Mode, we have more unlocks than objectives.
  if (ALL_OBJECTIVES.length === allUnlocks.length || nightmareMode) {
    return;
  }

  logObjectives(ALL_OBJECTIVES);
  logUnlocks(allUnlocks);

  let errorText = `There were ${ALL_OBJECTIVES.length} total objectives and ${allUnlocks.length} total unlocks. You need `;
  errorText +=
    ALL_OBJECTIVES.length > allUnlocks.length
      ? `${ALL_OBJECTIVES.length - allUnlocks.length} more unlock(s) or ${
          ALL_OBJECTIVES.length - allUnlocks.length
        } less objective(s).`
      : `${allUnlocks.length - ALL_OBJECTIVES.length} more objective(s) or ${
          allUnlocks.length - ALL_OBJECTIVES.length
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
