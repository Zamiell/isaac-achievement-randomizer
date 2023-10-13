import { RoomType } from "isaac-typescript-definitions";

export const UNLOCKABLE_ROOM_TYPES = [
  RoomType.ARCADE, // 9
  RoomType.CURSE, // 10
  RoomType.LIBRARY, // 12
  RoomType.SACRIFICE, // 13
  RoomType.VAULT, // 20
  /// RoomType.DICE, // 21 (uncomment if one more unlock is needed)
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
// - Clean Bedrooms
// - Dirty Bedrooms
