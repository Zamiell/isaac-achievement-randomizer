import { CollectibleType } from "isaac-typescript-definitions";
import {
  ReadonlySet,
  VANILLA_COLLECTIBLE_TYPES,
  isActiveCollectible,
} from "isaacscript-common";

const BOSS_ROOM_EXCEPTIONS = [
  CollectibleType.BREAKFAST, // 25
  CollectibleType.WOODEN_SPOON, // 27
  CollectibleType.MOMS_UNDERWEAR, // 29
  CollectibleType.WIRE_COAT_HANGER, // 32
  CollectibleType.CAT_O_NINE_TAILS, // 165
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

export const QUEST_COLLECTIBLE_TYPES_SET = new ReadonlySet<CollectibleType>(
  QUEST_COLLECTIBLE_TYPES,
);

const NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS = [
  CollectibleType.BOOK_OF_BELIAL_BIRTHRIGHT, // 59
  CollectibleType.BROKEN_GLASS_CANNON, // 474
  CollectibleType.DAMOCLES_PASSIVE, // 656
  CollectibleType.RECALL, // 714
  CollectibleType.HOLD, // 715
] as const;

export const NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS_SET =
  new ReadonlySet<CollectibleType>(NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS);

export const BANNED_COLLECTIBLE_TYPES = [
  // D100 (283) / D4 (#284) seems to work correctly with reduced pools.
  CollectibleType.GNAWED_LEAF, // 210
  CollectibleType.EDENS_BLESSING, // 381
  CollectibleType.PLAN_C, // 475
  CollectibleType.CLICKER, // 482
  CollectibleType.METRONOME, // 488
  CollectibleType.R_KEY, // 636
  CollectibleType.TMTRAINER, // 721
] as const;

export const BANNED_COLLECTIBLE_TYPES_SET = new ReadonlySet<CollectibleType>(
  BANNED_COLLECTIBLE_TYPES,
);

export const ALWAYS_UNLOCKED_COLLECTIBLE_TYPES =
  new ReadonlySet<CollectibleType>([
    ...BOSS_ROOM_EXCEPTIONS,
    ...QUEST_COLLECTIBLE_TYPES,
    ...NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
    ...BANNED_COLLECTIBLE_TYPES,
  ]);

export const UNLOCKABLE_COLLECTIBLE_TYPES: readonly CollectibleType[] =
  VANILLA_COLLECTIBLE_TYPES.filter(
    (collectibleType) =>
      !ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType),
  );

export const UNLOCKABLE_ACTIVE_COLLECTIBLE_TYPES: readonly CollectibleType[] =
  UNLOCKABLE_COLLECTIBLE_TYPES.filter((collectibleType) =>
    isActiveCollectible(collectibleType),
  );
