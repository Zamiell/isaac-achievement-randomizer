import type { Challenge, PlayerType } from "isaac-typescript-definitions";
import { BossID } from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import {
  assertDefined,
  getChallengeName,
  getCharacterName,
  isEnumValue,
} from "isaacscript-common";
import { getCharacterObjectiveKindName } from "../classes/features/AchievementText";
import { DEFAULT_NUM_MINUTES_FOR_BOSS_OBJECTIVE } from "../constants";
import { CharacterObjectiveKind } from "../enums/CharacterObjectiveKind";
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

interface ChallengeObjective {
  type: ObjectiveType.CHALLENGE;
  challenge: Challenge;
}

export type Objective = CharacterObjective | BossObjective | ChallengeObjective;

type _Test = CompositionTypeSatisfiesEnum<Objective, ObjectiveType>;

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
  switch (type) {
    case ObjectiveType.CHARACTER: {
      assertDefined(
        arg2,
        "Failed to get an objective since the second argument was not provided.",
      );

      return {
        type,
        character: arg1,
        kind: arg2,
      };
    }

    case ObjectiveType.BOSS: {
      return {
        type,
        bossID: arg1,
      };
    }

    case ObjectiveType.CHALLENGE: {
      return {
        type,
        challenge: arg1,
      };
    }
  }
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

  if (!isEnumValue(typeNumber, ObjectiveType)) {
    error(`The type of ${typeNumber} in an objective ID is not valid.`);
  }

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

  const type = typeNumber as ObjectiveType;

  switch (type) {
    case ObjectiveType.CHARACTER: {
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

      return {
        type,
        character: arg1,
        kind: arg2,
      };
    }

    case ObjectiveType.BOSS: {
      return {
        type,
        bossID: arg1,
      };
    }

    case ObjectiveType.CHALLENGE: {
      return {
        type,
        challenge: arg1,
      };
    }
  }
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
      const bossName = BossID[objective.bossID];
      return [
        `Survive ${getNumMinutesForBossObjective(objective.bossID)}`,
        "minutes without",
        "getting hit",
        "on",
        bossName,
      ];
    }

    case ObjectiveType.CHALLENGE: {
      const challengeName = getChallengeName(objective.challenge);
      return ["Completed challenge:", challengeName];
    }
  }
}

function getNumMinutesForBossObjective(bossID: BossID): int {
  switch (bossID) {
    // 58
    case BossID.BROWNIE: {
      return 1;
    }

    // 78
    case BossID.VISAGE: {
      return 1;
    }

    // 79
    case BossID.SIREN: {
      return 1;
    }

    // 82
    case BossID.HORNFEL: {
      return 1;
    }

    // 84
    case BossID.BABY_PLUM: {
      return 0.5;
    }

    // 85
    case BossID.SCOURGE: {
      return 1;
    }

    // 87
    case BossID.ROTGUT: {
      return 1;
    }

    default: {
      return DEFAULT_NUM_MINUTES_FOR_BOSS_OBJECTIVE;
    }
  }
}

export function getNumSecondsForBossObjective(bossID: BossID): int {
  const numMinutesForBossObjective = getNumMinutesForBossObjective(bossID);
  return numMinutesForBossObjective * 60;
}
