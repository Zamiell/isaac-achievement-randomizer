import { Difficulty } from "isaac-typescript-definitions";
import { assertDefined, log, onAnyChallenge } from "isaacscript-common";
import { isDoubleUnlocksEnabled } from "../../../config";
import { DEBUG } from "../../../constants";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Achievement } from "../../../types/Achievement";
import type { Objective } from "../../../types/Objective";
import {
  getObjective,
  getObjectiveFromID,
  getObjectiveText,
} from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import { getObjectiveID } from "../../../types/ObjectiveID";
import { getUnlockFromID, getUnlockText } from "../../../types/Unlock";
import type { UnlockID } from "../../../types/UnlockID";
import { showNewUnlock } from "../AchievementNotification";
import {
  getPlaythroughNumCompletedRuns,
  setDoubleUnlocked,
} from "../StatsTracker";
import { hasErrors } from "../checkErrors/v";
import { isObjectiveCompleted } from "./completedObjectives";
import { getSwappedUnlockID } from "./swapUnlock";
import { getRandomizerSeed, v } from "./v";

export function addObjective(objective: Objective, emulating = false): void {
  const seed = getRandomizerSeed();
  if (seed === undefined) {
    return;
  }

  if (hasErrors()) {
    return;
  }

  // Prevent accomplishing non-challenge objectives while inside of a challenge.
  if (
    !emulating &&
    ((!onAnyChallenge() && objective.type === ObjectiveType.CHALLENGE) ||
      (onAnyChallenge() && objective.type !== ObjectiveType.CHALLENGE))
  ) {
    return;
  }

  if (isObjectiveCompleted(objective)) {
    return;
  }

  const objectiveID = getObjectiveID(objective);

  const unlockID = v.persistent.objectiveIDToUnlockIDMap.get(objectiveID);
  assertDefined(
    unlockID,
    `Failed to get the unlock ID corresponding to objective ID: ${objectiveID}`,
  );

  const potentiallySwappedUnlockID = checkSwapProblematicAchievement(
    unlockID,
    objectiveID,
    seed,
    emulating,
  );

  v.persistent.completedObjectiveIDs.add(objectiveID);
  v.persistent.completedUnlockIDs.add(potentiallySwappedUnlockID);

  const achievement: Achievement = {
    objectiveID,
    unlockID: potentiallySwappedUnlockID,
  };
  const runNum = getPlaythroughNumCompletedRuns() + 1;
  const achievementTuple = [runNum, achievement] as const;
  v.persistent.achievementHistory.push(achievementTuple);

  if (DEBUG || !emulating) {
    const objectiveText = getObjectiveText(objective).join(" ");
    const unlock = getUnlockFromID(potentiallySwappedUnlockID);
    const unlockText = getUnlockText(unlock).join(" - ");

    log("Got achievement:");
    log(`- Objective: ${objectiveText}`);
    log(`- Unlock: ${unlockText}`);
  }

  if (!emulating) {
    const unlock = getUnlockFromID(potentiallySwappedUnlockID);
    showNewUnlock(unlock);
  }

  // Handle the "double unlocks" feature.
  if (
    objective.type === ObjectiveType.CHARACTER &&
    objective.difficulty === Difficulty.HARD &&
    isDoubleUnlocksEnabled()
  ) {
    setDoubleUnlocked();

    const normalModeObjective = getObjective(
      objective.type,
      objective.character,
      objective.kind,
      Difficulty.NORMAL,
    );
    addObjective(normalModeObjective, emulating);
  }
}

function checkSwapProblematicAchievement(
  unlockID: UnlockID,
  objectiveID: ObjectiveID,
  seed: Seed,
  emulating: boolean,
): UnlockID {
  // We might need to do more than one swap, so we continue to use the `getSwappedUnlock` function
  // until there are no more swaps to do.
  let trySwapUnlockID = unlockID;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
  while (true) {
    if (DEBUG || !emulating) {
      const firstUnlock = getUnlockFromID(trySwapUnlockID);
      const firstUnlockText = getUnlockText(firstUnlock).join(" - ");
      log(`  Checking unlock swap for: ${firstUnlockText}`);
    }

    const swappedUnlockID = getSwappedUnlockID(trySwapUnlockID, seed);

    if (DEBUG || !emulating) {
      if (swappedUnlockID === undefined) {
        log("  Swapped to: [n/a; no swap needed]");
      } else {
        const swappedUnlock = getUnlockFromID(swappedUnlockID);
        const swappedUnlockText = getUnlockText(swappedUnlock).join(" - ");
        log(`  Swapped to: ${swappedUnlockText}`);
      }
    }

    if (swappedUnlockID === undefined) {
      break;
    }

    trySwapUnlockID = swappedUnlockID;
  }

  if (unlockID !== trySwapUnlockID) {
    swapAchievement(objectiveID, unlockID, trySwapUnlockID, emulating);
  }

  return trySwapUnlockID;
}

function swapAchievement(
  objectiveID: ObjectiveID,
  unlockID: UnlockID,
  swappedUnlockID: UnlockID,
  emulating: boolean,
) {
  const swappedObjectiveID =
    v.persistent.unlockIDToObjectiveIDMap.get(swappedUnlockID);
  if (swappedObjectiveID === undefined) {
    const swappedUnlock = getUnlockFromID(swappedUnlockID);
    const swappedUnlockText = getUnlockText(swappedUnlock).join(" - ");
    error(
      `Failed to find the objective ID corresponding to unlock ID: ${swappedUnlockID} (${swappedUnlockText})`,
    );
  }

  v.persistent.objectiveIDToUnlockIDMap.set(objectiveID, swappedUnlockID);
  v.persistent.objectiveIDToUnlockIDMap.set(swappedObjectiveID, unlockID);

  v.persistent.unlockIDToObjectiveIDMap.set(unlockID, swappedObjectiveID);
  v.persistent.unlockIDToObjectiveIDMap.set(swappedUnlockID, objectiveID);

  if (DEBUG || !emulating) {
    log("Swapped achievement:");

    const objective = getObjectiveFromID(objectiveID);
    const objectiveText = getObjectiveText(objective).join(" ");
    const swappedUnlock = getUnlockFromID(swappedUnlockID);
    const swappedUnlockText = getUnlockText(swappedUnlock).join(" - ");
    log(`1) ${objectiveText} --> ${swappedUnlockText}`);

    const swappedObjective = getObjectiveFromID(swappedObjectiveID);
    const swappedObjectiveText = getObjectiveText(swappedObjective).join(" ");
    const unlock = getUnlockFromID(unlockID);
    const unlockText = getUnlockText(unlock).join(" - ");
    log(`2) ${swappedObjectiveText} --> ${unlockText}`);
  }
}
