import { CollectibleType, ItemConfigTag } from "isaac-typescript-definitions";
import { ReadonlySet, combineSets } from "isaacscript-common";
import { mod } from "./mod";

const QUEST_COLLECTIBLE_TYPES = mod.getCollectiblesWithTag(ItemConfigTag.QUEST);

/** This does not include any quest items (e.g. The Polaroid, The Negative, Key Piece 1, etc.). */
const SET_DROPS_NOT_IN_OTHER_POOLS = new ReadonlySet([
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

const BLACKLISTED_COLLECTIBLES: ReadonlySet<CollectibleType> = combineSets(
  QUEST_COLLECTIBLE_TYPES,
  SET_DROPS_NOT_IN_OTHER_POOLS,
);

const COLLECTIBLE_ARRAY = mod.getCollectibleArray();

export const RANDOMIZED_COLLECTIBLE_TYPES: readonly CollectibleType[] =
  COLLECTIBLE_ARRAY.filter(
    (collectibleType) => !BLACKLISTED_COLLECTIBLES.has(collectibleType),
  );
