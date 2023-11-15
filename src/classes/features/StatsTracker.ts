/* eslint-disable max-classes-per-file */

import {
  ButtonAction,
  CallbackPriority,
  ModCallback,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  GAME_FRAMES_PER_SECOND,
  LAST_VANILLA_CARD_TYPE,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  LAST_VANILLA_PILL_EFFECT,
  LAST_VANILLA_TRINKET_TYPE,
  ModCallbackCustom,
  ModFeature,
  PriorityCallback,
  RENDER_FRAMES_PER_SECOND,
  game,
  isActionPressedOnAnyInput,
  isAfterRenderFrame,
  newRNG,
  onChallenge,
  rebirthItemTrackerWriteToFile,
  repeat,
} from "isaacscript-common";
import { ALL_OBJECTIVES } from "../../arrays/allObjectives";
import { isGenerationCheatsEnabled, isPreventPauseEnabled } from "../../config";
import { CardTypeCustom } from "../../enums/CardTypeCustom";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { mod } from "../../mod";
import { convertSecondsToTimerValues } from "../../timer";
import { isRoomClear } from "./PreventPause";
import {
  getNumCompletedObjectives,
  getRandomizerSeed,
  isRandomizerEnabled,
} from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

/** `isaacscript-common` uses `CallbackPriority.IMPORTANT` (-200). */
const HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON = (CallbackPriority.IMPORTANT -
  1) as CallbackPriority;

class PlaythroughStats {
  numCompletedRuns = 0;
  numDeaths = 0;
  gameFramesElapsed = 0;
  currentStreak = 0;
  bestStreak = 0;

  usedIllegalPause = false;
  usedSaveAndQuit = false;
  doubleUnlocked = false;
  usedMods = false;
  generatedWithCheat = false;
}

const v = {
  persistent: {
    stats: new PlaythroughStats(),
  },

  run: {
    shouldIncrementTime: true,
    shouldIncrementCompletedRunsCounter: true,
    shouldIncrementDeathCounter: true,

    renderFramePaused: null as int | null,
  },
};

export class StatsTracker extends ModFeature {
  v = v;

  protected override shouldCallbackMethodsFire = (): boolean =>
    isRandomizerEnabled() &&
    !onChallenge(ChallengeCustom.RANDOMIZER_CHILL_ROOM) &&
    !hasErrors();

  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    if (
      !isPreventPauseEnabled() &&
      isRoomClear() &&
      isActionPressedOnAnyInput(
        ButtonAction.PAUSE, // 12
        ButtonAction.CONSOLE, // 28
      )
    ) {
      v.persistent.stats.usedIllegalPause = true;

      if (
        v.run.renderFramePaused === null ||
        isAfterRenderFrame(v.run.renderFramePaused + RENDER_FRAMES_PER_SECOND)
      ) {
        print("Illegal pause detected.");
      }

      const renderFrameCount = Isaac.GetFrameCount();
      v.run.renderFramePaused = renderFrameCount;
    }
  }

  // 16
  @Callback(ModCallback.POST_GAME_END)
  postGameEnd(isGameOver: boolean): void {
    if (!isGameOver) {
      v.run.shouldIncrementDeathCounter = false;
    }
  }

  /**
   * We need this function to fire before the save data manager or else the `numDeaths` modification
   * will never be written to disk.
   */
  // 17
  @PriorityCallback(
    ModCallback.PRE_GAME_EXIT,
    HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON,
  )
  preGameExit(): void {
    this.incrementTime();
    this.incrementCompletedRunsCounter();
    this.incrementDeathCounter();
    writeStatsToFile();
  }

  incrementTime(): void {
    if (!v.run.shouldIncrementTime) {
      v.run.shouldIncrementTime = true;
      return;
    }

    v.persistent.stats.gameFramesElapsed += game.GetFrameCount();
  }

  incrementCompletedRunsCounter(): void {
    if (!v.run.shouldIncrementCompletedRunsCounter) {
      v.run.shouldIncrementCompletedRunsCounter = true;
      return;
    }

    v.persistent.stats.numCompletedRuns++;
    v.persistent.stats.currentStreak++;
    if (v.persistent.stats.currentStreak > v.persistent.stats.bestStreak) {
      v.persistent.stats.bestStreak = v.persistent.stats.currentStreak;
    }
  }

  incrementDeathCounter(): void {
    if (!v.run.shouldIncrementDeathCounter) {
      v.run.shouldIncrementDeathCounter = true;
      return;
    }

    v.persistent.stats.numDeaths++;
    v.persistent.stats.currentStreak = 0;
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, undefined)
  postGameStartedReordered(): void {
    if (this.isModsWithItemsEnabled()) {
      v.persistent.stats.usedMods = true;
    }
  }

  isModsWithItemsEnabled(): boolean {
    const numCustomCardTypes = Object.keys(CardTypeCustom).length;
    return (
      mod.getLastCollectibleType() !== LAST_VANILLA_COLLECTIBLE_TYPE ||
      mod.getLastTrinketType() !== LAST_VANILLA_TRINKET_TYPE ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      mod.getLastCardType() !== LAST_VANILLA_CARD_TYPE + numCustomCardTypes ||
      mod.getLastPillEffect() !== LAST_VANILLA_PILL_EFFECT
    );
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, true)
  postGameStartedReorderedTrue(): void {
    print("Illegal save and quit detected.");
    v.persistent.stats.usedSaveAndQuit = true;
  }
}

export function writeStatsToFile(): void {
  rebirthItemTrackerWriteToFile(
    `
- Run number: ${v.persistent.stats.numCompletedRuns + 1}
- Deaths/resets: ${v.persistent.stats.numDeaths}
- Objectives: ${getNumCompletedObjectives()} / ${ALL_OBJECTIVES.length}
- Current streak: ${v.persistent.stats.currentStreak}
- Best streak: ${v.persistent.stats.bestStreak}
`.trimStart(),
  );
}

export function resetStats(): void {
  v.persistent.stats = new PlaythroughStats();

  if (isGenerationCheatsEnabled()) {
    v.persistent.stats.generatedWithCheat = true;
  }
}

export function preForcedRestart(): void {
  v.run.shouldIncrementTime = false;
  v.run.shouldIncrementCompletedRunsCounter = false;
  v.run.shouldIncrementDeathCounter = false;
}

export function getPlaythroughNumCompletedRuns(): int {
  return v.persistent.stats.numCompletedRuns;
}

export function getPlaythroughNumDeaths(): int {
  return v.persistent.stats.numDeaths;
}

export function getPlaythroughSecondsElapsed(): int {
  const gameFrameCount = game.GetFrameCount();
  const totalFrames = v.persistent.stats.gameFramesElapsed + gameFrameCount;

  return totalFrames / GAME_FRAMES_PER_SECOND;
}

export function getPlaythroughTimeElapsed(): string {
  const seconds = getPlaythroughSecondsElapsed();
  const timerValues = convertSecondsToTimerValues(seconds);
  if (timerValues === undefined) {
    return "unknown";
  }

  const { hour1, hour2, hour3, minute1, minute2, second1, second2 } =
    timerValues;

  if (hour1 > 0) {
    return `${hour1}${hour2}${hour3}:${minute1}${minute2}:${second1}${second2}`;
  }

  if (hour2 > 0) {
    return `${hour2}${hour3}:${minute1}${minute2}:${second1}${second2}`;
  }

  if (hour3 > 0) {
    return `${hour3}:${minute1}${minute2}:${second1}${second2}`;
  }

  return `${minute1}${minute2}:${second1}${second2}`;
}

export function getRandomizerRunSeedString(): string | undefined {
  const seed = getRandomizerSeed();
  if (seed === undefined) {
    return undefined;
  }

  const rng = newRNG(seed);
  repeat(v.persistent.stats.numCompletedRuns, () => {
    rng.Next();
  });

  const startSeed = rng.GetSeed();
  return Seeds.Seed2String(startSeed);
}

export function hasIllegalPause(): boolean {
  return v.persistent.stats.usedIllegalPause;
}

export function hasSavedAndQuit(): boolean {
  return v.persistent.stats.usedSaveAndQuit;
}

export function hasDoubleUnlocked(): boolean {
  return v.persistent.stats.doubleUnlocked;
}

export function setDoubleUnlocked(): void {
  v.persistent.stats.doubleUnlocked = true;
}

export function hasUsedMods(): boolean {
  return v.persistent.stats.usedMods;
}

export function hasGeneratedWithCheat(): boolean {
  return v.persistent.stats.generatedWithCheat;
}
