import { EntityType, FireplaceVariant } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { EffectVariantCustom } from "../../enums/EffectVariantCustom";
import { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isOtherAchievementsUnlocked } from "./AchievementTracker";

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
    return isOtherAchievementsUnlocked(OtherAchievementKind.SHOPKEEPERS)
      ? undefined
      : [EntityType.EFFECT, EffectVariantCustom.INVISIBLE_EFFECT, 0, initSeed];
  }

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
  ): [EntityType, int, int, int] | undefined {
    return isOtherAchievementsUnlocked(OtherAchievementKind.BLUE_FIREPLACES)
      ? undefined
      : [EntityType.FIREPLACE, FireplaceVariant.NORMAL, 0, initSeed];
  }
}
