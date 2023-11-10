import { MAIN_CHARACTERS } from "isaacscript-common";
import { CHARACTER_OBJECTIVE_KINDS, OBJECTIVE_TYPES } from "../cachedEnums";
import { DIFFICULTIES } from "../constants";
import { ObjectiveType } from "../enums/ObjectiveType";
import type { Objective } from "../types/Objective";
import type { ObjectiveID } from "../types/ObjectiveID";
import { getObjectiveID } from "../types/ObjectiveID";
import { UNLOCKABLE_CHALLENGES } from "./unlockableChallenges";

export const ALL_OBJECTIVES: readonly Objective[] = (() => {
  const objectives: Objective[] = [];

  for (const objectiveType of OBJECTIVE_TYPES) {
    switch (objectiveType) {
      case ObjectiveType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          for (const kind of CHARACTER_OBJECTIVE_KINDS) {
            for (const difficulty of DIFFICULTIES) {
              const objective: Objective = {
                type: ObjectiveType.CHARACTER,
                character,
                kind,
                difficulty,
              };
              objectives.push(objective);
            }
          }
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

export const ALL_OBJECTIVE_IDS: readonly ObjectiveID[] = ALL_OBJECTIVES.map(
  (objective) => getObjectiveID(objective),
);
