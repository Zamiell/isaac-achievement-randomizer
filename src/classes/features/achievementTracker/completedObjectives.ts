import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import { MAIN_CHARACTERS, iRange } from "isaacscript-common";
import { NO_HIT_BOSSES } from "../../../arrays/noHitBosses";
import { UNLOCKABLE_CHALLENGES } from "../../../arrays/unlockableChallenges";
import { CHARACTER_OBJECTIVE_KINDS } from "../../../cachedEnums";
import type { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type {
  BossObjective,
  ChallengeObjective,
  CharacterObjective,
  Objective,
} from "../../../types/Objective";
import { v } from "./v";

// -------
// Generic
// -------

const OBJECTIVE_COMPLETED_FUNCTIONS = {
  [ObjectiveType.CHARACTER]: (objectiveToMatch: Objective) => {
    const characterObjective = objectiveToMatch as CharacterObjective;

    return v.persistent.completedObjectives.some(
      (objective) =>
        objective.type === characterObjective.type &&
        objective.character === characterObjective.character &&
        objective.kind === characterObjective.kind,
    );
  },
  [ObjectiveType.BOSS]: (objectiveToMatch: Objective) => {
    const bossObjective = objectiveToMatch as BossObjective;

    return v.persistent.completedObjectives.some(
      (objective) =>
        objective.type === bossObjective.type &&
        objective.bossID === bossObjective.bossID,
    );
  },
  [ObjectiveType.CHALLENGE]: (objectiveToMatch: Objective) => {
    const challengeObjective = objectiveToMatch as ChallengeObjective;

    return v.persistent.completedObjectives.some(
      (objective) =>
        objective.type === challengeObjective.type &&
        objective.challenge === challengeObjective.challenge,
    );
  },
} as const satisfies Record<
  ObjectiveType,
  (objectiveToMatch: Objective) => boolean
>;

export function isObjectiveCompleted(objectiveToMatch: Objective): boolean {
  const func = OBJECTIVE_COMPLETED_FUNCTIONS[objectiveToMatch.type];
  return func(objectiveToMatch);
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
  if (!NO_HIT_BOSSES.includes(bossID)) {
    return true;
  }

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
  if (!UNLOCKABLE_CHALLENGES.includes(challenge)) {
    return true;
  }

  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
}
