export enum OtherUnlockKind {
  BEDS,
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

export function getOtherUnlockName(
  otherUnlockKind: OtherUnlockKind,
): [string, string] {
  switch (otherUnlockKind) {
    case OtherUnlockKind.BEDS: {
      return ["pickup", "Beds"];
    }

    case OtherUnlockKind.SHOPKEEPERS: {
      return ["entity", "Shopkeepers"];
    }

    case OtherUnlockKind.GOLD_TRINKETS: {
      return ["trinket type", "Gold Trinkets"];
    }

    case OtherUnlockKind.GOLD_PILLS: {
      return ["pill type", "Gold Pills"];
    }

    case OtherUnlockKind.HORSE_PILLS: {
      return ["pill type", "Horse Pills"];
    }

    case OtherUnlockKind.GOLDEN_POOP: {
      return ["grid entity", "Golden Poop"];
    }

    case OtherUnlockKind.RAINBOW_POOP: {
      return ["grid entity", "Rainbow Poop"];
    }

    case OtherUnlockKind.BLACK_POOP: {
      return ["grid entity", "Black Poop"];
    }

    case OtherUnlockKind.CHARMING_POOP: {
      return ["grid entity", "Charming Poop"];
    }

    case OtherUnlockKind.REWARD_PLATES: {
      return ["grid entity", "Reward Plates"];
    }
  }
}
