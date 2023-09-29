import type { Challenge, PlayerType } from "isaac-typescript-definitions";
import { BossID } from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import { getChallengeName, getCharacterName } from "isaacscript-common";
import { getCharacterObjectiveKindName } from "../classes/features/AchievementText";
import { NUM_MINUTES_FOR_BOSS_OBJECTIVE } from "../constants";
import { CharacterObjectiveKind } from "../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../enums/ObjectiveType";

export interface CharacterObjective {
  type: ObjectiveType.CHARACTER;
  character: PlayerType;
  kind: CharacterObjectiveKind;
}

interface BossObjective {
  type: ObjectiveType.BOSS;
  bossID: BossID;
}

interface ChallengeObjective {
  type: ObjectiveType.CHALLENGE;
  challenge: Challenge;
}

export type Objective = CharacterObjective | BossObjective | ChallengeObjective;

type _Test = CompositionTypeSatisfiesEnum<Objective, ObjectiveType>;

export function getObjectiveText(objective: Objective): string[] {
  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      const characterName = getCharacterName(objective.character);
      const characterObjectiveKindName = getCharacterObjectiveKindName(
        objective.kind,
      );

      return objective.kind < CharacterObjectiveKind.NO_HIT_BASEMENT_1
        ? ["Defeated", characterObjectiveKindName, "on", characterName]
        : [
            "No damage on",
            `floor ${characterObjectiveKindName}`,
            "on",
            characterName,
          ];
    }

    case ObjectiveType.BOSS: {
      return [
        `Survive ${NUM_MINUTES_FOR_BOSS_OBJECTIVE}`,
        "minutes without",
        "getting hit",
        "on",
        BossID[objective.bossID],
      ];
    }

    case ObjectiveType.CHALLENGE: {
      const challengeName = getChallengeName(objective.challenge);
      return ["Completed challenge:", challengeName];
    }
  }
}
