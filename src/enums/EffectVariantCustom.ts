import type { EffectVariant } from "isaac-typescript-definitions";
import { validateCustomEnum } from "isaacscript-common";

/** For `EntityType.EFFECT` (1000). */
export const EffectVariantCustom = {
  INVISIBLE_EFFECT: Isaac.GetEntityVariantByName(
    "Invisible Effect",
  ) as EffectVariant,
  ROOM_CLEAR_DELAY: Isaac.GetEntityVariantByName(
    "Room Clear Delay Effect",
  ) as EffectVariant,
} as const;

validateCustomEnum("EffectVariantCustom", EffectVariantCustom);
