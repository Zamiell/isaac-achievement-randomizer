import { RoomType } from "isaac-typescript-definitions";

const UNLOCKABLE_ROOM_TYPES = [
  RoomType.ARCADE, // 9
  RoomType.CURSE, // 10
  RoomType.LIBRARY, // 12
  RoomType.SACRIFICE, // 13
  RoomType.VAULT, // 20
  RoomType.DICE, // 21
  RoomType.PLANETARIUM, // 24
] as const;

export const UNLOCKABLE_ROOM_TYPES_ONLY_NIGHTMARE = [
  RoomType.SHOP, // 2
  RoomType.TREASURE, // 4
  RoomType.SECRET, // 7
  RoomType.SUPER_SECRET, // 8
  RoomType.CHALLENGE, // 11
  RoomType.CLEAN_BEDROOM, // 18
  RoomType.DIRTY_BEDROOM, // 19
  RoomType.ULTRA_SECRET, // 29
] as const;

const UNLOCKABLE_ROOM_TYPES_NIGHTMARE = [
  ...UNLOCKABLE_ROOM_TYPES,
  ...UNLOCKABLE_ROOM_TYPES_ONLY_NIGHTMARE,
] as const;

export function getUnlockableRoomTypes(
  nightmareMode: boolean,
): readonly RoomType[] {
  return nightmareMode
    ? UNLOCKABLE_ROOM_TYPES_NIGHTMARE
    : UNLOCKABLE_ROOM_TYPES;
}

// Other special room types:
// - RoomType.MINI_BOSS (6)
