import type { PlayerType } from "isaac-typescript-definitions";
import { MAIN_CHARACTERS } from "isaacscript-common";
import { STARTING_CHARACTER } from "../constants";

export const UNLOCKABLE_CHARACTERS: readonly PlayerType[] =
  MAIN_CHARACTERS.filter((character) => character !== STARTING_CHARACTER);
