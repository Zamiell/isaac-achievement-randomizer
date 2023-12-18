import { BossID } from "isaac-typescript-definitions";
import type { StoryBossID } from "isaacscript-common";
import { CharacterObjectiveKind } from "./CharacterObjectiveKind";

/** We want core areas to be static, but hard areas to be randomized. */
export enum UnlockableArea {
  WOMB,
  CATHEDRAL,
  SHEOL,
  CHEST,
  DARK_ROOM,
  MEGA_SATAN,
  BOSS_RUSH,
  BLUE_WOMB,
  REPENTANCE_FLOORS,
  ASCENT,
  GREED_MODE,
}

export const STATIC_UNLOCKABLE_AREAS = [
  UnlockableArea.WOMB, // By defeating Mom (on every character).
  UnlockableArea.CATHEDRAL, // By defeating It Lives.
  UnlockableArea.SHEOL, // By defeating Isaac.
  UnlockableArea.CHEST, // By defeating Satan.
  UnlockableArea.DARK_ROOM, // By defeating Blue Baby.
  UnlockableArea.REPENTANCE_FLOORS, // By defeating The Lamb.
  UnlockableArea.MEGA_SATAN, // By defeating Mother.
] as const;

const STORY_BOSS_TO_UNLOCKABLE_AREA = {
  [BossID.MOM]: undefined, // 6
  [BossID.MOMS_HEART]: UnlockableArea.WOMB, // 8
  [BossID.SATAN]: UnlockableArea.SHEOL, // 24
  [BossID.IT_LIVES]: UnlockableArea.WOMB, // 25
  [BossID.ISAAC]: UnlockableArea.CATHEDRAL, // 39
  [BossID.BLUE_BABY]: UnlockableArea.CHEST, // 40
  [BossID.LAMB]: UnlockableArea.DARK_ROOM, // 54
  [BossID.MEGA_SATAN]: UnlockableArea.MEGA_SATAN, // 55
  [BossID.ULTRA_GREED]: UnlockableArea.GREED_MODE, // 62
  [BossID.HUSH]: UnlockableArea.BLUE_WOMB, // 63
  [BossID.DELIRIUM]: undefined, // 70
  [BossID.ULTRA_GREEDIER]: UnlockableArea.GREED_MODE, // 71
  [BossID.MOTHER]: UnlockableArea.REPENTANCE_FLOORS, // 88
  [BossID.MAUSOLEUM_MOM]: UnlockableArea.REPENTANCE_FLOORS, // 89
  [BossID.MAUSOLEUM_MOMS_HEART]: UnlockableArea.REPENTANCE_FLOORS, // 90
  [BossID.DOGMA]: UnlockableArea.ASCENT, // 99
  [BossID.BEAST]: UnlockableArea.ASCENT, // 100
} as const satisfies Record<StoryBossID, UnlockableArea | undefined>;

export function getUnlockableAreaFromStoryBoss(
  storyBossID: StoryBossID,
): UnlockableArea | undefined {
  return STORY_BOSS_TO_UNLOCKABLE_AREA[storyBossID];
}

const CHARACTER_OBJECTIVE_KIND_TO_UNLOCKABLE_AREA = {
  [CharacterObjectiveKind.MOM]: undefined,
  [CharacterObjectiveKind.IT_LIVES]: UnlockableArea.WOMB,
  [CharacterObjectiveKind.ISAAC]: UnlockableArea.CATHEDRAL,
  [CharacterObjectiveKind.SATAN]: UnlockableArea.SHEOL,
  [CharacterObjectiveKind.BLUE_BABY]: UnlockableArea.CHEST,
  [CharacterObjectiveKind.LAMB]: UnlockableArea.DARK_ROOM,
  [CharacterObjectiveKind.MEGA_SATAN]: UnlockableArea.MEGA_SATAN,
  [CharacterObjectiveKind.BOSS_RUSH]: UnlockableArea.BOSS_RUSH,
  [CharacterObjectiveKind.HUSH]: UnlockableArea.BLUE_WOMB,
  [CharacterObjectiveKind.MOTHER]: UnlockableArea.REPENTANCE_FLOORS,
  [CharacterObjectiveKind.BEAST]: UnlockableArea.ASCENT,
  [CharacterObjectiveKind.ULTRA_GREED]: UnlockableArea.GREED_MODE,
  [CharacterObjectiveKind.NO_HIT_BASEMENT]: undefined,
  [CharacterObjectiveKind.NO_HIT_CAVES]: undefined,
  [CharacterObjectiveKind.NO_HIT_DEPTHS]: undefined,
  [CharacterObjectiveKind.NO_HIT_WOMB]: UnlockableArea.WOMB,
} as const satisfies Record<CharacterObjectiveKind, UnlockableArea | undefined>;

export function getUnlockableAreaFromCharacterObjectiveKind(
  kind: CharacterObjectiveKind,
): UnlockableArea | undefined {
  return CHARACTER_OBJECTIVE_KIND_TO_UNLOCKABLE_AREA[kind];
}

const UNLOCKABLE_AREA_NAMES = {
  [UnlockableArea.WOMB]: "The Womb",
  [UnlockableArea.CATHEDRAL]: "Cathedral",
  [UnlockableArea.SHEOL]: "Sheol",
  [UnlockableArea.CHEST]: "The Chest",
  [UnlockableArea.DARK_ROOM]: "Dark Room",
  [UnlockableArea.MEGA_SATAN]: "Mega Satan",
  [UnlockableArea.BOSS_RUSH]: "Boss Rush",
  [UnlockableArea.BLUE_WOMB]: "Blue Womb",
  [UnlockableArea.REPENTANCE_FLOORS]: "Repentance Floors",
  [UnlockableArea.ASCENT]: "The Ascent",
  [UnlockableArea.GREED_MODE]: "Greed Mode",
} as const satisfies Record<UnlockableArea, string>;

export function getAreaName(unlockableArea: UnlockableArea): string {
  return UNLOCKABLE_AREA_NAMES[unlockableArea];
}
