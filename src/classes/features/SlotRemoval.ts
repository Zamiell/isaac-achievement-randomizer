import {
  CoinSubType,
  EntityType,
  PickupVariant,
  SlotVariant,
} from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isSlotVariantUnlocked } from "./AchievementTracker";

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
  ): [EntityType, int, int, int] | undefined {
    const slotVariant = variant as SlotVariant;

    if (isSlotVariantUnlocked(slotVariant)) {
      return undefined;
    }

    return slotVariant === SlotVariant.MOMS_DRESSING_TABLE
      ? [EntityType.EFFECT, EffectVariantCustom.INVISIBLE_EFFECT, 0, initSeed]
      : [EntityType.PICKUP, PickupVariant.COIN, CoinSubType.PENNY, initSeed];
  }
}
