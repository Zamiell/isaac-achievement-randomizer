export enum OtherAchievementKind {
  BEDS,

  SHOPKEEPERS,
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

export function getOtherAchievementName(
  otherAchievementKind: OtherAchievementKind,
): [string, string] {
  switch (otherAchievementKind) {
    case OtherAchievementKind.BEDS: {
      return ["pickup", "Beds"];
    }

    case OtherAchievementKind.SHOPKEEPERS: {
      return ["entity", "Shopkeepers"];
    }

    case OtherAchievementKind.GOLD_TRINKETS: {
      return ["trinket type", "Gold Trinkets"];
    }

    case OtherAchievementKind.GOLD_PILLS: {
      return ["pill type", "Gold Pills"];
    }

    case OtherAchievementKind.HORSE_PILLS: {
      return ["pill type", "Horse Pills"];
    }

    case OtherAchievementKind.URNS: {
      return ["grid entity", "Urns"];
    }

    case OtherAchievementKind.MUSHROOMS: {
      return ["grid entity", "Mushrooms"];
    }

    case OtherAchievementKind.SKULLS: {
      return ["grid entity", "Skulls"];
    }

    case OtherAchievementKind.POLYPS: {
      return ["grid entity", "Polyps"];
    }

    case OtherAchievementKind.GOLDEN_POOP: {
      return ["grid entity", "Golden Poop"];
    }

    case OtherAchievementKind.RAINBOW_POOP: {
      return ["grid entity", "Rainbow Poop"];
    }

    case OtherAchievementKind.BLACK_POOP: {
      return ["grid entity", "Black Poop"];
    }

    case OtherAchievementKind.CHARMING_POOP: {
      return ["grid entity", "Charming Poop"];
    }

    case OtherAchievementKind.REWARD_PLATES: {
      return ["grid entity", "Reward Plates"];
    }
  }
}
