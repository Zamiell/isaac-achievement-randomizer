import {
  CollectibleType,
  EffectVariant,
  EntityType,
  GridEntityType,
  LevelCurse,
  LevelStage,
  ModCallback,
  PickupVariant,
  RoomType,
  TrapdoorVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  DISTANCE_OF_GRID_TILE,
  ModCallbackCustom,
  ReadonlyMap,
  getBlueWombDoor,
  getBossRushDoor,
  getEffects,
  getMegaSatanDoor,
  getRepentanceDoor,
  getVoidDoor,
  hasCurse,
  inCrawlSpaceWithBlackMarketEntrance,
  inRoomType,
  onRepentanceStage,
  onStage,
  removeAllMatchingGridEntities,
  removeDoor,
  removeGridEntity,
  spawnGridEntity,
} from "isaacscript-common";
import { PickupVariantCustom } from "../../enums/PickupVariantCustom";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isPathUnlocked,
  isRoomTypeUnlocked,
} from "./achievementTracker/completedUnlocks";

const GRID_INDEX_BLOCKING_LADDER_TO_BLACK_MARKET = 86;

const COLLECTIBLE_REPLACEMENT_FUNCTIONS = new ReadonlyMap<
  CollectibleType,
  (
    initSeed: Seed,
  ) =>
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined
>([
  // 238
  [
    CollectibleType.KEY_PIECE_1,
    (initSeed: Seed) =>
      isPathUnlocked(UnlockablePath.MEGA_SATAN, true)
        ? undefined
        : [
            EntityType.PICKUP,
            PickupVariantCustom.INVISIBLE_PICKUP,
            0,
            initSeed,
          ],
  ],

  // 239
  [
    CollectibleType.KEY_PIECE_2,
    (initSeed: Seed) =>
      isPathUnlocked(UnlockablePath.MEGA_SATAN, true)
        ? undefined
        : [
            EntityType.PICKUP,
            PickupVariantCustom.INVISIBLE_PICKUP,
            0,
            initSeed,
          ],
  ],

  // 327
  [
    CollectibleType.POLAROID,
    (initSeed: Seed) =>
      isPathUnlocked(UnlockablePath.CHEST, true)
        ? undefined
        : [
            EntityType.PICKUP,
            PickupVariantCustom.INVISIBLE_PICKUP,
            0,
            initSeed,
          ],
  ],

  // 328
  [
    CollectibleType.NEGATIVE,
    (initSeed: Seed) =>
      isPathUnlocked(UnlockablePath.DARK_ROOM, true)
        ? undefined
        : [
            EntityType.PICKUP,
            PickupVariantCustom.INVISIBLE_PICKUP,
            0,
            initSeed,
          ],
  ],
]);

const v = {
  level: {
    removedSacrificeRoomSpikes: false,
  },
};

/** This feature handles removing all of the paths from the game that are not unlocked yet. */
export class PathRemoval extends RandomizerModFeature {
  v = v;

  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    this.checkPathDoors();
    return undefined;
  }

  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_UPDATE,
    GridEntityType.TRAPDOOR,
    TrapdoorVariant.VOID_PORTAL,
  )
  postGridEntityUpdateVoidPortal(gridEntity: GridEntity): void {
    if (!isPathUnlocked(UnlockablePath.VOID, true)) {
      removeGridEntity(gridEntity, false);
    }
  }

  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    this.checkPathDoors();
    this.checkRemoveSacrificeRoomSpikes();
    this.checkBlackMarket();
  }

  checkPathDoors(): void {
    this.checkRepentanceDoor();
    this.checkBlueWombDoor();
    this.checkVoidDoor();
    this.checkMegaSatanDoor();
    this.checkBossRushDoor();
  }

  checkRepentanceDoor(): void {
    const repentanceDoor = getRepentanceDoor();
    if (repentanceDoor === undefined) {
      return;
    }

    // The only Repentance door on Depths 2 / Necropolis 2 / Dank Depths 2 is the Strange Door
    // leading to the Ascent.
    const onFloorWithStrangeDoor =
      (onStage(LevelStage.DEPTHS_2) ||
        (onStage(LevelStage.DEPTHS_1) && hasCurse(LevelCurse.LABYRINTH))) &&
      !onRepentanceStage();
    const unlockablePath = onFloorWithStrangeDoor
      ? UnlockablePath.ASCENT
      : UnlockablePath.REPENTANCE_FLOORS;

    if (!isPathUnlocked(unlockablePath, true)) {
      this.removeDoorAndSmoke(repentanceDoor);
    }
  }

  checkBlueWombDoor(): void {
    const blueWombDoor = getBlueWombDoor();
    if (blueWombDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.BLUE_WOMB, true)) {
      this.removeDoorAndSmoke(blueWombDoor);
    }
  }

  checkVoidDoor(): void {
    const voidDoor = getVoidDoor();
    if (voidDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.VOID, true)) {
      this.removeDoorAndSmoke(voidDoor);
    }
  }

  checkMegaSatanDoor(): void {
    const megaSatanDoor = getMegaSatanDoor();
    if (megaSatanDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.MEGA_SATAN, true)) {
      this.removeDoorAndSmoke(megaSatanDoor);
    }
  }

  checkBossRushDoor(): void {
    const bossRushDoor = getBossRushDoor();
    if (bossRushDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.BOSS_RUSH, true)) {
      this.removeDoorAndSmoke(bossRushDoor);
    }
  }

  removeDoorAndSmoke(door: GridEntityDoor): void {
    removeDoor(door);

    // When the door is spawned, the game creates dust clouds.
    for (const effect of getEffects(EffectVariant.DUST_CLOUD)) {
      if (effect.Position.Distance(door.Position) < DISTANCE_OF_GRID_TILE) {
        effect.Visible = false;
      }
    }
  }

  checkRemoveSacrificeRoomSpikes(): void {
    if (v.level.removedSacrificeRoomSpikes && inRoomType(RoomType.SACRIFICE)) {
      removeAllMatchingGridEntities(GridEntityType.SPIKES);
    }
  }

  /** A seed with a Black Market on the first floor: 1EVL K1Y8 */
  checkBlackMarket(): void {
    if (!inCrawlSpaceWithBlackMarketEntrance()) {
      return;
    }

    if (!isRoomTypeUnlocked(RoomType.BLACK_MARKET, true)) {
      spawnGridEntity(
        GridEntityType.STATUE,
        GRID_INDEX_BLOCKING_LADDER_TO_BLACK_MARKET,
      );
    }
  }

  @CallbackCustom(ModCallbackCustom.POST_SACRIFICE)
  postSacrifice(_player: EntityPlayer, numSacrifices: int): void {
    if (
      numSacrifices >= 11 &&
      !isPathUnlocked(UnlockablePath.DARK_ROOM, true)
    ) {
      removeAllMatchingGridEntities(GridEntityType.SPIKES);
      v.level.removedSacrificeRoomSpikes = true;
    }
  }

  @CallbackCustom(
    ModCallbackCustom.PRE_ENTITY_SPAWN_FILTER,
    EntityType.PICKUP,
    PickupVariant.COLLECTIBLE,
  )
  preEntitySpawnCollectible(
    _entityType: EntityType,
    _variant: int,
    subType: int,
    _position: Vector,
    _velocity: Vector,
    _spawner: Entity | undefined,
    initSeed: Seed,
  ):
    | [entityType: EntityType, variant: int, subType: int, initSeed: Seed]
    | undefined {
    const collectibleType = subType as CollectibleType;

    const func = COLLECTIBLE_REPLACEMENT_FUNCTIONS.get(collectibleType);
    return func === undefined ? undefined : func(initSeed);
  }
}
