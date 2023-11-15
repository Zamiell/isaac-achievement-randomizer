import { GridEntityType } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";

export const UNLOCKABLE_GRID_ENTITY_TYPES = [
  GridEntityType.ROCK_TINTED, // 4
  GridEntityType.CRAWL_SPACE, // 18
  GridEntityType.ROCK_SUPER_SPECIAL, // 22
  GridEntityType.ROCK_GOLD, // 27
] as const;

export const UNLOCKABLE_GRID_ENTITY_TYPES_SET = new ReadonlySet<GridEntityType>(
  UNLOCKABLE_GRID_ENTITY_TYPES,
);

const GRID_ENTITY_NAMES = {
  // 4
  [GridEntityType.ROCK_TINTED]: "Tinted Rocks",

  // 18
  [GridEntityType.CRAWL_SPACE]: "Crawl Spaces",

  // 22
  [GridEntityType.ROCK_SUPER_SPECIAL]: "Super Tinted Rocks",

  // 27
  [GridEntityType.ROCK_GOLD]: "Fool's Gold Rocks",
} as const satisfies Record<
  (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number],
  string
>;

export function getGridEntityName(
  gridEntityType: (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number],
): string {
  return GRID_ENTITY_NAMES[gridEntityType];
}
