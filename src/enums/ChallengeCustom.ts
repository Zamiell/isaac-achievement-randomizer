import { validateCustomEnum } from "isaacscript-common";

export const ChallengeCustom = {
  RANDOMIZER_CHILL_ROOM: Isaac.GetChallengeIdByName("Randomizer Chill Room"),
} as const;

validateCustomEnum("ChallengeCustom", ChallengeCustom);
