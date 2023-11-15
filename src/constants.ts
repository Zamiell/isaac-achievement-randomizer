import { Difficulty, PlayerType } from "isaac-typescript-definitions";

export const MOD_NAME = "Achievement Randomizer";

export const IS_DEV = true as boolean;
export const DEBUG = false as boolean;

export const STARTING_CHARACTER = PlayerType.ISAAC;
export const DIFFICULTIES = [Difficulty.NORMAL, Difficulty.HARD] as const;

export const LAST_VERSION_WITH_ACHIEVEMENT_CHANGES = "0.10.0";
