import { RoomType } from "isaac-typescript-definitions";

export const UNLOCKABLE_ROOM_TYPES = [
  // - RoomType.DEFAULT (1)
  RoomType.SHOP, // 2
  // - RoomType.ERROR (3)
  RoomType.TREASURE, // 4
  // - RoomType.BOSS (5)
  // - RoomType.MINI_BOSS (6)
  RoomType.SECRET, // 7
  RoomType.SUPER_SECRET, // 8
  RoomType.ARCADE, // 9
  RoomType.CURSE, // 10
  RoomType.CHALLENGE, // 11
  RoomType.LIBRARY, // 12
  RoomType.SACRIFICE, // 13
  // - RoomType.DEVIL (14)
  // - RoomType.ANGEL (15)
  // - RoomType.DUNGEON (16)
  // - RoomType.BOSS_RUSH (17)
  RoomType.CLEAN_BEDROOM, // 18
  RoomType.DIRTY_BEDROOM, // 19
  RoomType.VAULT, // 20
  RoomType.DICE, // 21
  RoomType.BLACK_MARKET, // 22
  // - RoomType.GREED_EXIT (23)
  RoomType.PLANETARIUM, // 24
  // - RoomType.TELEPORTER (25)
  // - RoomType.TELEPORTER_EXIT (26)
  // - RoomType.SECRET_EXIT (27)
  // - RoomType.BLUE (28)
  RoomType.ULTRA_SECRET, // 29
] as const;
