export enum OtherUnlockKind {
  SHOPKEEPERS,

  GOLD_TRINKETS,
  GOLD_PILLS,
  HORSE_PILLS,

  GOLDEN_POOP, // 14.3
  RAINBOW_POOP, // 14.4
  BLACK_POOP, // 14.5
  CHARMING_POOP, // 14.11

  REWARD_PLATES, // 20.1
}

const OTHER_UNLOCK_KIND_NAMES = {
  [OtherUnlockKind.SHOPKEEPERS]: ["entity", "Shopkeepers"],
  [OtherUnlockKind.GOLD_TRINKETS]: ["trinket type", "Gold Trinkets"],
  [OtherUnlockKind.GOLD_PILLS]: ["pill type", "Gold Pills"],
  [OtherUnlockKind.HORSE_PILLS]: ["pill type", "Horse Pills"],
  [OtherUnlockKind.GOLDEN_POOP]: ["grid entity", "Golden Poop"],
  [OtherUnlockKind.RAINBOW_POOP]: ["grid entity", "Rainbow Poop"],
  [OtherUnlockKind.BLACK_POOP]: ["grid entity", "Black Poop"],
  [OtherUnlockKind.CHARMING_POOP]: ["grid entity", "Charming Poop"],
  [OtherUnlockKind.REWARD_PLATES]: ["grid entity", "Reward Plates"],
} as const satisfies Record<OtherUnlockKind, readonly [string, string]>;

export function getOtherUnlockName(
  otherUnlockKind: OtherUnlockKind,
): readonly [string, string] {
  return OTHER_UNLOCK_KIND_NAMES[otherUnlockKind];
}
