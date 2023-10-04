import { ModCallback } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { RandomizerModFeature } from "../RandomizerModFeature";

/**
 * The `PRE_ENTITY_SPAWN` callback does not allow removing entities, so we replace entities with
 * invisible versions as a workaround, and then immediately remove them upon spawning.
 */
export class InvisibleEntities extends RandomizerModFeature {
  // 54
  @Callback(ModCallback.POST_EFFECT_INIT, EffectVariantCustom.INVISIBLE_EFFECT)
  postEffectInitInvisibleEffect(effect: EntityEffect): void {
    effect.Remove();
  }
}
