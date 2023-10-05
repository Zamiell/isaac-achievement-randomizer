import { PlayerType } from "isaac-typescript-definitions";
import { MAIN_CHARACTERS } from "isaacscript-common";

export const UNLOCKABLE_CHARACTERS: readonly PlayerType[] =
  MAIN_CHARACTERS.filter((character) => character !== PlayerType.ISAAC);
