import type { PillEffect } from "isaac-typescript-definitions";
import { VANILLA_PILL_EFFECTS, copyArray } from "isaacscript-common";

export const UNLOCKABLE_PILL_EFFECTS: readonly PillEffect[] =
  copyArray(VANILLA_PILL_EFFECTS);
