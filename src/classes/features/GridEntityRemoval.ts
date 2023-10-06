import type { EntityType } from "isaac-typescript-definitions";
import {
  GridEntityType,
  GridEntityXMLType,
  ModCallback,
  PoopGridEntityVariant,
  PressurePlateVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  RockAltType,
  convertXMLGridEntityType,
  getRockAltType,
  isGridEntityXMLType,
  isPoopGridEntityXMLType,
  setGridEntityType,
} from "isaacscript-common";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isGridEntityTypeUnlocked,
  isOtherAchievementUnlocked,
  isPathUnlocked,
} from "./achievementTracker/completedAchievements";

const POOP_ANM2_PATH = "gfx/grid/grid_poop.anm2";

export class GridEntityRemoval extends RandomizerModFeature {
  /** @see `UNLOCKABLE_GRID_ENTITY_TYPES` */
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT)
  postGridEntityInit(gridEntity: GridEntity): void {
    const gridEntityType = gridEntity.GetType();

    if (isGridEntityTypeUnlocked(gridEntityType)) {
      return;
    }

    const newGridEntityType =
      gridEntityType === GridEntityType.CRAWL_SPACE
        ? GridEntityType.DECORATION
        : GridEntityType.ROCK;
    setGridEntityType(gridEntity, newGridEntityType);
  }

  // 6
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_ALT,
  )
  postGridEntityInitRockAlt(gridEntity: GridEntity): void {
    const rockAltType = getRockAltType();
    const achievementKind = rockAltTypeToAchievementKind(rockAltType);
    if (achievementKind === undefined) {
      return;
    }

    if (isOtherAchievementUnlocked(achievementKind)) {
      return;
    }

    setGridEntityType(gridEntity, GridEntityType.ROCK);
  }

  // 14
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT, GridEntityType.POOP)
  postGridEntityInitPoop(gridEntity: GridEntity): void {
    const poopGridEntityVariant =
      gridEntity.GetVariant() as PoopGridEntityVariant;

    const achievementKind = poopGridEntityVariantToAchievementKind(
      poopGridEntityVariant,
    );
    if (achievementKind === undefined) {
      return;
    }

    if (isOtherAchievementUnlocked(achievementKind)) {
      return;
    }

    gridEntity.SetVariant(PoopGridEntityVariant.NORMAL);
    const sprite = gridEntity.GetSprite();
    sprite.Load(POOP_ANM2_PATH, true);
    const defaultAnimation = sprite.GetDefaultAnimation();
    sprite.Play(defaultAnimation, true);
  }

  // 26
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.ROCK_ALT_2,
  )
  postGridEntityInitRockAlt2(gridEntity: GridEntity): void {
    if (!isPathUnlocked(UnlockablePath.ASCENT)) {
      setGridEntityType(gridEntity, GridEntityType.ROCK);
    }
  }

  // 26
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_INIT,
    GridEntityType.PRESSURE_PLATE,
    PressurePlateVariant.REWARD_PLATE,
  )
  postGridEntityInitRewardPlate(gridEntity: GridEntity): void {
    if (!isOtherAchievementUnlocked(OtherUnlockKind.REWARD_PLATES)) {
      setGridEntityType(gridEntity, GridEntityType.ROCK);
    }
  }

  @Callback(ModCallback.PRE_ROOM_ENTITY_SPAWN)
  preRoomEntitySpawn(
    entityTypeOrGridEntityXMLType: EntityType | GridEntityXMLType,
    variant: int,
    _subType: int,
    _gridIndex: int,
    _initSeed: Seed,
  ):
    | [type: EntityType | GridEntityXMLType, variant: int, subType: int]
    | undefined {
    if (!isGridEntityXMLType(entityTypeOrGridEntityXMLType)) {
      return undefined;
    }

    const gridEntityXMLType = entityTypeOrGridEntityXMLType;

    if (!isPoopGridEntityXMLType(gridEntityXMLType)) {
      return undefined;
    }

    const tuple = convertXMLGridEntityType(gridEntityXMLType, variant);
    if (tuple === undefined) {
      return undefined;
    }

    const [_gridEntityType, gridEntityVariant] = tuple;
    const poopGridEntityVariant = gridEntityVariant as PoopGridEntityVariant;
    const achievementKind = poopGridEntityVariantToAchievementKind(
      poopGridEntityVariant,
    );
    if (achievementKind === undefined) {
      return undefined;
    }

    if (isOtherAchievementUnlocked(achievementKind)) {
      return undefined;
    }

    return [GridEntityXMLType.POOP, 0, 0];
  }

  @CallbackCustom(
    ModCallbackCustom.PRE_ROOM_ENTITY_SPAWN_FILTER,
    GridEntityXMLType.ROCK_ALT, // 1002
  )
  preRoomEntitySpawnRockAlt():
    | [type: EntityType | GridEntityXMLType, variant: int, subType: int]
    | undefined {
    const rockAltType = getRockAltType();
    const achievementKind = rockAltTypeToAchievementKind(rockAltType);
    if (achievementKind === undefined) {
      return undefined;
    }

    if (isOtherAchievementUnlocked(achievementKind)) {
      return undefined;
    }

    return [GridEntityXMLType.ROCK, 0, 0];
  }

  @CallbackCustom(
    ModCallbackCustom.PRE_ROOM_ENTITY_SPAWN_FILTER,
    GridEntityXMLType.ROCK_ALT_2, // 1008
  )
  preRoomEntitySpawnRockAlt2():
    | [type: EntityType | GridEntityXMLType, variant: int, subType: int]
    | undefined {
    return isPathUnlocked(UnlockablePath.ASCENT)
      ? undefined
      : [GridEntityXMLType.ROCK, 0, 0];
  }

  @CallbackCustom(
    ModCallbackCustom.PRE_ROOM_ENTITY_SPAWN_FILTER,
    GridEntityXMLType.PRESSURE_PLATE, // 4500
    PressurePlateVariant.REWARD_PLATE,
  )
  preRoomEntitySpawnRewardPlate():
    | [type: EntityType | GridEntityXMLType, variant: int, subType: int]
    | undefined {
    return isOtherAchievementUnlocked(OtherUnlockKind.REWARD_PLATES)
      ? undefined
      : [GridEntityXMLType.ROCK, 0, 0];
  }
}

function rockAltTypeToAchievementKind(
  rockAltType: RockAltType,
): OtherUnlockKind | undefined {
  switch (rockAltType) {
    case RockAltType.URN: {
      return OtherUnlockKind.URNS;
    }

    case RockAltType.MUSHROOM: {
      return OtherUnlockKind.MUSHROOMS;
    }

    case RockAltType.SKULL: {
      return OtherUnlockKind.SKULLS;
    }

    case RockAltType.POLYP: {
      return OtherUnlockKind.POLYPS;
    }

    case RockAltType.BUCKET_DOWNPOUR:
    case RockAltType.BUCKET_DROSS: {
      return undefined;
    }
  }
}

function poopGridEntityVariantToAchievementKind(
  poopGridEntityVariant: PoopGridEntityVariant,
): OtherUnlockKind | undefined {
  switch (poopGridEntityVariant) {
    // 3
    case PoopGridEntityVariant.GOLDEN: {
      return OtherUnlockKind.GOLDEN_POOP;
    }

    // 4
    case PoopGridEntityVariant.RAINBOW: {
      return OtherUnlockKind.RAINBOW_POOP;
    }

    // 5
    case PoopGridEntityVariant.BLACK: {
      return OtherUnlockKind.BLACK_POOP;
    }

    // 11
    case PoopGridEntityVariant.CHARMING: {
      return OtherUnlockKind.CHARMING_POOP;
    }

    default: {
      return undefined;
    }
  }
}
