import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import { MAIN_CHARACTERS, iRange } from "isaacscript-common";
import { NO_HIT_BOSSES } from "../../../arrays/objectives";
import { UNLOCKABLE_CHALLENGES } from "../../../arrays/unlockableChallenges";
import { CHARACTER_OBJECTIVE_KINDS } from "../../../cachedEnums";
import type { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Objective } from "../../../types/Objective";
import { v } from "./v";

// -------
// Generic
// -------

export function isObjectiveCompleted(objectiveToMatch: Objective): boolean {
  switch (objectiveToMatch.type) {
    case ObjectiveType.CHARACTER: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.character === objectiveToMatch.character &&
          objective.kind === objectiveToMatch.kind,
      );
    }

    case ObjectiveType.BOSS: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.bossID === objectiveToMatch.bossID,
      );
    }

    case ObjectiveType.CHALLENGE: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.challenge === objectiveToMatch.challenge,
      );
    }
  }
}

// -------------------------------
// Objective - Character functions
// -------------------------------

export function isAllCharacterObjectivesCompleted(
  character: PlayerType,
): boolean {
  const completedCharacterObjectives = v.persistent.completedObjectives.filter(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character,
  );

  return (
    completedCharacterObjectives.length === CHARACTER_OBJECTIVE_KINDS.length
  );
}

export function isAllCharactersObjectivesCompleted(): boolean {
  return MAIN_CHARACTERS.every((character) =>
    isAllCharacterObjectivesCompleted(character),
  );
}

export function isCharacterObjectiveCompleted(
  character: PlayerType,
  kind: CharacterObjectiveKind,
): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character &&
      objective.kind === kind,
  );
}

// --------------------------
// Objective - Boss functions
// --------------------------

export function isAllBossObjectivesCompleted(): boolean {
  const completedBossObjectives = v.persistent.completedObjectives.filter(
    (objective) => objective.type === ObjectiveType.BOSS,
  );

  return completedBossObjectives.length === NO_HIT_BOSSES.length;
}

export function isBossRangeObjectivesCompleted(min: int, max: int): boolean {
  const bossIDs = iRange(min, max) as BossID[];
  return bossIDs.every((bossID) => isBossObjectiveCompleted(bossID));
}

export function isBossObjectiveCompleted(bossID: BossID): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.BOSS && objective.bossID === bossID,
  );
}

// -------------------------------
// Objective - Challenge functions
// -------------------------------

export function isAllChallengeObjectivesCompleted(): boolean {
  const completedChallengeObjectives = v.persistent.completedObjectives.filter(
    (objective) => objective.type === ObjectiveType.CHALLENGE,
  );

  return completedChallengeObjectives.length === UNLOCKABLE_CHALLENGES.length;
}

export function isChallengeRangeObjectivesCompleted(
  min: int,
  max: int,
): boolean {
  const challenges = iRange(min, max) as Challenge[];
  return challenges.every((challenge) =>
    isChallengeObjectiveCompleted(challenge),
  );
}

export function isChallengeObjectiveCompleted(challenge: Challenge): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
}
