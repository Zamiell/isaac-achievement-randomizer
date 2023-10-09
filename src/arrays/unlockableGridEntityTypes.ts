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
      return "Tinted Rocks";
    }

    // 18
    case GridEntityType.CRAWL_SPACE: {
      return "Crawl Spaces";
    }

    // 22
    case GridEntityType.ROCK_SUPER_SPECIAL: {
      return "Super Tinted Rocks";
    }

    // 27
    case GridEntityType.ROCK_GOLD: {
      return "Fool's Gold Rocks";
    }
  }
}
