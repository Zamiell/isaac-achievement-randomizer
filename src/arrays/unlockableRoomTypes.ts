import { RoomType } from "isaac-typescript-definitions";

export const UNLOCKABLE_ROOM_TYPES = [
  RoomType.ARCADE, // 9
  RoomType.CURSE, // 10
  RoomType.LIBRARY, // 12
  RoomType.SACRIFICE, // 13
  /// RoomType.CLEAN_BEDROOM, // 18 (uncomment if another unlock is needed)
  /// RoomType.DIRTY_BEDROOM, // 19 (uncomment if another unlock is needed)
  RoomType.VAULT, // 20
  RoomType.DICE, // 21
  RoomType.PLANETARIUM, // 24
] as const;

// Other special room types:
// - Mini-Boss Room
// - Treasure Rooms
// - Shops
// - Challenge Rooms
// - Boss Challenge Room
// - Secret Rooms
// - Super Secret Rooms
// - Ultra Secret Rooms
