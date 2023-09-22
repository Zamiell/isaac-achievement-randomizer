import { CollectibleType } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { mod } from "./mod";

const TREASURE_ROOM_EXCEPTIONS = [
  CollectibleType.TINY_PLANET, // 233
  CollectibleType.ISAACS_HEART, // 276
  CollectibleType.STRANGE_ATTRACTOR, // 315
  CollectibleType.CURSE_OF_THE_TOWER, // 371
  CollectibleType.KEY_BUM, // 388
] as const;

const BOSS_ROOM_EXCEPTIONS = [
  CollectibleType.BREAKFAST, // 25
  CollectibleType.WOODEN_SPOON, // 27
  CollectibleType.MOMS_UNDERWEAR, // 29
  CollectibleType.WIRE_COAT_HANGER, // 32
  CollectibleType.CAT_O_NINE_TAILS, // 165
] as const;

/**
 * We arbitrarily pick the worst 5 Devil Room collectibles. These are the same as the ones with the
 * in-game quality of 0, with the exception of Pound of Flesh (which is swapped with Plan C).
 */
const DEVIL_ROOM_EXCEPTIONS = [
  CollectibleType.QUARTER, // 74
  CollectibleType.MISSING_PAGE_2, // 262 (also in the Secret Room pool)
  CollectibleType.BLACK_POWDER, // 420
  CollectibleType.TWO_SPOOKY, // 554
  CollectibleType.POUND_OF_FLESH, // 672
] as const;

/**
 * We arbitrarily pick the worst 5 Angel Room collectibles. There are no collectibles in the Angel
 * Room pool that are quality 0. The ones that are quality 1 are all fairly useful.
 *
 * Gamonymous chose these because they are only defensive.
 */
const ANGEL_ROOM_EXCEPTIONS = [
  CollectibleType.GUARDIAN_ANGEL, // 112
  CollectibleType.HOLY_GRAIL, // 184
  CollectibleType.DEAD_DOVE, // 185
  CollectibleType.SWORN_PROTECTOR, // 363
  CollectibleType.GLYPH_OF_BALANCE, // 464
] as const;

const QUEST_COLLECTIBLE_TYPES = [
  CollectibleType.KEY_PIECE_1, // 238
  CollectibleType.KEY_PIECE_2, // 239
  CollectibleType.POLAROID, // 327
  CollectibleType.NEGATIVE, // 328
  CollectibleType.BROKEN_SHOVEL_1, // 550
  CollectibleType.BROKEN_SHOVEL_2, // 551
  CollectibleType.MOMS_SHOVEL, // 552
  CollectibleType.KNIFE_PIECE_1, // 626
  CollectibleType.KNIFE_PIECE_2, // 627
  CollectibleType.DOGMA, // 633
  CollectibleType.DADS_NOTE, // 668
] as const;

const NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS = [
  CollectibleType.BOOK_OF_BELIAL_BIRTHRIGHT, // 59
  CollectibleType.BROKEN_GLASS_CANNON, // 474
  CollectibleType.DAMOCLES_PASSIVE, // 656
  CollectibleType.RECALL, // 714
  CollectibleType.HOLD, // 715
] as const;

export const BANNED_COLLECTIBLE_TYPES = [
  CollectibleType.PLAN_C, // 475
  CollectibleType.CLICKER, // 482
  CollectibleType.R_KEY, // 636
] as const;

export const ALWAYS_UNLOCKED_COLLECTIBLE_TYPES =
  new ReadonlySet<CollectibleType>([
    ...TREASURE_ROOM_EXCEPTIONS,
    ...BOSS_ROOM_EXCEPTIONS,
    ...DEVIL_ROOM_EXCEPTIONS,
    ...ANGEL_ROOM_EXCEPTIONS,
    ...QUEST_COLLECTIBLE_TYPES,
    ...NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
    ...BANNED_COLLECTIBLE_TYPES,
  ]);

const VANILLA_COLLECTIBLE_ARRAY = mod.getVanillaCollectibleArray();

export const UNLOCKABLE_COLLECTIBLE_TYPES: readonly CollectibleType[] =
  VANILLA_COLLECTIBLE_ARRAY.filter(
    (collectibleType) =>
      !ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType),
  );
