import {
  EffectVariant,
  EntityType,
  SlotVariant,
} from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class RemoveDonationMachines extends RandomizerModFeature {
  @CallbackCustom(
    ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER,
    EntityType.SLOT,
    SlotVariant.DONATION_MACHINE,
  )
  preEntitySpawnDonationMachine(): [EntityType, int, int, int] | undefined {
    return [EntityType.EFFECT, EffectVariant.BEETLE, 0, 0];
  }
}
