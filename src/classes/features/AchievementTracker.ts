import type {
  CardType,
  Challenge,
  CollectibleType,
  PillEffect,
  PlayerType,
  RoomType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  assertDefined,
  copySet,
  getCardName,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  getPillEffectName,
  getRoomTypeName,
  getTrinketName,
  log,
  logError,
} from "isaacscript-common";
import { ALL_OBJECTIVES } from "../../arrays/allObjectives";
import { UnlockType } from "../../enums/UnlockType";
import type { UnlockableArea } from "../../enums/UnlockableArea";
import { getAreaName } from "../../enums/UnlockableArea";
import { getObjectiveFromID, getObjectiveText } from "../../types/Objective";
import { getObjectiveID } from "../../types/ObjectiveID";
import { getUnlock, getUnlockFromID, getUnlockText } from "../../types/Unlock";
import { getUnlockID } from "../../types/UnlockID";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";
import { isObjectiveCompleted } from "./achievementTracker/completedObjectives";
import { v } from "./achievementTracker/v";

export class AchievementTracker extends RandomizerModFeature {
  v = v;

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    v.persistent.completedUnlockIDsForRun = copySet(
      v.persistent.completedUnlockIDs,
    );
  }
}

// ---------------
// Debug functions
// ---------------

/** Only used for debugging. */
export function setCharacterUnlocked(character: PlayerType): void {
  const unlock = getUnlock(UnlockType.CHARACTER, character);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const characterName = getCharacterName(character);
    error(
      `Failed to find the objective to unlock character: ${characterName} (${character})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setAreaUnlocked(unlockableArea: UnlockableArea): void {
  const unlock = getUnlock(UnlockType.AREA, unlockableArea);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const areaName = getAreaName(unlockableArea);
    error(
      `Failed to find the objective to unlock area: ${areaName} (${unlockableArea})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setChallengeUnlocked(challenge: Challenge): void {
  const unlock = getUnlock(UnlockType.CHALLENGE, challenge);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const challengeName = getChallengeName(challenge);
    error(
      `Failed to find the objective to unlock challenge: ${challengeName} (${challenge})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setCollectibleUnlocked(collectibleType: CollectibleType): void {
  const unlock = getUnlock(UnlockType.COLLECTIBLE, collectibleType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const collectibleName = getCollectibleName(collectibleType);
    error(
      `Failed to find the objective to unlock collectible: ${collectibleName} (${collectibleType})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setTrinketUnlocked(trinketType: TrinketType): void {
  const unlock = getUnlock(UnlockType.TRINKET, trinketType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const trinketName = getTrinketName(trinketType);
    error(
      `Failed to find the objective to unlock trinket: ${trinketName} (${trinketType})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setCardUnlocked(cardType: CardType): void {
  const unlock = getUnlock(UnlockType.CARD, cardType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const cardName = getCardName(cardType);
    error(
      `Failed to find the objective to unlock card: ${cardName} (${cardType})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setPillEffectUnlocked(pillEffect: PillEffect): void {
  const unlock = getUnlock(UnlockType.PILL_EFFECT, pillEffect);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const pillEffectName = getPillEffectName(pillEffect);
    error(
      `Failed to find the objective to unlock pill effect: ${pillEffectName} (${pillEffect})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
}

/** Only used for debugging. */
export function setRoomUnlocked(roomType: RoomType): void {
  const unlock = getUnlock(UnlockType.ROOM, roomType);
  const unlockID = getUnlockID(unlock);
  const objectiveID = v.persistent.unlockIDToObjectiveIDMap.get(unlockID);
  if (objectiveID === undefined) {
    const roomTypeName = getRoomTypeName(roomType);
    error(
      `Failed to find the objective to unlock room: ${roomTypeName} (${roomType})`,
    );
  }

  const objective = getObjectiveFromID(objectiveID);
  addObjective(objective);
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
    const unlockID = v.persistent.objectiveIDToUnlockIDMap.get(objectiveID);
    assertDefined(
      unlockID,
      `Failed to get the unlock ID corresponding to objective ID: ${objectiveID}`,
    );

    const completed = isObjectiveCompleted(objective);
    const completedText = completed ? "[C]" : "[X]";
    const objectiveText = getObjectiveText(objective).join(" ");
    const unlock = getUnlockFromID(unlockID);
    const unlockText = getUnlockText(unlock).join(" - ");

    log(`${i + 1}) ${completedText} ${objectiveText} --> ${unlockText}`, false);
  }

  log(line, false);
}
