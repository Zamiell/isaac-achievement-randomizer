import {
  BatterySubType,
  BombSubType,
  CoinSubType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  SackSubType,
} from "isaac-typescript-definitions";

export const UNLOCKABLE_HEART_SUB_TYPES = [
  HeartSubType.GOLDEN, // 7
  HeartSubType.SCARED, // 9
  HeartSubType.FULL, // 1
  HeartSubType.ROTTEN, // 12
  HeartSubType.DOUBLE_PACK, // 5
  HeartSubType.HALF_SOUL, // 8
  HeartSubType.BLENDED, // 10
  HeartSubType.SOUL, // 3
  HeartSubType.BLACK, // 6
  HeartSubType.ETERNAL, // 4
  HeartSubType.BONE, // 11
  // - `HeartSubType.HALF` (2) is always unlocked.
] as const;

export const UNLOCKABLE_COIN_SUB_TYPES = [
  CoinSubType.STICKY_NICKEL, // 6
  CoinSubType.DOUBLE_PACK, // 4
  CoinSubType.NICKEL, // 2
  CoinSubType.DIME, // 3
  CoinSubType.LUCKY_PENNY, // 5
  CoinSubType.GOLDEN, // 7
  // - `CoinSubType.PENNY` (1) is always unlocked.
] as const;

export const UNLOCKABLE_BOMB_SUB_TYPES = [
  BombSubType.DOUBLE_PACK, // 2
  BombSubType.GOLDEN, // 4
  // - `BombSubType.NORMAL` (1) is always unlocked.
  // - `BombSubType.TROLL` (3) is always unlocked.
  // - `BombSubType.MEGA_TROLL` (5) is always unlocked.
  // - `BombSubType.GOLDEN_TROLL` (6) is always unlocked.
  // - `BombSubType.GIGA` (7) is always unlocked.
] as const;

export const UNLOCKABLE_KEY_SUB_TYPES = [
  KeySubType.CHARGED, // 4
  KeySubType.DOUBLE_PACK, // 3
  KeySubType.GOLDEN, // 2
  // - `KeySubType.NORMAL` (1) is always unlocked.
] as const;

export const UNLOCKABLE_BATTERY_SUB_TYPES = [
  BatterySubType.MICRO, // 2
  BatterySubType.NORMAL, // 1
  BatterySubType.MEGA, // 3
  BatterySubType.GOLDEN, // 4
] as const;

export const UNLOCKABLE_SACK_KEY_SUB_TYPES = [
  SackSubType.NORMAL, // 1
  SackSubType.BLACK, // 2
] as const;

export const UNLOCKABLE_CHEST_PICKUP_VARIANTS = [
  PickupVariant.HAUNTED_CHEST, // 58
  PickupVariant.LOCKED_CHEST, // 60
  PickupVariant.BOMB_CHEST, // 51
  PickupVariant.RED_CHEST, // 360
  PickupVariant.ETERNAL_CHEST, // 53
  PickupVariant.WOODEN_CHEST, // 56
  PickupVariant.MEGA_CHEST, // 57
  // - `PickupVariant.CHEST` (50) is always unlocked.
  // - `PickupVariant.SPIKED_CHEST` (52) is always unlocked.
  // - `PickupVariant.MIMIC_CHEST` (54) is always unlocked.
  // - `PickupVariant.OLD_CHEST` (55) is always unlocked (since it does not randomly spawn).
  // - `PickupVariant.MOMS_CHEST` (390) is always unlocked (since it does not randomly spawn).
] as const;
