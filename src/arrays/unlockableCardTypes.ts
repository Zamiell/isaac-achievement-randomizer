import { CardType } from "isaac-typescript-definitions";
import { VANILLA_CARD_TYPES } from "isaacscript-common";

export const UNLOCKABLE_CARD_TYPES: readonly CardType[] =
  VANILLA_CARD_TYPES.filter((cardType) => cardType !== CardType.RUNE_SHARD);
