import { assertDefined, log, onAnyChallenge } from "isaacscript-common";
import { DEBUG } from "../../../constants";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Objective } from "../../../types/Objective";
import { getObjectiveFromID, getObjectiveText } from "../../../types/Objective";
import type { ObjectiveID } from "../../../types/ObjectiveID";
import { getObjectiveID } from "../../../types/ObjectiveID";
import type { Unlock } from "../../../types/Unlock";
import { getUnlockText } from "../../../types/Unlock";
import { getUnlockID } from "../../../types/UnlockID";
import { showNewUnlock } from "../AchievementNotification";
import { hasErrors } from "../checkErrors/v";
import { isObjectiveCompleted } from "./completedObjectives";
import { getSwappedUnlock } from "./swapUnlock";
import { findObjectiveIDForUnlock, v } from "./v";

export function addObjective(objective: Objective, emulating = false): void {
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

  const unlock = v.persistent.objectiveToUnlockMap.get(objectiveID);
  assertDefined(
    unlock,
    `Failed to get the unlock corresponding to objective ID: ${objectiveID}`,
  );

  const swappedUnlock = checkSwapProblematicAchievement(
    unlock,
    objectiveID,
    emulating,
  );

  v.persistent.completedObjectives.push(objective);
  v.persistent.completedUnlocks.push(swappedUnlock);

  if (DEBUG || !emulating) {
    const objectiveText = getObjectiveText(objective).join(" ");
    const unlockText = getUnlockText(swappedUnlock).join(" - ");

    log("Got achievement:");
    log(`- Objective: ${objectiveText}`);
    log(`- Unlock: ${unlockText}`);
  }

  if (!emulating) {
    showNewUnlock(swappedUnlock);
  }
}

function checkSwapProblematicAchievement(
  unlock: Unlock,
  objectiveID: ObjectiveID,
  emulating: boolean,
): Unlock {
  // We might need to do more than one swap, so continue to use the `getSwappedUnlock` function
  // until there are no more swaps to do.
  let finalUnlock = unlock;
  let swappedUnlock: Unlock | undefined = unlock;
  do {
    finalUnlock = swappedUnlock;

    if (DEBUG || !emulating) {
      const unlockText = getUnlockText(finalUnlock).join(" - ");
      log(`  Checking unlock swap for: ${unlockText}`);
    }

    swappedUnlock = getSwappedUnlock(finalUnlock);

    if (DEBUG || !emulating) {
      if (swappedUnlock === undefined) {
        log("  Swapped to: [n/a; no swap needed]");
      } else {
        const unlockText = getUnlockText(swappedUnlock).join(" - ");
        log(`  Swapped to: ${unlockText}`);
      }
    }
  } while (swappedUnlock !== undefined);

  if (getUnlockID(unlock) !== getUnlockID(finalUnlock)) {
    swapAchievement(objectiveID, unlock, finalUnlock, emulating);
  }

  return finalUnlock;
}

function swapAchievement(
  objectiveID: ObjectiveID,
  unlock: Unlock,
  swappedUnlock: Unlock,
  emulating: boolean,
) {
  const unlockText = getUnlockText(unlock).join(" - ");
  const swappedUnlockText = getUnlockText(swappedUnlock).join(" - ");

  const swappedObjectiveID = findObjectiveIDForUnlock(swappedUnlock);
  assertDefined(
    swappedObjectiveID,
    `Failed to find the objective corresponding to unlock: ${swappedUnlockText}`,
  );

  v.persistent.objectiveToUnlockMap.set(objectiveID, swappedUnlock);
  v.persistent.objectiveToUnlockMap.set(swappedObjectiveID, unlock);

  if (DEBUG || !emulating) {
    log("Swapped achievement:");
    const objective = getObjectiveFromID(objectiveID);
    const objectiveText = getObjectiveText(objective).join(" ");
    log(`1) ${objectiveText} --> ${swappedUnlockText}`);

    const swappedObjective = getObjectiveFromID(swappedObjectiveID);
    const swappedObjectiveText = getObjectiveText(swappedObjective).join(" ");
    log(`2) ${swappedObjectiveText} --> ${unlockText}`);
  }
}
