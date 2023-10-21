export enum OtherUnlockKind {
  BEDS,
  SHOPKEEPERS,

  BLUE_AND_PURPLE_FIREPLACES,

  GOLD_TRINKETS,
  GOLD_PILLS,
  HORSE_PILLS,

  URNS, // 6.0
  MUSHROOMS, // 6.0
  SKULLS, // 6.0
  POLYPS, // 6.0

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

    case OtherUnlockKind.BLUE_AND_PURPLE_FIREPLACES: {
      return ["entity", "Blue & Purple Fireplaces"];
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

    case OtherUnlockKind.URNS: {
      return ["grid entity", "Urns"];
    }

    case OtherUnlockKind.MUSHROOMS: {
      return ["grid entity", "Mushrooms"];
    }

    case OtherUnlockKind.SKULLS: {
      return ["grid entity", "Skulls"];
    }

    case OtherUnlockKind.POLYPS: {
      return ["grid entity", "Polyps"];
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
