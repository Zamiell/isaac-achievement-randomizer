import { BossID, LevelStage, StageType } from "isaac-typescript-definitions";
import {
  MAIN_CHARACTERS,
  addSetsToSet,
  getBossSet,
  isRepentanceStage,
  isStoryBossID,
  log,
} from "isaacscript-common";
import { CHARACTER_OBJECTIVE_KINDS, STAGE_TYPES } from "../../../cachedEnums";
import { CharacterObjectiveKind } from "../../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import {
  UnlockablePath,
  getUnlockablePathFromCharacterObjectiveKind,
  getUnlockablePathFromStoryBoss,
} from "../../../enums/UnlockablePath";
import { NO_HIT_BOSSES } from "../../../objectives";
import { getObjective } from "../../../types/Objective";
import { UNLOCKABLE_CHALLENGES } from "../../../unlockableChallenges";
import { ALL_UNLOCKS } from "../../../unlocks";
import { addObjective } from "./addObjective";
import {
  isBossObjectiveCompleted,
  isChallengeObjectiveCompleted,
  isCharacterObjectiveCompleted,
} from "./completedObjectives";
import {
  isChallengeUnlocked,
  isCharacterUnlocked,
  isPathUnlocked,
  isStageTypeUnlocked,
} from "./completedUnlocks";
import { v } from "./v";

const BOSS_STAGES = [
  LevelStage.BASEMENT_1,
  LevelStage.CAVES_1,
  LevelStage.DEPTHS_1,
  LevelStage.WOMB_1,
] as const;

/** Emulate a player playing through this randomizer seed to see if every objective is possible. */
export function isAchievementsBeatable(): boolean {
  v.persistent.completedUnlocks = [];
  v.persistent.completedObjectives = [];

  while (v.persistent.completedUnlocks.length < ALL_UNLOCKS.length) {
    let unlockedSomething = false;

    for (const character of MAIN_CHARACTERS) {
      if (!isCharacterUnlocked(character)) {
        continue;
      }

      for (const kind of CHARACTER_OBJECTIVE_KINDS) {
        if (
          canGetToCharacterObjectiveKind(kind, false) &&
          !isCharacterObjectiveCompleted(character, kind)
        ) {
          const objective = getObjective(
            ObjectiveType.CHARACTER,
            character,
            kind,
          );
          addObjective(objective, true);
          unlockedSomething = true;
        }
      }
    }

    const reachableNonStoryBossesSet = getReachableNonStoryBossesSet();

    for (const bossID of NO_HIT_BOSSES) {
      if (
        canGetToBoss(bossID, reachableNonStoryBossesSet, false) &&
        !isBossObjectiveCompleted(bossID)
      ) {
        const objective = getObjective(ObjectiveType.BOSS, bossID);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    for (const challenge of UNLOCKABLE_CHALLENGES) {
      if (
        isChallengeUnlocked(challenge, false) &&
        !isChallengeObjectiveCompleted(challenge)
      ) {
        const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    if (!unlockedSomething) {
      log(
        `Failed to emulate beating seed ${v.persistent.seed}: ${v.persistent.completedUnlocks.length} / ${ALL_UNLOCKS.length}`,
      );
      // logMissingObjectives();

      return false;
    }
  }

  return true;
}

export function canGetToCharacterObjectiveKind(
  kind: CharacterObjectiveKind,
  forRun = true,
): boolean {
  // Handle special cases that require two or more unlockable paths.
  if (kind === CharacterObjectiveKind.DELIRIUM) {
    return (
      isPathUnlocked(UnlockablePath.BLUE_WOMB, forRun) &&
      isPathUnlocked(UnlockablePath.VOID, forRun)
    );
  }

  if (kind === CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST) {
    return (
      isPathUnlocked(UnlockablePath.CHEST, forRun) ||
      isPathUnlocked(UnlockablePath.DARK_ROOM, forRun)
    );
  }

  const unlockablePath = getUnlockablePathFromCharacterObjectiveKind(kind);
  if (unlockablePath === undefined) {
    return true;
  }

  return isPathUnlocked(unlockablePath, forRun);
}

export function getReachableNonStoryBossesSet(): Set<BossID> {
  const reachableNonStoryBossesSet = new Set<BossID>();

  for (const stage of BOSS_STAGES) {
    for (const stageType of STAGE_TYPES) {
      if (stageType === StageType.GREED_MODE) {
        continue;
      }

      if (!isStageTypeUnlocked(stage, stageType)) {
        continue;
      }

      if (
        isRepentanceStage(stageType) &&
        !isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS)
      ) {
        continue;
      }

      const bossSet = getBossSet(stage, stageType);
      if (bossSet === undefined) {
        continue;
      }

      addSetsToSet(reachableNonStoryBossesSet, bossSet);
    }
  }

  return reachableNonStoryBossesSet;
}

export function canGetToBoss(
  bossID: BossID,
  reachableBossesSet: Set<BossID>,
  forRun = true,
): boolean {
  if (!isStoryBossID(bossID)) {
    return reachableBossesSet.has(bossID);
  }

  // Handle the special case of Delirium, which requires two separate paths to be unlocked. (Since
  // the mod manually removes void portals, getting to Delirium requires going through Blue Womb.)
  if (bossID === BossID.DELIRIUM) {
    return (
      isPathUnlocked(UnlockablePath.BLUE_WOMB, forRun) &&
      isPathUnlocked(UnlockablePath.VOID, forRun)
    );
  }

  const unlockablePath = getUnlockablePathFromStoryBoss(bossID);
  if (unlockablePath === undefined) {
    return true;
  }

  return isPathUnlocked(unlockablePath, forRun);
}
