import {
  BossID,
  CollectibleType,
  EffectVariant,
  EntityType,
  GridEntityType,
  HeavenLightDoorSubType,
  LevelCurse,
  LevelStage,
  ModCallback,
  PickupVariant,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  DISTANCE_OF_GRID_TILE,
  ModCallbackCustom,
  ReadonlyMap,
  game,
  getBlueWombDoor,
  getBossID,
  getBossRushDoor,
  getEffects,
  getMegaSatanDoor,
  getRepentanceDoor,
  hasCurse,
  inCrawlSpaceWithBlackMarketEntrance,
  inRoomType,
  isRoomInsideGrid,
  onRepentanceStage,
  onStage,
  removeAllEffects,
  removeAllSpikes,
  removeAllTrapdoors,
  removeDoor,
  spawnGridEntity,
  spawnPickup,
} from "isaacscript-common";
import { PickupVariantCustom } from "../../enums/PickupVariantCustom";
import { UnlockableArea } from "../../enums/UnlockableArea";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  isAreaUnlocked,
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
      isAreaUnlocked(UnlockableArea.MEGA_SATAN, true)
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
      isAreaUnlocked(UnlockableArea.MEGA_SATAN, true)
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
      isAreaUnlocked(UnlockableArea.CHEST, true)
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
      isAreaUnlocked(UnlockableArea.DARK_ROOM, true)
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

/** This feature handles removing all of the areas from the game that are not unlocked yet. */
export class AreaRemoval extends RandomizerModFeature {
  v = v;

  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    this.checkMomTrapdoor();
    this.checkItLivesTrapdoorHeavenDoor();
    this.checkPathDoors();

    return undefined;
  }

  checkMomTrapdoor(): void {
    if (isAreaUnlocked(UnlockableArea.WOMB, true)) {
      return;
    }

    const bossID = getBossID();
    if (bossID !== BossID.MOM) {
      return;
    }

    // Account for reverse Emperor cards.
    const roomInsideGrid = isRoomInsideGrid();
    if (!roomInsideGrid) {
      return;
    }

    mod.runNextGameFrame(() => {
      removeAllTrapdoors();
    });

    const room = game.GetRoom();
    const centerPos = room.GetCenterPos();
    spawnPickup(PickupVariant.BIG_CHEST, 0, centerPos);
  }

  checkItLivesTrapdoorHeavenDoor(): void {
    const bossID = getBossID();
    if (bossID !== BossID.IT_LIVES) {
      return;
    }

    // Account for reverse Emperor cards.
    const roomInsideGrid = isRoomInsideGrid();
    if (!roomInsideGrid) {
      return;
    }

    if (!isAreaUnlocked(UnlockableArea.CATHEDRAL, true)) {
      // We have to use the next render frame instead of the next game frame or else the entity will
      // appear for a frame (which looks buggy).
      mod.runNextRenderFrame(() => {
        removeAllEffects(
          EffectVariant.HEAVEN_LIGHT_DOOR,
          HeavenLightDoorSubType.HEAVEN_DOOR,
        );
      });
    }

    if (!isAreaUnlocked(UnlockableArea.SHEOL, true)) {
      // If we remove the trapdoor on the next render frame, it will bug out the render engine of
      // the game. Thus, we revert to removing it on the next game frame, which will make it appear
      // for a single render frame.
      mod.runNextGameFrame(() => {
        removeAllTrapdoors();
      });
    }

    if (
      !isAreaUnlocked(UnlockableArea.CATHEDRAL, true) &&
      !isAreaUnlocked(UnlockableArea.SHEOL, true)
    ) {
      const room = game.GetRoom();
      const centerPos = room.GetCenterPos();
      spawnPickup(PickupVariant.BIG_CHEST, 0, centerPos);
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
      ? UnlockableArea.ASCENT
      : UnlockableArea.REPENTANCE_FLOORS;

    if (!isAreaUnlocked(unlockablePath, true)) {
      this.removeDoorAndSmoke(repentanceDoor);
    }
  }

  checkBlueWombDoor(): void {
    const blueWombDoor = getBlueWombDoor();
    if (blueWombDoor === undefined) {
      return;
    }

    if (!isAreaUnlocked(UnlockableArea.BLUE_WOMB, true)) {
      this.removeDoorAndSmoke(blueWombDoor);
    }
  }

  checkMegaSatanDoor(): void {
    const megaSatanDoor = getMegaSatanDoor();
    if (megaSatanDoor === undefined) {
      return;
    }

    if (!isAreaUnlocked(UnlockableArea.MEGA_SATAN, true)) {
      this.removeDoorAndSmoke(megaSatanDoor);
    }
  }

  checkBossRushDoor(): void {
    const bossRushDoor = getBossRushDoor();
    if (bossRushDoor === undefined) {
      return;
    }

    if (!isAreaUnlocked(UnlockableArea.BOSS_RUSH, true)) {
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
      removeAllSpikes();
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
      !isAreaUnlocked(UnlockableArea.DARK_ROOM, true)
    ) {
      removeAllSpikes();
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
