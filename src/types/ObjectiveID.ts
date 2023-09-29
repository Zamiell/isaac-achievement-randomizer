import { ObjectiveType } from "../enums/ObjectiveType";
import type { Objective } from "./Objective";

/**
 * A string that represents an objective. This is the objective metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
export type ObjectiveID = string & { readonly __objectiveIDBrand: symbol };

export function getObjectiveID(objective: Objective): ObjectiveID {
  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      return `${objective.type}.${objective.character}.${objective.kind}` as ObjectiveID;
    }

    case ObjectiveType.BOSS: {
      return `${objective.type}.${objective.bossID}` as ObjectiveID;
    }

    case ObjectiveType.CHALLENGE: {
      return `${objective.type}.${objective.challenge}` as ObjectiveID;
    }
  }
}
