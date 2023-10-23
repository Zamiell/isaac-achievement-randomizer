import {
  EffectVariant,
  ModCallback,
  RoomType,
  SoundEffect,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  changeRoom,
  game,
  getAdjacentExistingRoomGridIndexes,
  getAngelRoomDoor,
  getDevilRoomDoor,
  getDoorsToRoomIndex,
  getRoomGridIndexesForType,
  hideRoomOnMinimap,
  inRoomType,
  isAfterRoomFrame,
  isRedKeyRoom,
  removeAllEffects,
  removeDoor,
  removeDoors,
  sfxManager,
} from "isaacscript-common";
import { UNLOCKABLE_ROOM_TYPES } from "../../arrays/unlockableRoomTypes";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isRoomTypeUnlocked } from "./achievementTracker/completedUnlocks";

export class RoomRemoval extends RandomizerModFeature {
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    this.removeDevilAngelDoors();
    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    this.removeDevilAngelDoors();

    for (const roomType of UNLOCKABLE_ROOM_TYPES) {
      if (!isRoomTypeUnlocked(roomType, true)) {
        this.checkForRoomType(roomType);
      }
    }
  }

  removeDevilAngelDoors(): void {
    const devilRoomDoor = getDevilRoomDoor();
    if (
      devilRoomDoor !== undefined &&
      !isRoomTypeUnlocked(RoomType.DEVIL, true)
    ) {
      removeDoor(devilRoomDoor);
      removeAllEffects(EffectVariant.DUST_CLOUD);

      if (isAfterRoomFrame(0)) {
        sfxManager.Stop(SoundEffect.SATAN_ROOM_APPEAR);
      }
    }

    const angelRoomDoor = getAngelRoomDoor();
    if (
      angelRoomDoor !== undefined &&
      !isRoomTypeUnlocked(RoomType.ANGEL, true)
    ) {
      removeDoor(angelRoomDoor);
      removeAllEffects(EffectVariant.DUST_CLOUD);

      if (isAfterRoomFrame(0)) {
        sfxManager.Stop(SoundEffect.CHOIR_UNLOCK);
      }
    }
  }

  checkForRoomType(bannedRoomType: RoomType): void {
    if (inRoomType(bannedRoomType)) {
      this.inBannedRoom();
    } else {
      this.outsideBannedRoom(bannedRoomType);
    }
  }

  inBannedRoom(): void {
    // Since the doors were removed, the only way to get in a banned room is via a random teleport
    // of some kind (e.g. Curse of the Maze, Teleport) or a red key room. If the player is inside of
    // a banned roomed, place them instead in the adjacent room (on the normal floor, not in a red
    // key room).
    const roomGridIndexes = getAdjacentExistingRoomGridIndexes();
    const attachedRoomGridIndex = roomGridIndexes.find(
      (roomGridIndex) => !isRedKeyRoom(roomGridIndex),
    );
    const level = game.GetLevel();
    const roomGridIndex = attachedRoomGridIndex ?? level.GetStartingRoomIndex();
    changeRoom(roomGridIndex);

    const player = Isaac.GetPlayer();
    const sprite = player.GetSprite();
    if (sprite.IsPlaying("TeleportDown")) {
      player.AnimateTeleport(false);
    }
  }

  outsideBannedRoom(bannedRoomType: RoomType): void {
    // Delete the doors to the banned room, if any. This includes the doors in a Secret Room. (We
    // must delete the door before changing the minimap, or else the icon will remain.)
    const bannedRoomGridIndexes = getRoomGridIndexesForType(bannedRoomType);
    const doorsToBannedRooms = getDoorsToRoomIndex(...bannedRoomGridIndexes);
    removeDoors(...doorsToBannedRooms);

    // Delete the icon on the minimap. (This has to be done on every room, because it will
    // reappear.)
    for (const roomGridIndex of bannedRoomGridIndexes) {
      hideRoomOnMinimap(roomGridIndex);
    }
  }
}
