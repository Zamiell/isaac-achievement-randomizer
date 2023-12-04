import { ObjectiveType } from "../enums/ObjectiveType";
import type {
  BossObjective,
  ChallengeObjective,
  CharacterObjective,
  Objective,
} from "./Objective";

/**
 * A string that represents an objective. This is the objective metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
export type ObjectiveID = string & { readonly __objectiveIDBrand: symbol };

const OBJECTIVE_TYPE_TO_ID_CONSTRUCTOR = {
  [ObjectiveType.CHARACTER]: (objective) => {
    const characterObjective = objective as CharacterObjective;
    return `${characterObjective.type}.${characterObjective.character}.${characterObjective.kind}.${characterObjective.difficulty}` as ObjectiveID;
  },
  [ObjectiveType.BOSS]: (objective) => {
    const bossObjective = objective as BossObjective;
    return `${bossObjective.type}.${bossObjective.bossID}` as ObjectiveID;
  },
  [ObjectiveType.CHALLENGE]: (objective) => {
    const challengeObjective = objective as ChallengeObjective;
    return `${challengeObjective.type}.${challengeObjective.challenge}` as ObjectiveID;
  },
} as const satisfies Record<
  ObjectiveType,
  (objective: Objective) => ObjectiveID
>;

export function getObjectiveID(objective: Objective): ObjectiveID {
  const constructor = OBJECTIVE_TYPE_TO_ID_CONSTRUCTOR[objective.type];
  return constructor(objective);
}
