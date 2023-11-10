import type { Challenge, PlayerType } from "isaac-typescript-definitions";
import { Difficulty } from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import {
  assertDefined,
  getChallengeName,
  getCharacterName,
} from "isaacscript-common";
import { OBJECTIVE_TYPES_SET } from "../cachedEnums";
import {
  CharacterObjectiveKind,
  getCharacterObjectiveKindName,
} from "../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../enums/ObjectiveType";
import type { ObjectiveID } from "./ObjectiveID";

export interface CharacterObjective {
  type: ObjectiveType.CHARACTER;
  character: PlayerType;
  kind: CharacterObjectiveKind;
  difficulty: Difficulty.NORMAL | Difficulty.HARD;
}

export interface ChallengeObjective {
  type: ObjectiveType.CHALLENGE;
  challenge: Challenge;
}

export type Objective = CharacterObjective | ChallengeObjective;

type _Test = CompositionTypeSatisfiesEnum<Objective, ObjectiveType>;

const OBJECTIVE_TYPE_TO_OBJECTIVE_CONSTRUCTOR = {
  [ObjectiveType.CHARACTER]: (arg1, arg2, arg3) => ({
    type: ObjectiveType.CHARACTER,
    character: arg1,
    kind: arg2,
    difficulty: arg3,
  }),
  [ObjectiveType.CHALLENGE]: (arg1) => ({
    type: ObjectiveType.CHALLENGE,
    challenge: arg1,
  }),
} as const satisfies Record<
  ObjectiveType,
  (arg1: number, arg2: number, arg3: number) => Objective
>;

export function getObjective(
  type: ObjectiveType.CHARACTER,
  character: PlayerType,
  kind: CharacterObjectiveKind,
  difficulty: Difficulty.NORMAL | Difficulty.HARD,
): CharacterObjective;
export function getObjective(
  type: ObjectiveType.CHALLENGE,
  challenge: Challenge,
): ChallengeObjective;
export function getObjective(
  type: ObjectiveType,
  arg1: int,
  arg2?: int,
  arg3?: int,
): Objective {
  const constructor = OBJECTIVE_TYPE_TO_OBJECTIVE_CONSTRUCTOR[type];
  return constructor(arg1, arg2 ?? -1, arg3 ?? -1);
}

export function getObjectiveFromID(objectiveID: ObjectiveID): Objective {
  const parts = objectiveID.split(".");

  const typeString = parts[0];
  assertDefined(
    typeString,
    `Failed to parse the type from an objective ID: ${objectiveID}`,
  );

  const typeNumber = tonumber(typeString);
  assertDefined(
    typeNumber,
    `Failed to convert the type from an objective ID to a number: ${objectiveID}`,
  );

  // eslint-disable-next-line isaacscript/strict-enums
  if (!OBJECTIVE_TYPES_SET.has(typeNumber)) {
    error(`The type of ${typeNumber} in an objective ID is not valid.`);
  }

  const type = typeNumber as ObjectiveType;
  const constructor = OBJECTIVE_TYPE_TO_OBJECTIVE_CONSTRUCTOR[type];

  const arg1String = parts[1];
  assertDefined(
    arg1String,
    `Failed to parse the second number from an objective ID: ${objectiveID}`,
  );

  const arg1 = tonumber(arg1String);
  assertDefined(
    arg1,
    `Failed to convert the second number from an objective ID to a number: ${objectiveID}`,
  );

  if (type === ObjectiveType.CHARACTER) {
    const arg2String = parts[2];
    assertDefined(
      arg2String,
      `Failed to parse the third number from an objective ID: ${objectiveID}`,
    );

    const arg2 = tonumber(arg2String);
    assertDefined(
      arg2,
      `Failed to convert the third number from an objective ID to a number: ${objectiveID}`,
    );

    const arg3String = parts[3];
    assertDefined(
      arg3String,
      `Failed to parse the fourth number from an objective ID: ${objectiveID}`,
    );

    const arg3 = tonumber(arg3String);
    assertDefined(
      arg3,
      `Failed to convert the fourth number from an objective ID to a number: ${objectiveID}`,
    );

    return constructor(arg1, arg2, arg3);
  }

  return constructor(arg1, -1, -1);
}

export function getObjectiveText(objective: Objective): string[] {
  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      const characterName = getCharacterName(objective.character);
      const kindName = getCharacterObjectiveKindName(objective.kind);
      const difficultyText =
        objective.difficulty === Difficulty.NORMAL ? "(normal)" : "(hard)";

      return objective.kind < CharacterObjectiveKind.NO_HIT_BASEMENT
        ? ["Defeated", kindName, "on", characterName, difficultyText]
        : ["No damage on", kindName, "on", characterName, difficultyText];
    }

    case ObjectiveType.CHALLENGE: {
      const challengeName = getChallengeName(objective.challenge);
      return ["Completed challenge:", challengeName];
    }
  }
}
