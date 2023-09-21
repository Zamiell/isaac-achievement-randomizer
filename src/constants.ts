import { Challenge } from "isaac-typescript-definitions";

export const MOD_NAME = "Achievement Randomizer";

export const IS_DEV = true as boolean;

/** These are challenges that can be done without any collectibles or trinkets unlocked. */
// ts-prune-ignore-next
export const EASY_CHALLENGES = [
  Challenge.HIGH_BROW, // 2
  Challenge.DARKNESS_FALLS, // 4
  Challenge.SOLAR_SYSTEM, // 6
  Challenge.SUICIDE_KING, // 7
  Challenge.CAT_GOT_YOUR_TONGUE, // 8
  Challenge.DEMO_MAN, // 9
  Challenge.GLASS_CANNON, // 11
  Challenge.BEANS, // 13
  Challenge.SLOW_ROLL, // 15
  Challenge.COMPUTER_SAVY, // 16
  Challenge.THE_FAMILY_MAN, // 19
  Challenge.BLUE_BOMBER, // 23
  Challenge.I_RULE, // 26
  Challenge.BRAINS, // 27
  Challenge.GUARDIAN, // 30
  Challenge.PONG, // 35
  Challenge.SCAT_MAN, // 36
  Challenge.BAPTISM_BY_FIRE, // 38
  Challenge.DELETE_THIS, // 45
] as const;
