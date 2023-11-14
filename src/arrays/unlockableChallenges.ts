import { Challenge } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { CHALLENGES } from "../cachedEnums";

export const BANNED_CHALLENGES = new ReadonlySet<Challenge>([
  Challenge.DELETE_THIS, // 45
]);

/**
 * Unlike unlockable collectibles, this array does not include banned challenges because doing so
 * would affect both objectives and unlocks (instead of just unlocks).
 */
export const UNLOCKABLE_CHALLENGES: readonly Challenge[] = CHALLENGES.filter(
  (challenge) =>
    challenge !== Challenge.NULL && !BANNED_CHALLENGES.has(challenge),
);

export const UNLOCKABLE_CHALLENGES_SET = new ReadonlySet(UNLOCKABLE_CHALLENGES);
