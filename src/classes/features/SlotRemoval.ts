import type { SlotVariant } from "isaac-typescript-definitions";
import { EntityType } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isSlotVariantUnlocked } from "./achievementTracker/completedAchievements";

export class SlotRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER, EntityType.SLOT)
  preEntitySpawnSlot(
    _entityType: EntityType,
    variant: int,
    _subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    initSeed: Seed,
  ):
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined {
    const slotVariant = variant as SlotVariant;

    if (isSlotVariantUnlocked(slotVariant)) {
      return undefined;
    }

    return [
      EntityType.EFFECT,
      EffectVariantCustom.INVISIBLE_EFFECT,
      0,
      initSeed,
    ];
  }
}
