import { CardType } from "isaac-typescript-definitions";
import { ReadonlySet, VANILLA_CARD_TYPES, isRune } from "isaacscript-common";

export const BANNED_CARD_TYPES = new ReadonlySet<CardType>([
  CardType.CHAOS, // 42
  CardType.RUNE_SHARD, // 55
]);

export const UNLOCKABLE_CARD_TYPES: readonly CardType[] =
  VANILLA_CARD_TYPES.filter((cardType) => !BANNED_CARD_TYPES.has(cardType));

export const UNLOCKABLE_RUNE_CARD_TYPES: readonly CardType[] =
  UNLOCKABLE_CARD_TYPES.filter((cardType) => isRune(cardType));
