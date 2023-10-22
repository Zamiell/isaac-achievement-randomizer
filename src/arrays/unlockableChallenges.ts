import { Challenge } from "isaac-typescript-definitions";
import { includes } from "isaacscript-common";
import { CHALLENGES } from "../cachedEnums";

export const BANNED_CHALLENGES = [
  Challenge.DELETE_THIS, // 45
] as const;

export const UNLOCKABLE_CHALLENGES: readonly Challenge[] = CHALLENGES.filter(
  (challenge) =>
    challenge !== Challenge.NULL && !includes(BANNED_CHALLENGES, challenge),
);
