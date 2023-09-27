import { EntityType, SlotVariant } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  ReadonlySet,
} from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { RandomizerModFeature } from "../RandomizerModFeature";

const DONATION_MACHINE_VARIANTS = new ReadonlySet<SlotVariant>([
  SlotVariant.DONATION_MACHINE,
  SlotVariant.GREED_DONATION_MACHINE,
]);

export class RemoveDonationMachines extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER, EntityType.SLOT)
  preEntitySpawnSlot(
    _entityType: EntityType,
    variant: int,
    _subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    _initSeed: Seed,
  ): [EntityType, int, int, int] | undefined {
    const slotVariant = variant as SlotVariant;

    return DONATION_MACHINE_VARIANTS.has(slotVariant)
      ? [EntityType.EFFECT, EffectVariantCustom.INVISIBLE_EFFECT, 0, 0]
      : undefined;
  }
}
