import type { CardType } from "isaac-typescript-definitions";
import {
  QUALITIES,
  VANILLA_CARD_TYPES,
  assertDefined,
  isRune,
} from "isaacscript-common";
import { CARD_QUALITIES } from "../../../objects/cardQualities";

const QUALITY_TO_VANILLA_CARD_TYPES_MAP: ReadonlyMap<Quality, CardType[]> =
  (() => {
    const qualityToCardTypesMap = new Map<Quality, CardType[]>();

    for (const quality of QUALITIES) {
      const cardTypes: CardType[] = [];

      for (const cardType of VANILLA_CARD_TYPES) {
        const cardTypeQuality = CARD_QUALITIES[cardType];
        if (cardTypeQuality === quality) {
          cardTypes.push(cardType);
        }
      }

      qualityToCardTypesMap.set(quality, cardTypes);
    }

    return qualityToCardTypesMap;
  })();

export function getCardTypesOfQuality(quality: Quality): CardType[] {
  const cardTypes = QUALITY_TO_VANILLA_CARD_TYPES_MAP.get(quality);
  assertDefined(
    cardTypes,
    `Failed to get the card types of quality: ${quality}`,
  );

  return cardTypes;
}

export function getRunesOfQuality(quality: Quality): CardType[] {
  const cardTypes = getCardTypesOfQuality(quality);
  return cardTypes.filter((cardType) => isRune(cardType));
}
