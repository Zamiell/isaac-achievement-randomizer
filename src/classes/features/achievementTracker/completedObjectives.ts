import type {
  Challenge,
  Difficulty,
  PlayerType,
} from "isaac-typescript-definitions";
import { iRange } from "isaacscript-common";
import { UNLOCKABLE_CHALLENGES } from "../../../arrays/unlockableChallenges";
import { PLAYABLE_CHARACTERS } from "../../../arrays/unlockableCharacters";
import { CHARACTER_OBJECTIVE_KINDS } from "../../../cachedEnums";
import type { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Objective } from "../../../types/Objective";
import { getObjective, getObjectiveFromID } from "../../../types/Objective";
import { getObjectiveID } from "../../../types/ObjectiveID";
import { v } from "./v";

// -------
// Generic
// -------

export function isObjectiveCompleted(objective: Objective): boolean {
  const objectiveID = getObjectiveID(objective);
  return v.persistent.completedObjectiveIDs.includes(objectiveID);
}

// -------------------------------
// Objective - Character functions
// -------------------------------

export function isAllCharacterObjectivesCompleted(
  character: PlayerType,
): boolean {
  const { completedObjectiveIDs } = v.persistent;

  const completedObjectives = completedObjectiveIDs.map((objectiveID) =>
    getObjectiveFromID(objectiveID),
  );

  const completedCharacterObjectives = completedObjectives.filter(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character,
  );

  return (
    completedCharacterObjectives.length === CHARACTER_OBJECTIVE_KINDS.length
  );
}

export function isAllCharactersObjectivesCompleted(): boolean {
  return PLAYABLE_CHARACTERS.every((character) =>
    isAllCharacterObjectivesCompleted(character),
  );
}

export function isCharacterObjectiveCompleted(
  character: PlayerType,
  kind: CharacterObjectiveKind,
  difficulty: Difficulty.NORMAL | Difficulty.HARD,
): boolean {
  const objective = getObjective(
    ObjectiveType.CHARACTER,
    character,
    kind,
    difficulty,
  );
  const objectiveID = getObjectiveID(objective);

  const { completedObjectiveIDs } = v.persistent;

  return completedObjectiveIDs.includes(objectiveID);
}

// -------------------------------
// Objective - Challenge functions
// -------------------------------

export function isAllChallengeObjectivesCompleted(): boolean {
  const { completedObjectiveIDs } = v.persistent;

  const completedObjectives = completedObjectiveIDs.map((objectiveID) =>
    getObjectiveFromID(objectiveID),
  );

  const completedChallengeObjectives = completedObjectives.filter(
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

  const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
  const objectiveID = getObjectiveID(objective);

  const { completedObjectiveIDs } = v.persistent;

  return completedObjectiveIDs.includes(objectiveID);
}
