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
  ModCallbackCustom,
  ModFeature,
  PriorityCallback,
  RENDER_FRAMES_PER_SECOND,
  game,
  isActionPressedOnAnyInput,
  isAfterRenderFrame,
  isRoomDangerous,
  newRNG,
  onChallenge,
  repeat,
} from "isaacscript-common";
import { isPreventPauseEnabled } from "../../config";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { convertSecondsToTimerValues } from "../../timer";
import { getRandomizerSeed, isRandomizerEnabled } from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

/** `isaacscript-common` uses `CallbackPriority.IMPORTANT` (-200). */
const HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON = (CallbackPriority.IMPORTANT -
  1) as CallbackPriority;

class PlaythroughStats {
  numCompletedRuns = 0;
  numDeaths = 0;
  gameFramesElapsed = 0;
  usedIllegalPause = false;
  usedSaveAndQuit = false;
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
      isRoomDangerous() &&
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
  }

  incrementDeathCounter(): void {
    if (!v.run.shouldIncrementDeathCounter) {
      v.run.shouldIncrementDeathCounter = true;
      return;
    }

    v.persistent.stats.numDeaths++;
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, true)
  postGameStartedReorderedTrue(): void {
    print("Illegal save and quit detected.");
    v.persistent.stats.usedSaveAndQuit = true;
  }
}

export function resetStats(): void {
  v.persistent.stats = new PlaythroughStats();
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
