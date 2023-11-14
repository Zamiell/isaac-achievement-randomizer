import { CardType } from "isaac-typescript-definitions";
import { ReadonlySet, VANILLA_CARD_TYPES } from "isaacscript-common";

export const BANNED_CARD_TYPES = [
  CardType.CHAOS, // 42
] as const;

const ALWAYS_UNLOCKED_CARD_TYPES = new ReadonlySet<CardType>([
  CardType.RUNE_SHARD, // 55
]);

export const UNLOCKABLE_CARD_TYPES: readonly CardType[] =
  VANILLA_CARD_TYPES.filter(
    (cardType) => !ALWAYS_UNLOCKED_CARD_TYPES.has(cardType),
  );

export const UNLOCKABLE_CARD_TYPES_SET = new ReadonlySet(UNLOCKABLE_CARD_TYPES);
