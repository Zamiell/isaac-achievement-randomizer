import { CollectibleType } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";

/** This does not include any quest items (e.g. The Polaroid, The Negative, Key Piece 1, etc.). */
const _SET_DROPS_NOT_IN_OTHER_POOLS = new ReadonlySet([
  // This is technically in the "shellGame" pool, but that pool is not implemented.
  CollectibleType.SKATOLE, // 9

  CollectibleType.DOLLAR, // 18

  // This is in Greed Mode pools and the Baby Shop, which we don't consider for this purpose.
  CollectibleType.CUBE_OF_MEAT, // 73

  // This is in the Crane Game pool, which we don't consider for this purpose.
  CollectibleType.SMALL_ROCK, // 90

  CollectibleType.PONY, // 130

  // This is in Greed Mode pools, which we don't consider for this purpose.
  CollectibleType.LUMP_OF_COAL, // 132

  CollectibleType.WHITE_PONY, // 181

  // This is in Greed Mode pools and the Baby Shop, which we don't consider for this purpose.
  CollectibleType.BALL_OF_BANDAGES, // 207

  CollectibleType.HEAD_OF_KRAMPUS, // 293
  CollectibleType.REDEMPTION, // 673
]);
