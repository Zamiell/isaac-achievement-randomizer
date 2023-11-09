import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import {
  assertDefined,
  getChallengeName,
  getCharacterName,
} from "isaacscript-common";
import { getNumMinutesForBossObjective } from "../arrays/noHitBosses";
import { OBJECTIVE_TYPES_SET } from "../cachedEnums";
import { getBossNameCustom } from "../enums/BossIDCustom";
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
}

export interface BossObjective {
  type: ObjectiveType.BOSS;
  bossID: BossID;
}

export interface ChallengeObjective {
  type: ObjectiveType.CHALLENGE;
  challenge: Challenge;
}

export type Objective = CharacterObjective | BossObjective | ChallengeObjective;

type _Test = CompositionTypeSatisfiesEnum<Objective, ObjectiveType>;

const OBJECTIVE_TYPE_TO_OBJECTIVE_CONSTRUCTOR = {
  [ObjectiveType.CHARACTER]: (arg1, arg2) => ({
    type: ObjectiveType.CHARACTER,
    character: arg1,
    kind: arg2!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }),
  [ObjectiveType.BOSS]: (arg1) => ({
    type: ObjectiveType.BOSS,
    bossID: arg1,
  }),
  [ObjectiveType.CHALLENGE]: (arg1) => ({
    type: ObjectiveType.CHALLENGE,
    challenge: arg1,
  }),
} as const satisfies Record<
  ObjectiveType,
  (arg1: number, arg2: number | undefined) => Objective
>;

export function getObjective(
  type: ObjectiveType.CHARACTER,
  character: PlayerType,
  kind: CharacterObjectiveKind,
): CharacterObjective;
export function getObjective(
  type: ObjectiveType.BOSS,
  bossID: BossID,
): BossObjective;
export function getObjective(
  type: ObjectiveType.CHALLENGE,
  challenge: Challenge,
): ChallengeObjective;
export function getObjective(
  type: ObjectiveType,
  arg1: int,
  arg2?: int,
): Objective {
  const constructor = OBJECTIVE_TYPE_TO_OBJECTIVE_CONSTRUCTOR[type];
  return constructor(arg1, arg2);
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

    return constructor(arg1, arg2);
  }

  return constructor(arg1, undefined);
}

export function getObjectiveText(objective: Objective): string[] {
  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      const characterName = getCharacterName(objective.character);
      const kindName = getCharacterObjectiveKindName(objective.kind);

      return objective.kind < CharacterObjectiveKind.NO_HIT_BASEMENT_1
        ? ["Defeated", kindName, "on", characterName]
        : ["No damage on", `floor ${kindName}`, "on", characterName];
    }

    case ObjectiveType.BOSS: {
      const bossName = getBossNameCustom(objective.bossID);
      return [
        "No hit",
        bossName,
        "for",
        `${getNumMinutesForBossObjective(objective.bossID)} minutes`,
      ];
    }

    case ObjectiveType.CHALLENGE: {
      const challengeName = getChallengeName(objective.challenge);
      return ["Completed challenge:", challengeName];
    }
  }
}

export function getNumSecondsForBossObjective(bossID: BossID): int {
  const numMinutesForBossObjective = getNumMinutesForBossObjective(bossID);
  return numMinutesForBossObjective * 60;
}
