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
  convertXMLGridEntityType,
  isGridEntityXMLType,
  isPoopGridEntityXMLType,
  setGridEntityType,
} from "isaacscript-common";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { UnlockableArea } from "../../enums/UnlockableArea";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isAreaUnlocked,
  isGridEntityTypeUnlocked,
  isOtherUnlockKindUnlocked,
} from "./achievementTracker/completedUnlocks";

const POOP_ANM2_PATH = "gfx/grid/grid_poop.anm2";

export class GridEntityRemoval extends RandomizerModFeature {
  /** @see `UNLOCKABLE_GRID_ENTITY_TYPES` */
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT)
  postGridEntityInit(gridEntity: GridEntity): void {
    const gridEntityType = gridEntity.GetType();

    if (isGridEntityTypeUnlocked(gridEntityType, true)) {
      return;
    }

    const newGridEntityType =
      gridEntityType === GridEntityType.CRAWL_SPACE
        ? GridEntityType.DECORATION
        : GridEntityType.ROCK;
    setGridEntityType(gridEntity, newGridEntityType);
  }

  // 14
  @CallbackCustom(ModCallbackCustom.POST_GRID_ENTITY_INIT, GridEntityType.POOP)
  postGridEntityInitPoop(gridEntity: GridEntity): void {
    const poopGridEntityVariant =
      gridEntity.GetVariant() as PoopGridEntityVariant;

    const otherUnlockKind = poopGridEntityVariantToOtherUnlockKind(
      poopGridEntityVariant,
    );
    if (otherUnlockKind === undefined) {
      return;
    }

    if (isOtherUnlockKindUnlocked(otherUnlockKind, true)) {
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
    if (!isAreaUnlocked(UnlockableArea.ASCENT, true)) {
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
    if (!isOtherUnlockKindUnlocked(OtherUnlockKind.REWARD_PLATES, true)) {
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
    const otherUnlockKind = poopGridEntityVariantToOtherUnlockKind(
      poopGridEntityVariant,
    );
    if (otherUnlockKind === undefined) {
      return undefined;
    }

    if (isOtherUnlockKindUnlocked(otherUnlockKind, true)) {
      return undefined;
    }

    return [GridEntityXMLType.POOP, 0, 0];
  }

  @CallbackCustom(
    ModCallbackCustom.PRE_ROOM_ENTITY_SPAWN_FILTER,
    GridEntityXMLType.ROCK_ALT_2, // 1008
  )
  preRoomEntitySpawnRockAlt2():
    | [type: EntityType | GridEntityXMLType, variant: int, subType: int]
    | undefined {
    return isAreaUnlocked(UnlockableArea.ASCENT, true)
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
    return isOtherUnlockKindUnlocked(OtherUnlockKind.REWARD_PLATES, true)
      ? undefined
      : [GridEntityXMLType.ROCK, 0, 0];
  }
}

function poopGridEntityVariantToOtherUnlockKind(
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
