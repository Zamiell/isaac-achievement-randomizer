import type {
  BossID,
  Challenge,
  Difficulty,
  PlayerType,
  StageID,
} from "isaac-typescript-definitions";
import { getBossIDsForStageID, iRange } from "isaacscript-common";
import { getAllCharacterObjectives } from "../../../arrays/allObjectives";
import {
  BOSS_OBJECTIVE_BOSS_IDS,
  BOSS_OBJECTIVE_BOSS_IDS_SET,
} from "../../../arrays/bosses";
import {
  UNLOCKABLE_CHALLENGES,
  UNLOCKABLE_CHALLENGES_SET,
} from "../../../arrays/unlockableChallenges";
import { PLAYABLE_CHARACTERS } from "../../../arrays/unlockableCharacters";
import type { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Objective } from "../../../types/Objective";
import { getObjective } from "../../../types/Objective";
import { getObjectiveID } from "../../../types/ObjectiveID";
import { v } from "./v";

// -----------------------------
// Objective - Generic functions
// -----------------------------

export function isObjectiveCompleted(objective: Objective): boolean {
  const objectiveID = getObjectiveID(objective);
  return v.persistent.completedObjectiveIDs.has(objectiveID);
}

// -------------------------------
// Objective - Character functions
// -------------------------------

export function isAllCharacterObjectivesCompleted(
  character: PlayerType,
): boolean {
  const characterObjectives = getAllCharacterObjectives(character);
  return characterObjectives.every((characterObjective) =>
    isObjectiveCompleted(characterObjective),
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
  return isObjectiveCompleted(objective);
}

// -------------------------------
// Objective - Boss functions
// -------------------------------

export function isAllBossObjectivesCompleted(): boolean {
  return BOSS_OBJECTIVE_BOSS_IDS.every((challenge) =>
    isBossObjectiveCompleted(challenge),
  );
}

export function isBossObjectivesCompletedForStageID(stageID: StageID): boolean {
  const bossIDs = getBossIDsForStageID(stageID);
  if (bossIDs === undefined) {
    return true;
  }

  return bossIDs.every((bossID) => isBossObjectiveCompleted(bossID));
}

export function isBossObjectiveCompleted(bossID: BossID): boolean {
  if (!BOSS_OBJECTIVE_BOSS_IDS_SET.has(bossID)) {
    return true;
  }

  const objective = getObjective(ObjectiveType.BOSS, bossID);
  return isObjectiveCompleted(objective);
}

// -------------------------------
// Objective - Challenge functions
// -------------------------------

export function isAllChallengeObjectivesCompleted(): boolean {
  return UNLOCKABLE_CHALLENGES.every((challenge) =>
    isChallengeObjectiveCompleted(challenge),
  );
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
  if (!UNLOCKABLE_CHALLENGES_SET.has(challenge)) {
    return true;
  }

  const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
  return isObjectiveCompleted(objective);
}
