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
  HeartSubType.FULL, // 1
  // - `HeartSubType.HALF` (2) is always unlocked.
  HeartSubType.SOUL, // 3
  HeartSubType.ETERNAL, // 4
  HeartSubType.DOUBLE_PACK, // 5
  HeartSubType.BLACK, // 6
  HeartSubType.GOLDEN, // 7
  HeartSubType.HALF_SOUL, // 8
  HeartSubType.SCARED, // 9
  HeartSubType.BLENDED, // 10
  HeartSubType.BONE, // 11
  HeartSubType.ROTTEN, // 12
] as const;

export const UNLOCKABLE_COIN_SUB_TYPES = [
  // - `CoinSubType.PENNY` (1) is always unlocked.
  CoinSubType.NICKEL, // 2
  CoinSubType.DIME, // 3
  CoinSubType.DOUBLE_PACK, // 4
  CoinSubType.LUCKY_PENNY, // 5
  CoinSubType.STICKY_NICKEL, // 6
  CoinSubType.GOLDEN, // 7
] as const;

export const UNLOCKABLE_BOMB_SUB_TYPES = [
  // - `BombSubType.NORMAL` (1) is always unlocked.
  BombSubType.DOUBLE_PACK, // 2
  // - `BombSubType.TROLL` (3) is always unlocked.
  BombSubType.GOLDEN, // 4
  // - `BombSubType.MEGA_TROLL` (5) is always unlocked.
  // - `BombSubType.GOLDEN_TROLL` (6) is always unlocked.
  // - `BombSubType.GIGA` (7) is always unlocked.
] as const;

export const UNLOCKABLE_KEY_SUB_TYPES = [
  // - `KeySubType.NORMAL` (1) is always unlocked.
  KeySubType.GOLDEN, // 2
  KeySubType.DOUBLE_PACK, // 3
  KeySubType.CHARGED, // 4
] as const;

export const UNLOCKABLE_BATTERY_SUB_TYPES = [
  BatterySubType.NORMAL, // 1
  BatterySubType.MICRO, // 2
  BatterySubType.MEGA, // 3
  BatterySubType.GOLDEN, // 4
] as const;

export const UNLOCKABLE_SACK_KEY_SUB_TYPES = [
  SackSubType.NORMAL, // 1
  SackSubType.BLACK, // 2
] as const;

export const UNLOCKABLE_CHEST_PICKUP_VARIANTS = [
  // - `PickupVariant.CHEST` (50) is always unlocked.
  PickupVariant.BOMB_CHEST, // 51
  PickupVariant.SPIKED_CHEST, // 52
  PickupVariant.ETERNAL_CHEST, // 53
  PickupVariant.MIMIC_CHEST, // 54
  // `PickupVariant.OLD_CHEST` (55) is always unlocked (since it does not randomly spawn).
  PickupVariant.WOODEN_CHEST, // 56
  PickupVariant.MEGA_CHEST, // 57
  PickupVariant.HAUNTED_CHEST, // 58
  PickupVariant.LOCKED_CHEST, // 60
  PickupVariant.RED_CHEST, // 360
  // `PickupVariant.MOMS_CHEST` (390) is always unlocked (since it does not randomly spawn).
] as const;
