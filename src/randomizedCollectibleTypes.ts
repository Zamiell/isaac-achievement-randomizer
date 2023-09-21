import { CollectibleType, ItemConfigTag } from "isaac-typescript-definitions";
import {
  NUM_VANILLA_CHALLENGES,
  ReadonlySet,
  combineSets,
} from "isaacscript-common";
import { mod } from "./mod";

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

const randomizedCollectibleTypes: CollectibleType[] = [];

/** We cannot use the `getCollectibleArray` function until at least one callback has fired. */
function lazyInitRandomizedCollectibleTypes() {
  if (randomizedCollectibleTypes.length > 0) {
    return;
  }

  const questCollectibleTypes = mod.getCollectiblesWithTag(ItemConfigTag.QUEST);
  const blacklistedCollectibleTypes = combineSets(
    questCollectibleTypes,
    SET_DROPS_NOT_IN_OTHER_POOLS,
  );

  const collectibleArray = mod.getCollectibleArray();
  for (const collectibleType of collectibleArray) {
    if (!blacklistedCollectibleTypes.has(collectibleType)) {
      randomizedCollectibleTypes.push(collectibleType);
    }
  }
}

export function getRandomizedCollectibleTypes(): readonly CollectibleType[] {
  lazyInitRandomizedCollectibleTypes();
  return randomizedCollectibleTypes;
}

Isaac.DebugString(`GETTING HERE - ${NUM_VANILLA_CHALLENGES}`);
