import type { CardType } from "isaac-typescript-definitions";
import {
  QUALITIES,
  VANILLA_CARD_TYPES,
  assertDefined,
} from "isaacscript-common";
import { CARD_QUALITIES } from "../../../objects/cardQualities";

const QUALITY_TO_VANILLA_CARD_TYPES_MAP: ReadonlyMap<
  Quality,
  ReadonlySet<CardType>
> = (() => {
  const qualityToCardTypesMap = new Map<Quality, Set<CardType>>();

  for (const quality of QUALITIES) {
    const cardTypesSet = new Set<CardType>();

    for (const cardType of VANILLA_CARD_TYPES) {
      const cardTypeQuality = CARD_QUALITIES[cardType];
      if (cardTypeQuality === quality) {
        cardTypesSet.add(cardType);
      }
    }

    qualityToCardTypesMap.set(quality, cardTypesSet);
  }

  return qualityToCardTypesMap;
})();

export function getCardTypesOfQuality(quality: Quality): ReadonlySet<CardType> {
  const cardTypes = QUALITY_TO_VANILLA_CARD_TYPES_MAP.get(quality);
  assertDefined(
    cardTypes,
    `Failed to get the card types of quality: ${quality}`,
  );

  return cardTypes;
}
