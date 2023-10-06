import { assertDefined, log, onAnyChallenge } from "isaacscript-common";
import { ObjectiveType } from "../../../enums/ObjectiveType";
import type { Objective } from "../../../types/Objective";
import { getObjectiveText } from "../../../types/Objective";
import { getObjectiveID } from "../../../types/ObjectiveID";
import { getUnlockText } from "../../../types/Unlock";
import { getUnlockID } from "../../../types/UnlockID";
import { showNewUnlock } from "../AchievementNotification";
import { hasErrors } from "../checkErrors/v";
import { isObjectiveCompleted } from "./completedObjectives";
import { checkSwapProblematicAchievement } from "./swapAchievement";
import { v } from "./v";

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

  v.persistent.completedObjectives.push(objective);

  if (!emulating) {
    const objectiveText = getObjectiveText(objective).join(" ");
    log(`Accomplished objective: ${objectiveText}`);
  }

  const objectiveID = getObjectiveID(objective);
  const unlock = v.persistent.objectiveToUnlockMap.get(objectiveID);
  assertDefined(
    unlock,
    `Failed to get the unlock corresponding to objective ID: ${objectiveID}`,
  );

  let originalUnlock = unlock;
  let swappedUnlock = unlock;
  do {
    originalUnlock = swappedUnlock;

    if (!emulating) {
      const unlockText = getUnlockText(originalUnlock).join(" - ");
      log(`Checking unlock swap for: ${unlockText}`);
    }

    swappedUnlock = checkSwapProblematicAchievement(
      originalUnlock,
      objectiveID,
      emulating,
    );

    if (!emulating) {
      const unlockText = getUnlockText(swappedUnlock).join(" - ");
      log(`Swapped unlock is: ${unlockText}`);
    }
  } while (getUnlockID(originalUnlock) !== getUnlockID(swappedUnlock));

  v.persistent.completedUnlocks.push(swappedUnlock);

  if (!emulating) {
    const unlockText = getUnlockText(originalUnlock).join(" - ");
    log(`Granted unlock: ${unlockText}`);
  }

  if (emulating) {
    v.persistent.completedUnlocksForRun.push(swappedUnlock);
  } else {
    showNewUnlock(swappedUnlock);
  }
}
