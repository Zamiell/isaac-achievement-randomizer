import { CollectibleType } from "isaac-typescript-definitions";
import { ReadonlySet, VANILLA_COLLECTIBLE_TYPES } from "isaacscript-common";

export const QUEST_COLLECTIBLE_TYPES = [
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

export const NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS = [
  CollectibleType.BOOK_OF_BELIAL_BIRTHRIGHT, // 59
  CollectibleType.BROKEN_GLASS_CANNON, // 474
  CollectibleType.DAMOCLES_PASSIVE, // 656
  CollectibleType.RECALL, // 714
] as const;

export const BANNED_COLLECTIBLE_TYPES = [
  // D100 (283) / D4 (#284) seems to work correctly with reduced pools.
  CollectibleType.EDENS_BLESSING, // 381
  CollectibleType.PLAN_C, // 475
  CollectibleType.CLICKER, // 482
  CollectibleType.METRONOME, // 488
  CollectibleType.R_KEY, // 636
  CollectibleType.TMTRAINER, // 721
] as const;

const ALWAYS_UNLOCKED_COLLECTIBLE_TYPES = new ReadonlySet<CollectibleType>([
  ...QUEST_COLLECTIBLE_TYPES,
  ...NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
]);

export const UNLOCKABLE_COLLECTIBLE_TYPES: readonly CollectibleType[] =
  VANILLA_COLLECTIBLE_TYPES.filter(
    (collectibleType) =>
      !ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType),
  );

export const UNLOCKABLE_COLLECTIBLE_TYPES_SET = new ReadonlySet(
  UNLOCKABLE_COLLECTIBLE_TYPES,
);

/** These are collectibles that are automatically unlocked first. */
export const CORE_STAT_COLLECTIBLES = [
  // In the "boss" and "woodenChest" pools.
  CollectibleType.WOODEN_SPOON, // 27

  // In the "boss" and "goldenChest" and "craneGame" pools.
  CollectibleType.WIRE_COAT_HANGER, // 32

  // In the "boss" pool.
  CollectibleType.CAT_O_NINE_TAILS, // 165
] as const;
