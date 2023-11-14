import { Challenge } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { CHALLENGES } from "../cachedEnums";

export const BANNED_CHALLENGES = new ReadonlySet<Challenge>([
  Challenge.DELETE_THIS, // 45
]);

export const UNLOCKABLE_CHALLENGES: readonly Challenge[] = CHALLENGES.filter(
  (challenge) =>
    challenge !== Challenge.NULL && !BANNED_CHALLENGES.has(challenge),
);

export const UNLOCKABLE_CHALLENGES_SET = new ReadonlySet(UNLOCKABLE_CHALLENGES);
