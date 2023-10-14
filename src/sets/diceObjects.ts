import {
  CardType,
  CollectibleType,
  TrinketType,
} from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";

export const DICE_COLLECTIBLES = new ReadonlySet<CollectibleType>([
  CollectibleType.D6, // 105
  CollectibleType.D20, // 166
  CollectibleType.D100, // 283
  CollectibleType.D4, // 284
  CollectibleType.D10, // 285
  CollectibleType.D12, // 386
  CollectibleType.D8, // 406
  CollectibleType.D7, // 437
  CollectibleType.D1, // 476
  CollectibleType.D_INFINITY, // 489
  CollectibleType.ETERNAL_D6, // 609
  CollectibleType.SPINDOWN_DICE, // 723
]);

export const DICE_TRINKETS = new ReadonlySet<TrinketType>([
  TrinketType.CRACKED_DICE, // 67
  TrinketType.DICE_BAG, // 154
]);

export const DICE_CARDS = new ReadonlySet<CardType>([
  CardType.DICE_SHARD, // 49
  CardType.REVERSE_WHEEL_OF_FORTUNE, // 66
]);
