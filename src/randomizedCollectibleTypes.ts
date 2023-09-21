import { CollectibleType, ItemConfigTag } from "isaac-typescript-definitions";
import { ReadonlySet, combineSets } from "isaacscript-common";
import { mod } from "./mod";

const TREASURE_ROOM_EXCEPTIONS = new ReadonlySet<CollectibleType>([
  CollectibleType.HEART, // 15
  CollectibleType.POOP, // 36
  CollectibleType.THUNDER_THIGHS, // 314
  CollectibleType.BUCKET_OF_LARD, // 129
  CollectibleType.MAGGYS_BOW, // 312
]);

const BOSS_ROOM_EXCEPTIONS = new ReadonlySet<CollectibleType>([
  CollectibleType.BREAKFAST, // 25
  CollectibleType.WOODEN_SPOON, // 27
  CollectibleType.WIRE_COAT_HANGER, // 32
  CollectibleType.PENTAGRAM, // 51
  CollectibleType.MOMS_UNDERWEAR, // 29
]);

/**
 * We arbitrarily pick the worst 5 Devil Room collectibles. These are the same as the ones with the
 * in-game quality of 0, with the exception of Pound of Flesh (which is swapped with Plan C).
 */
const DEVIL_ROOM_EXCEPTIONS = new ReadonlySet<CollectibleType>([
  CollectibleType.QUARTER, // 74
  CollectibleType.BLOOD_RIGHTS, // 186
  CollectibleType.MISSING_PAGE_2, // 262
  CollectibleType.SHADE, // 468
  CollectibleType.POUND_OF_FLESH, // 672
]);

/**
 * We arbitrarily pick the worst 5 Angel Room collectibles. There are no collectibles in the Angel
 * Room pool that are quality 0. The ones that are quality 1 are all fairly useful.
 *
 * Gamonymous chose these because they are only defensive.
 */
const ANGEL_ROOM_EXCEPTIONS = new ReadonlySet<CollectibleType>([
  CollectibleType.GUARDIAN_ANGEL, // 112
  CollectibleType.STIGMATA, // 138
  CollectibleType.PRAYER_CARD, // 146
  CollectibleType.HOLY_GRAIL, // 184
  CollectibleType.SWORN_PROTECTOR, // 363
]);

const SECRET_ROOM_EXCEPTIONS = new ReadonlySet<CollectibleType>([
  CollectibleType.RAW_LIVER, // 16
]);

const NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS =
  new ReadonlySet<CollectibleType>([
    CollectibleType.BOOK_OF_BELIAL_BIRTHRIGHT, // 59
    CollectibleType.BROKEN_GLASS_CANNON, // 474
    CollectibleType.DAMOCLES_PASSIVE, // 656
    CollectibleType.RECALL, // 714
    CollectibleType.HOLD, // 715
  ]);

export const BANNED_COLLECTIBLE_TYPES = new ReadonlySet<CollectibleType>([
  CollectibleType.PLAN_C, // 475
  CollectibleType.CLICKER, // 482
]);

const randomizedCollectibleTypes: CollectibleType[] = [];

/** We cannot use the `getCollectibleArray` function until at least one callback has fired. */
function lazyInitRandomizedCollectibleTypes() {
  if (randomizedCollectibleTypes.length > 0) {
    return;
  }

  const questCollectibleTypes = mod.getCollectiblesWithTag(ItemConfigTag.QUEST);
  const blacklistedCollectibleTypes = combineSets(
    TREASURE_ROOM_EXCEPTIONS,
    BOSS_ROOM_EXCEPTIONS,
    DEVIL_ROOM_EXCEPTIONS,
    ANGEL_ROOM_EXCEPTIONS,
    SECRET_ROOM_EXCEPTIONS,
    questCollectibleTypes,
    NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
    BANNED_COLLECTIBLE_TYPES,
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
