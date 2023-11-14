import { PlayerType } from "isaac-typescript-definitions";
import { MAIN_CHARACTERS, ReadonlySet } from "isaacscript-common";
import { STARTING_CHARACTER } from "../constants";

export const BANNED_CHARACTERS = new ReadonlySet<PlayerType>([
  PlayerType.CAIN_B,
]);

export const PLAYABLE_CHARACTERS: readonly PlayerType[] =
  MAIN_CHARACTERS.filter((character) => !BANNED_CHARACTERS.has(character));

export const UNLOCKABLE_CHARACTERS: readonly PlayerType[] =
  PLAYABLE_CHARACTERS.filter((character) => character !== STARTING_CHARACTER);

export const UNLOCKABLE_CHARACTERS_SET = new ReadonlySet(UNLOCKABLE_CHARACTERS);

/** These are characters that are guaranteed to not be unlocked early on. */
export const HARD_CHARACTERS = [
  PlayerType.BLUE_BABY, // 4
  PlayerType.LOST, // 10
  PlayerType.JUDAS_B, // 24
  PlayerType.BLUE_BABY_B, // 25
  PlayerType.LAZARUS_B, // 29
  PlayerType.LOST_B, // 31
  PlayerType.APOLLYON_B, // 34
  PlayerType.FORGOTTEN_B, // 35
  PlayerType.BETHANY_B, // 36
  PlayerType.JACOB_B, // 37
] as const;
