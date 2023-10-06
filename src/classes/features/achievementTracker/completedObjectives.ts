import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import { CHARACTER_OBJECTIVE_KINDS } from "../../../cachedEnums";
import type { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import { NO_HIT_BOSSES } from "../../../objectives";
import type { BossObjective } from "../../../types/Objective";
import { v } from "./v";

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

export function isBossObjectiveCompleted(bossID: BossID): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.BOSS && objective.bossID === bossID,
  );
}

export function getNonCompletedBossObjective(): BossObjective | undefined {
  const completedBossObjectives = v.persistent.completedObjectives.filter(
    (objective) => objective.type === ObjectiveType.BOSS,
  ) as BossObjective[];
  const completedBossIDs = completedBossObjectives.map(
    (objective) => objective.bossID,
  );
  const completedBossIDsSet = new Set(completedBossIDs);

  for (const bossID of NO_HIT_BOSSES) {
    if (!completedBossIDsSet.has(bossID)) {
      return {
        type: ObjectiveType.BOSS,
        bossID,
      };
    }
  }

  return undefined;
}

// -------------------------------
// Objective - Challenge functions
// -------------------------------

export function isChallengeObjectiveCompleted(challenge: Challenge): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
}
