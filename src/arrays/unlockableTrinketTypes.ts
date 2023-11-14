import { TrinketType } from "isaac-typescript-definitions";
import {
  ReadonlySet,
  VANILLA_TRINKET_TYPES,
  copyArray,
} from "isaacscript-common";

export const BANNED_TRINKET_TYPES = [
  TrinketType.ERROR, // 75
  TrinketType.KARMA, // 85
  TrinketType.M, // 138
] as const;

export const UNLOCKABLE_TRINKET_TYPES: readonly TrinketType[] = copyArray(
  VANILLA_TRINKET_TYPES,
);

export const UNLOCKABLE_TRINKET_TYPES_SET = new ReadonlySet(
  UNLOCKABLE_TRINKET_TYPES,
);
