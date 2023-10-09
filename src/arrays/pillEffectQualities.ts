import type { PillEffect } from "isaac-typescript-definitions";
import { ItemConfigPillEffectType } from "isaac-typescript-definitions";
import { VANILLA_PILL_EFFECTS, getPillEffectType } from "isaacscript-common";

const PILL_EFFECT_TYPE_TO_QUALITY = {
  [ItemConfigPillEffectType.POSITIVE]: 2, // 0
  [ItemConfigPillEffectType.NEGATIVE]: 0, // 1
  [ItemConfigPillEffectType.NEUTRAL]: 1, // 2
  [ItemConfigPillEffectType.MODDED]: 0, // 3 (not valid for vanilla pill effects)
} as const satisfies Record<ItemConfigPillEffectType, Quality>;

/**
 * We simply map the pill effect type to a quality value.
 *
 * (We do not create a more granular quality based on pill effect class because there would not be
 * enough pills per quality to make the N% threshold check provide enough variety.)
 */
export const PILL_EFFECT_QUALITIES = (() => {
  const pillEffectQualities: Partial<Record<PillEffect, Quality>> = {};

  for (const pillEffect of VANILLA_PILL_EFFECTS) {
    const pillEffectType = getPillEffectType(pillEffect);
    pillEffectQualities[pillEffect] =
      PILL_EFFECT_TYPE_TO_QUALITY[pillEffectType];
  }

  return pillEffectQualities as Readonly<Record<PillEffect, Quality>>;
})();
