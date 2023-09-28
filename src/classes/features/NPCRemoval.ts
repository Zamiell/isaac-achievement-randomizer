import { EntityType } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isShopkeepersUnlocked } from "./AchievementTracker";

export class NPCRemoval extends RandomizerModFeature {
  @CallbackCustom(
    ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER,
    EntityType.SHOPKEEPER,
  )
  preEntitySpawnShopkeeper(
    _entityType: EntityType,
    _variant: int,
    _subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    initSeed: Seed,
  ): [EntityType, int, int, int] | undefined {
    return isShopkeepersUnlocked()
      ? undefined
      : [EntityType.EFFECT, EffectVariantCustom.INVISIBLE_EFFECT, 0, initSeed];
  }
}
