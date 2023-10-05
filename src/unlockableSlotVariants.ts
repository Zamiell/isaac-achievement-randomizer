import { SlotVariant } from "isaac-typescript-definitions";

export const UNLOCKABLE_SLOT_VARIANTS = [
  SlotVariant.SLOT_MACHINE, // 1
  SlotVariant.BLOOD_DONATION_MACHINE, // 2
  SlotVariant.FORTUNE_TELLING_MACHINE, // 3
  SlotVariant.BEGGAR, // 4
  SlotVariant.DEVIL_BEGGAR, // 5
  SlotVariant.SHELL_GAME, // 6
  SlotVariant.KEY_MASTER, // 7
  // - `SlotVariant.DONATION_MACHINE` (8) is always unlocked.
  SlotVariant.BOMB_BUM, // 9
  SlotVariant.SHOP_RESTOCK_MACHINE, // 10
  // - `SlotVariant.GREED_DONATION_MACHINE` (11) is always unlocked.
  SlotVariant.MOMS_DRESSING_TABLE, // 12
  SlotVariant.BATTERY_BUM, // 13
  // - `SlotVariant.ISAAC_SECRET` (14) is always unlocked.
  SlotVariant.HELL_GAME, // 15
  SlotVariant.CRANE_GAME, // 16
  SlotVariant.CONFESSIONAL, // 17
  SlotVariant.ROTTEN_BEGGAR, // 18
] as const;
