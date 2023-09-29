import { log } from "isaacscript-common";
import { ALL_ACHIEVEMENTS } from "./achievements";
import { ACHIEVEMENT_TYPES, OBJECTIVE_TYPES } from "./cachedEnums";
import { AchievementType } from "./enums/AchievementType";
import { ObjectiveType } from "./enums/ObjectiveType";
import { ALL_OBJECTIVES } from "./objectives";
import type { Achievement } from "./types/Achievement";
import type { Objective } from "./types/Objective";

export function validate(): void {
  if (ALL_OBJECTIVES.length === ALL_ACHIEVEMENTS.length) {
    return;
  }

  logObjectives(ALL_OBJECTIVES);
  logAchievements(ALL_ACHIEVEMENTS);

  let errorText = `There were ${ALL_OBJECTIVES.length} total objectives and ${ALL_ACHIEVEMENTS.length} total achievements. You need `;
  errorText +=
    ALL_OBJECTIVES.length > ALL_ACHIEVEMENTS.length
      ? `${ALL_OBJECTIVES.length - ALL_ACHIEVEMENTS.length} more achievements.`
      : `${ALL_ACHIEVEMENTS.length - ALL_OBJECTIVES.length} more objectives.`;

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

function logAchievements(achievements: readonly Achievement[]) {
  log(`Logging all achievements (${achievements.length}):`);

  for (const achievementType of ACHIEVEMENT_TYPES) {
    const thisTypeAchievements = achievements.filter(
      (achievement) => achievement.type === achievementType,
    );
    log(
      `- ${AchievementType[achievementType]} - ${thisTypeAchievements.length}`,
    );
  }
}
