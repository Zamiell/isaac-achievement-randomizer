import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import type { CharacterObjectiveKind } from "../enums/CharacterObjectiveKind";
import type { ObjectiveType } from "../enums/ObjectiveType";

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
