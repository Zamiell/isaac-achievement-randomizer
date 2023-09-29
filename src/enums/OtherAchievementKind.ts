export enum OtherAchievementKind {
  BEDS,

  SHOPKEEPERS,
  BLUE_FIREPLACES,
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
      return ["pickup", "beds"];
    }

    case OtherAchievementKind.SHOPKEEPERS: {
      return ["entity", "shopkeepers"];
    }

    case OtherAchievementKind.BLUE_FIREPLACES: {
      return ["entity", "blue fireplaces"];
    }

    case OtherAchievementKind.GOLD_TRINKETS: {
      return ["trinket type", "gold trinkets"];
    }

    case OtherAchievementKind.GOLD_PILLS: {
      return ["pill type", "gold pills"];
    }

    case OtherAchievementKind.HORSE_PILLS: {
      return ["pill type", "horse pills"];
    }

    case OtherAchievementKind.URNS: {
      return ["grid entity", "urns"];
    }

    case OtherAchievementKind.MUSHROOMS: {
      return ["grid entity", "mushrooms"];
    }

    case OtherAchievementKind.SKULLS: {
      return ["grid entity", "skulls"];
    }

    case OtherAchievementKind.POLYPS: {
      return ["grid entity", "polyps"];
    }

    case OtherAchievementKind.GOLDEN_POOP: {
      return ["grid entity", "golden poop"];
    }

    case OtherAchievementKind.RAINBOW_POOP: {
      return ["grid entity", "rainbow poop"];
    }

    case OtherAchievementKind.BLACK_POOP: {
      return ["grid entity", "black poop"];
    }

    case OtherAchievementKind.CHARMING_POOP: {
      return ["grid entity", "charming poop"];
    }

    case OtherAchievementKind.REWARD_PLATES: {
      return ["grid entity", "reward plates"];
    }
  }
}
