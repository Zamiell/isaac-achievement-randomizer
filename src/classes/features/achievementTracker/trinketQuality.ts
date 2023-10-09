import type { TrinketType } from "isaac-typescript-definitions";
import {
  QUALITIES,
  VANILLA_TRINKET_TYPES,
  assertDefined,
} from "isaacscript-common";
import { TRINKET_QUALITIES } from "../../../objects/trinketQualities";

const QUALITY_TO_VANILLA_TRINKET_TYPES_MAP: ReadonlyMap<
  Quality,
  ReadonlySet<TrinketType>
> = (() => {
  const qualityToTrinketTypesMap = new Map<Quality, Set<TrinketType>>();

  for (const quality of QUALITIES) {
    const trinketTypesSet = new Set<TrinketType>();

    for (const trinketType of VANILLA_TRINKET_TYPES) {
      const trinketTypeQuality = TRINKET_QUALITIES[trinketType];
      if (trinketTypeQuality === quality) {
        trinketTypesSet.add(trinketType);
      }
    }

    qualityToTrinketTypesMap.set(quality, trinketTypesSet);
  }

  return qualityToTrinketTypesMap;
})();

export function getTrinketTypesOfQuality(
  quality: Quality,
): ReadonlySet<TrinketType> {
  const trinketTypes = QUALITY_TO_VANILLA_TRINKET_TYPES_MAP.get(quality);
  assertDefined(
    trinketTypes,
    `Failed to get the trinket types of quality: ${quality}`,
  );

  return trinketTypes;
}
