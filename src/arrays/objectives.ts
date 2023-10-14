import { MAIN_CHARACTERS } from "isaacscript-common";
import { CHARACTER_OBJECTIVE_KINDS, OBJECTIVE_TYPES } from "../cachedEnums";
import { ObjectiveType } from "../enums/ObjectiveType";
import type { Objective } from "../types/Objective";
import { NO_HIT_BOSSES } from "./noHitBosses";
import { UNLOCKABLE_CHALLENGES } from "./unlockableChallenges";

export const ALL_OBJECTIVES: readonly Objective[] = (() => {
  const objectives: Objective[] = [];

  for (const objectiveType of OBJECTIVE_TYPES) {
    switch (objectiveType) {
      case ObjectiveType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          for (const kind of CHARACTER_OBJECTIVE_KINDS) {
            const objective: Objective = {
              type: ObjectiveType.CHARACTER,
              character,
              kind,
            };
            objectives.push(objective);
          }
        }

        break;
      }

      case ObjectiveType.BOSS: {
        for (const bossID of NO_HIT_BOSSES) {
          const objective: Objective = {
            type: ObjectiveType.BOSS,
            bossID,
          };
          objectives.push(objective);
        }

        break;
      }

      case ObjectiveType.CHALLENGE: {
        for (const challenge of UNLOCKABLE_CHALLENGES) {
          const objective: Objective = {
            type: ObjectiveType.CHALLENGE,
            challenge,
          };
          objectives.push(objective);
        }

        break;
      }
    }
  }

  return objectives;
})();
