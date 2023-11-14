import type { PillEffect } from "isaac-typescript-definitions";
import {
  ReadonlySet,
  VANILLA_PILL_EFFECTS,
  copyArray,
} from "isaacscript-common";

export const UNLOCKABLE_PILL_EFFECTS: readonly PillEffect[] =
  copyArray(VANILLA_PILL_EFFECTS);

export const UNLOCKABLE_PILL_EFFECTS_SET = new ReadonlySet(
  UNLOCKABLE_PILL_EFFECTS,
);
