/** This is 1 instead of 0 because Lua has 1-indexed arrays. */
export const DSS_CHOICE_DISABLED = 1 as 1 | 2;

/** This is 2 instead of 1 because Lua has 1-indexed arrays. */
const DSS_CHOICE_ENABLED = 2 as 1 | 2;

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
