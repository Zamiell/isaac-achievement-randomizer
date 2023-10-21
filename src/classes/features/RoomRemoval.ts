import type { RoomType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  changeRoom,
  game,
  getAdjacentExistingRoomGridIndexes,
  getDoorsToRoomIndex,
  getRoomGridIndexesForType,
  hideRoomOnMinimap,
  inRoomType,
  isRedKeyRoom,
  removeDoors,
} from "isaacscript-common";
import { UNLOCKABLE_ROOM_TYPES } from "../../arrays/unlockableRoomTypes";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isRoomTypeUnlocked } from "./achievementTracker/completedUnlocks";

export class RoomRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    for (const roomType of UNLOCKABLE_ROOM_TYPES) {
      if (!isRoomTypeUnlocked(roomType, true)) {
        this.checkForRoomType(roomType);
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
    // of some kind or a red key room. If the player is inside of a banned roomed, place them
    // instead in the adjacent room (on the normal floor, not in a red key room).
    const roomGridIndexes = getAdjacentExistingRoomGridIndexes();
    const attachedRoomGridIndex = roomGridIndexes.find(
      (roomGridIndex) => !isRedKeyRoom(roomGridIndex),
    );
    const level = game.GetLevel();
    const roomGridIndex = attachedRoomGridIndex ?? level.GetStartingRoomIndex();
    changeRoom(roomGridIndex);

    const player = Isaac.GetPlayer();
    player.AnimateTeleport(false);
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
