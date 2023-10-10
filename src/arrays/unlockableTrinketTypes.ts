import { TrinketType } from "isaac-typescript-definitions";
import { ReadonlySet, VANILLA_TRINKET_TYPES } from "isaacscript-common";

export const BANNED_TRINKET_TYPES = [
  TrinketType.ERROR, // 75
  TrinketType.KARMA, // 85
  TrinketType.M, // 138
] as const;

export const BANNED_TRINKET_TYPES_SET = new ReadonlySet<TrinketType>(
  BANNED_TRINKET_TYPES,
);

export const ALWAYS_UNLOCKED_TRINKET_TYPES = new ReadonlySet<TrinketType>([
  ...BANNED_TRINKET_TYPES,
]);

export const UNLOCKABLE_TRINKET_TYPES: readonly TrinketType[] =
  VANILLA_TRINKET_TYPES.filter(
    (trinketType) => !ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType),
  );
