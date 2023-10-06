import { log } from "isaacscript-common";
import { OBJECTIVE_TYPES, UNLOCK_TYPES } from "./cachedEnums";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockType } from "./enums/UnlockType";
import { ALL_OBJECTIVES } from "./objectives";
import type { Objective } from "./types/Objective";
import type { Unlock } from "./types/Unlock";
import { ALL_UNLOCKS } from "./unlocks";

export function validate(): void {
  if (ALL_OBJECTIVES.length === ALL_UNLOCKS.length) {
    return;
  }

  logObjectives(ALL_OBJECTIVES);
  logAchievements(ALL_UNLOCKS);

  let errorText = `There were ${ALL_OBJECTIVES.length} total objectives and ${ALL_UNLOCKS.length} total achievements. You need `;
  errorText +=
    ALL_OBJECTIVES.length > ALL_UNLOCKS.length
      ? `${ALL_OBJECTIVES.length - ALL_UNLOCKS.length} more achievements.`
      : `${ALL_UNLOCKS.length - ALL_OBJECTIVES.length} more objectives.`;

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

function logAchievements(achievements: readonly Unlock[]) {
  log(`Logging all achievements (${achievements.length}):`);

  for (const unlockType of UNLOCK_TYPES) {
    const thisTypeAchievements = achievements.filter(
      (achievement) => achievement.type === unlockType,
    );
    log(`- ${UnlockType[unlockType]} - ${thisTypeAchievements.length}`);
  }
}
