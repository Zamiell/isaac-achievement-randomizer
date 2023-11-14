import {
  CardType,
  CollectibleType,
  TrinketType,
} from "isaac-typescript-definitions";
import type { BANNED_CARD_TYPES } from "./arrays/unlockableCardTypes";
import type { BANNED_COLLECTIBLE_TYPES } from "./arrays/unlockableCollectibleTypes";
import type { BANNED_TRINKET_TYPES } from "./arrays/unlockableTrinketTypes";

/** This is 1 instead of 0 because Lua has 1-indexed arrays. */
export const DSS_CHOICE_DISABLED = 1 as 1 | 2;

/** This is 2 instead of 1 because Lua has 1-indexed arrays. */
const DSS_CHOICE_ENABLED = 2 as 1 | 2;

const BANNED_COLLECTIBLE_TYPE_TO_KEY = {
  [CollectibleType.EDENS_BLESSING]: "unbanEdensBlessing", // 381
  [CollectibleType.PLAN_C]: "unbanPlanC", // 475
  [CollectibleType.CLICKER]: "unbanClicker", // 482
  [CollectibleType.METRONOME]: "unbanMetronome", // 488
  [CollectibleType.R_KEY]: "unbanRKey", // 636
  [CollectibleType.TMTRAINER]: "unbanTMTRAINER", // 721
} as const satisfies Record<
  (typeof BANNED_COLLECTIBLE_TYPES)[number],
  keyof typeof v.persistent.generation
>;

const BANNED_TRINKET_TYPE_TO_KEY = {
  [TrinketType.ERROR]: "unbanError", // 75
  [TrinketType.KARMA]: "unbanKarma", // 85
  [TrinketType.M]: "unbanM", // 138
} as const satisfies Record<
  (typeof BANNED_TRINKET_TYPES)[number],
  keyof typeof v.persistent.generation
>;

const BANNED_CARD_TYPE_TO_KEY = {
  [CardType.CHAOS]: "unbanChaosCard", // 42
} as const satisfies Record<
  (typeof BANNED_CARD_TYPES)[number],
  keyof typeof v.persistent.generation
>;

// Registered in "deadSeaScrolls.ts".
// eslint-disable-next-line isaacscript/require-v-registration
export const v = {
  persistent: {
    // Randomizer settings
    timer: DSS_CHOICE_DISABLED,
    preventPause: DSS_CHOICE_DISABLED,
    preventSaveAndQuit: DSS_CHOICE_DISABLED,
    delayAchievementText: DSS_CHOICE_DISABLED,

    // Cheat settings
    doubleUnlocks: DSS_CHOICE_DISABLED,
    allowMods: DSS_CHOICE_DISABLED,
    generation: {
      unbanEdensBlessing: DSS_CHOICE_DISABLED,
      unbanPlanC: DSS_CHOICE_DISABLED,
      unbanClicker: DSS_CHOICE_DISABLED,
      unbanMetronome: DSS_CHOICE_DISABLED,
      unbanRKey: DSS_CHOICE_DISABLED,
      unbanTMTRAINER: DSS_CHOICE_DISABLED,
      unbanError: DSS_CHOICE_DISABLED,
      unbanKarma: DSS_CHOICE_DISABLED,
      unbanM: DSS_CHOICE_DISABLED,
      unbanChaosCard: DSS_CHOICE_DISABLED,
    },
  },
};

export function isTimerEnabled(): boolean {
  return v.persistent.timer === DSS_CHOICE_ENABLED;
}

export function isPreventPauseEnabled(): boolean {
  return v.persistent.preventPause === DSS_CHOICE_ENABLED;
}

export function isPreventSaveAndQuitEnabled(): boolean {
  return v.persistent.preventSaveAndQuit === DSS_CHOICE_ENABLED;
}

export function isDelayAchievementTextEnabled(): boolean {
  return v.persistent.delayAchievementText === DSS_CHOICE_ENABLED;
}

export function isDoubleUnlocksEnabled(): boolean {
  return v.persistent.doubleUnlocks === DSS_CHOICE_ENABLED;
}

export function isAllowModsEnabled(): boolean {
  return v.persistent.allowMods === DSS_CHOICE_ENABLED;
}

export function isGenerationCheatsEnabled(): boolean {
  return Object.values(v.persistent.generation).includes(DSS_CHOICE_ENABLED);
}

export function isCollectibleTypeBannedForNewPlaythrough(
  collectibleType: CollectibleType,
): boolean {
  const key = BANNED_COLLECTIBLE_TYPE_TO_KEY[
    collectibleType as keyof typeof BANNED_COLLECTIBLE_TYPE_TO_KEY
  ] as keyof typeof v.persistent.generation | undefined;

  return key === undefined
    ? false
    : v.persistent.generation[key] === DSS_CHOICE_ENABLED;
}

export function isTrinketTypeBannedForNewPlaythrough(
  trinketType: TrinketType,
): boolean {
  const key = BANNED_TRINKET_TYPE_TO_KEY[
    trinketType as keyof typeof BANNED_TRINKET_TYPE_TO_KEY
  ] as keyof typeof v.persistent.generation | undefined;

  return key === undefined
    ? false
    : v.persistent.generation[key] === DSS_CHOICE_ENABLED;
}

export function isCardTypeBannedForNewPlaythrough(cardType: CardType): boolean {
  const key = BANNED_CARD_TYPE_TO_KEY[
    cardType as keyof typeof BANNED_CARD_TYPE_TO_KEY
  ] as keyof typeof v.persistent.generation | undefined;

  return key === undefined
    ? false
    : v.persistent.generation[key] === DSS_CHOICE_ENABLED;
}
