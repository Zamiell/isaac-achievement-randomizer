import { CollectibleType } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";

export const PLANETARIUM_COLLECTIBLES = new ReadonlySet<CollectibleType>([
  CollectibleType.SOL, // 588
  CollectibleType.LUNA, // 589
  CollectibleType.MERCURIUS, // 590
  CollectibleType.VENUS, // 591
  CollectibleType.TERRA, // 592
  CollectibleType.MARS, // 593
  CollectibleType.JUPITER, // 594
  CollectibleType.SATURNUS, // 595
  CollectibleType.URANUS, // 596
  CollectibleType.NEPTUNUS, // 597
  CollectibleType.PLUTO, // 598
]);
