import { GridEntityType } from "isaac-typescript-definitions";

export const UNLOCKABLE_GRID_ENTITY_TYPES = [
  GridEntityType.ROCK_TINTED, // 4
  GridEntityType.CRAWL_SPACE, // 18
  GridEntityType.ROCK_SUPER_SPECIAL, // 22
  GridEntityType.ROCK_GOLD, // 27
] as const;

export function getGridEntityName(
  gridEntityType: (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number],
): string {
  switch (gridEntityType) {
    // 4
    case GridEntityType.ROCK_TINTED: {
      return "tinted rocks";
    }

    // 18
    case GridEntityType.CRAWL_SPACE: {
      return "crawl spaces";
    }

    // 22
    case GridEntityType.ROCK_SUPER_SPECIAL: {
      return "super tinted rocks";
    }

    // 27
    case GridEntityType.ROCK_GOLD: {
      return "fool's gold rocks";
    }
  }
}
