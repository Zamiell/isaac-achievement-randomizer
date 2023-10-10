import { CollectibleType } from "isaac-typescript-definitions";
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
