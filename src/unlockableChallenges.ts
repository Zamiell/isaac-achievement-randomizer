import { Challenge } from "isaac-typescript-definitions";
import { CHALLENGES } from "./cachedEnums";

export const UNLOCKABLE_CHALLENGES: readonly Challenge[] = CHALLENGES.filter(
  (challenge) => challenge !== Challenge.NULL,
);
