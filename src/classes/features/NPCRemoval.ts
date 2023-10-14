import { EntityType, FireplaceVariant } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isOtherUnlockKindUnlocked } from "./achievementTracker/completedUnlocks";

export class NPCRemoval extends RandomizerModFeature {
  // 17
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
  ):
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined {
    return isOtherUnlockKindUnlocked(OtherUnlockKind.SHOPKEEPERS, true)
      ? undefined
      : [EntityType.EFFECT, EffectVariantCustom.INVISIBLE_EFFECT, 0, initSeed];
  }

  // 33.2
  @CallbackCustom(
    ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER,
    EntityType.FIREPLACE,
    FireplaceVariant.BLUE,
  )
  preEntitySpawnBlueFire(
    _entityType: EntityType,
    _variant: int,
    _subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    initSeed: Seed,
  ):
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined {
    return isOtherUnlockKindUnlocked(
      OtherUnlockKind.BLUE_PURPLE_FIREPLACES,
      true,
    )
      ? undefined
      : [EntityType.FIREPLACE, FireplaceVariant.NORMAL, 0, initSeed];
  }

  // 33.3
  @CallbackCustom(
    ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER,
    EntityType.FIREPLACE,
    FireplaceVariant.PURPLE,
  )
  preEntitySpawnPurpleFire(
    _entityType: EntityType,
    _variant: int,
    _subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    initSeed: Seed,
  ):
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined {
    return isOtherUnlockKindUnlocked(
      OtherUnlockKind.BLUE_PURPLE_FIREPLACES,
      true,
    )
      ? undefined
      : [EntityType.FIREPLACE, FireplaceVariant.NORMAL, 0, initSeed];
  }
}
