import type {
  CollectibleType,
  PillEffect,
  PlayerType,
  RoomType,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  assertDefined,
  copyArray,
  getCharacterName,
  getCollectibleName,
  getPillEffectName,
  getRoomName,
  log,
  logError,
} from "isaacscript-common";
import { ALL_OBJECTIVES } from "../../arrays/allObjectives";
import { UnlockType } from "../../enums/UnlockType";
import type { UnlockableArea } from "../../enums/UnlockableArea";
import { getAreaName } from "../../enums/UnlockableArea";
import type { Objective } from "../../types/Objective";
import { getObjectiveFromID, getObjectiveText } from "../../types/Objective";
import { getObjectiveID } from "../../types/ObjectiveID";
import { getUnlockText } from "../../types/Unlock";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";
import { isObjectiveCompleted } from "./achievementTracker/completedObjectives";
import { v } from "./achievementTracker/v";

export class AchievementTracker extends RandomizerModFeature {
  v = v;

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    v.persistent.completedObjectivesForRun = copyArray(
      v.persistent.completedObjectives,
    );
    v.persistent.completedUnlocksForRun = copyArray(
      v.persistent.completedUnlocks,
    );
  }
}

// ---------------
// Debug functions
// ---------------

/** Only used for debugging. */
export function setCharacterUnlocked(character: PlayerType): void {
  const objective = findObjectiveForCharacterUnlock(character);
  if (objective === undefined) {
    const characterName = getCharacterName(character);
    error(
      `Failed to find the objective to unlock character: ${characterName} (${character})`,
    );
  }

  addObjective(objective);
}

function findObjectiveForCharacterUnlock(
  character: PlayerType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.CHARACTER &&
      unlock.character === character
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setAreaUnlocked(unlockableArea: UnlockableArea): void {
  const objective = findObjectiveForAreaUnlock(unlockableArea);
  if (objective === undefined) {
    const areaName = getAreaName(unlockableArea);
    error(
      `Failed to find the objective to unlock area: ${areaName} (${unlockableArea})`,
    );
  }

  addObjective(objective);
}

function findObjectiveForAreaUnlock(
  unlockableArea: UnlockableArea,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.AREA &&
      unlock.unlockableArea === unlockableArea
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setCollectibleUnlocked(collectibleType: CollectibleType): void {
  const objective = findObjectiveForCollectibleUnlock(collectibleType);
  if (objective === undefined) {
    const collectibleName = getCollectibleName(collectibleType);
    error(
      `Failed to find the objective to unlock collectible: ${collectibleName} (${collectibleType})`,
    );
  }

  addObjective(objective);
}

function findObjectiveForCollectibleUnlock(
  collectibleType: CollectibleType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.COLLECTIBLE &&
      unlock.collectibleType === collectibleType
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setPillEffectUnlocked(pillEffect: PillEffect): void {
  const objective = findObjectiveForPillEffectUnlock(pillEffect);
  if (objective === undefined) {
    const pillEffectName = getPillEffectName(pillEffect);
    error(
      `Failed to find the objective to unlock pill effect: ${pillEffectName} (${pillEffect})`,
    );
  }

  addObjective(objective);
}

function findObjectiveForPillEffectUnlock(
  pillEffect: PillEffect,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.PILL_EFFECT &&
      unlock.pillEffect === pillEffect
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setRoomUnlocked(roomType: RoomType): void {
  const objective = findObjectiveForRoomUnlock(roomType);
  if (objective === undefined) {
    const roomName = getRoomName(roomType);
    error(
      `Failed to find the objective to unlock room: ${roomName} (${roomType})`,
    );
  }

  addObjective(objective);
}

function findObjectiveForRoomUnlock(roomType: RoomType): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (unlock.type === UnlockType.ROOM && unlock.roomType === roomType) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

// -------
// Logging
// -------

export function logSpoilerLog(): void {
  if (v.persistent.seed === null) {
    logError("The randomizer is not active, so you cannot make a spoiler log.");
    return;
  }

  const line = "-".repeat(40);

  log(line, false);
  log(`Spoiler log for randomizer seed: ${v.persistent.seed}`, false);
  log(line, false);

  for (const [i, objective] of ALL_OBJECTIVES.entries()) {
    const objectiveID = getObjectiveID(objective);

    const unlock = v.persistent.objectiveToUnlockMap.get(objectiveID);
    assertDefined(
      unlock,
      `Failed to get the unlock corresponding to objective ID: ${objectiveID}`,
    );

    const completed = isObjectiveCompleted(objective);
    const completedText = completed ? "[C]" : "[X]";
    const objectiveText = getObjectiveText(objective).join(" ");
    const unlockText = getUnlockText(unlock).join(" - ");

    log(`${i + 1}) ${completedText} ${objectiveText} --> ${unlockText}`, false);
  }

  log(line, false);
}
