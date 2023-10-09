import type { PillEffect } from "isaac-typescript-definitions";
import { ItemConfigPillEffectType } from "isaac-typescript-definitions";
import {
  VANILLA_PILL_EFFECTS,
  getPillEffectClass,
  getPillEffectType,
} from "isaacscript-common";

/** 0, 1, 2, and 3. (`NULL` and `MODDED` do not count.) */
const NUM_PILL_EFFECT_CLASSES = 4;

export const PILL_EFFECT_QUALITIES = (() => {
  const pillEffectQualities: Partial<Record<PillEffect, int>> = {};

  for (const pillEffect of VANILLA_PILL_EFFECTS) {
    const quality = getPillEffectQuality(pillEffect);
    pillEffectQualities[pillEffect] = quality;
  }

  return pillEffectQualities as Readonly<Record<PillEffect, int>>;
})();

/**
 * Pill effect quality is different from collectible/trinket/card quality in that it goes from 0
 * through 12 (instead of from 0 through 4).
 */
function getPillEffectQuality(pillEffect: PillEffect): int {
  const itemConfigPillEffectType = getPillEffectType(pillEffect);
  const itemConfigPillEffectClass = getPillEffectClass(pillEffect);

  switch (itemConfigPillEffectType) {
    // -1
    case ItemConfigPillEffectType.NULL: {
      return 0;
    }

    // 0
    case ItemConfigPillEffectType.POSITIVE: {
      return itemConfigPillEffectClass + NUM_PILL_EFFECT_CLASSES * 2;
    }

    // 1
    case ItemConfigPillEffectType.NEGATIVE: {
      return itemConfigPillEffectClass + NUM_PILL_EFFECT_CLASSES * 0;
    }

    // 2
    case ItemConfigPillEffectType.NEUTRAL: {
      return itemConfigPillEffectClass + NUM_PILL_EFFECT_CLASSES;
    }

    // 3
    case ItemConfigPillEffectType.MODDED: {
      return 0;
    }
  }
}
