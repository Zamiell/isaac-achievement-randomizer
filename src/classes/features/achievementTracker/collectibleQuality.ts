import { CollectibleType } from "isaac-typescript-definitions";
import {
  MAX_QUALITY,
  QUALITIES,
  ReadonlySet,
  VANILLA_COLLECTIBLE_TYPES,
  assertDefined,
  getCollectibleQuality,
} from "isaacscript-common";

const GOOD_COLLECTIBLES = new ReadonlySet([
  CollectibleType.CHOCOLATE_MILK, // 69 (quality 3)
  CollectibleType.BOOK_OF_REVELATIONS, // 78 (quality 3)
  CollectibleType.RELIC, // 98 (quality 3)
  CollectibleType.CRICKETS_BODY, // 224 (quality 3)
  CollectibleType.MONSTROS_LUNG, // 229 (quality 2)
  CollectibleType.DEATHS_TOUCH, // 237 (quality 3)
  CollectibleType.TECH_5, // 244 (quality 3)
  CollectibleType.PROPTOSIS, // 261 (quality 3)
  CollectibleType.CANCER, // 301 (quality 3)
  CollectibleType.DEAD_EYE, // 373 (quality 3)
  CollectibleType.MAW_OF_THE_VOID, // 399 (quality 3)
  CollectibleType.ROCK_BOTTOM, // 562 (quality 3)
  CollectibleType.SPIRIT_SWORD, // 579 (quality 3)
  CollectibleType.ECHO_CHAMBER, // 700 (quality 3)
]);

const ADJUSTED_QUALITY_TO_VANILLA_COLLECTIBLE_TYPES_MAP: ReadonlyMap<
  Quality,
  CollectibleType[]
> = (() => {
  const qualityToCollectibleTypesMap = new Map<Quality, CollectibleType[]>();

  for (const quality of QUALITIES) {
    const collectibleTypes: CollectibleType[] = [];

    for (const collectibleType of VANILLA_COLLECTIBLE_TYPES) {
      if (GOOD_COLLECTIBLES.has(collectibleType) && quality !== MAX_QUALITY) {
        continue;
      }

      const collectibleTypeQuality = getCollectibleQuality(collectibleType);
      if (
        collectibleTypeQuality === quality ||
        (GOOD_COLLECTIBLES.has(collectibleType) && quality === MAX_QUALITY)
      ) {
        collectibleTypes.push(collectibleType);
      }
    }

    qualityToCollectibleTypesMap.set(quality, collectibleTypes);
  }

  return qualityToCollectibleTypesMap;
})();

/** Some collectibles result in a won run and should be treated as maximum quality. */
export function getAdjustedCollectibleQuality(
  collectibleType: CollectibleType,
): Quality {
  return GOOD_COLLECTIBLES.has(collectibleType)
    ? MAX_QUALITY
    : getCollectibleQuality(collectibleType);
}

/** Some collectibles result in a won run and should be treated as maximum quality. */
export function getAdjustedCollectibleTypesOfQuality(
  quality: Quality,
): CollectibleType[] {
  const collectibleTypes =
    ADJUSTED_QUALITY_TO_VANILLA_COLLECTIBLE_TYPES_MAP.get(quality);
  assertDefined(
    collectibleTypes,
    `Failed to find the vanilla collectible types corresponding to quality: ${quality}`,
  );

  return collectibleTypes;
}
