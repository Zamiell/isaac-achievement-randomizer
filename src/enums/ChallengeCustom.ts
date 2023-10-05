import { validateCustomEnum } from "isaacscript-common";

export const ChallengeCustom = {
  RANDOMIZER_CHILL_ROOM: Isaac.GetChallengeIdByName("Randomizer Chill Room"),
} as const;

/** Comment out this check if a season is in alpha. */
validateCustomEnum("ChallengeCustom", ChallengeCustom);
