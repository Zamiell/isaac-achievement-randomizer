import { PlayerType } from "isaac-typescript-definitions";

export const MOD_NAME = "Achievement Randomizer";

export const IS_DEV = false as boolean;
export const DEBUG = false as boolean;

export const STARTING_CHARACTER = PlayerType.ISAAC;

export const LAST_VERSION_WITH_ACHIEVEMENT_CHANGES = "0.9.0";

/** These are characters that are guaranteed to not be unlocked early on. */
export const HARD_CHARACTERS = [
  PlayerType.BLUE_BABY, // 4
  PlayerType.LOST, // 10
  PlayerType.JUDAS_B, // 24
  PlayerType.BLUE_BABY_B, // 25
  PlayerType.LAZARUS_B, // 29
  PlayerType.LOST_B, // 31
  PlayerType.FORGOTTEN_B, // 35
  PlayerType.BETHANY_B, // 36
  PlayerType.JACOB_B, // 37
] as const;
