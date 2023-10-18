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
  PriorityCallbackCustom,
  game,
  isActionPressedOnAnyInput,
  isRoomDangerous,
  log,
  logError,
  newRNG,
  onChallenge,
  repeat,
} from "isaacscript-common";
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
      isRoomDangerous() &&
      isActionPressedOnAnyInput(
        ButtonAction.PAUSE, // 12
        ButtonAction.CONSOLE, // 28
      )
    ) {
      logError("Illegal pause detected.");
      v.persistent.stats.usedIllegalPause = true;
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
    logError("Illegal save and quit detected.");
    v.persistent.stats.usedSaveAndQuit = true;
  }

  /** TODO: Delete this when the beta ends. */
  @PriorityCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON,
    false,
  )
  postGameStartedReorderedFalse(): void {
    for (const key of Object.keys(v.persistent.stats)) {
      // @ts-expect-error Backwards compatibility.
      if (v.persistent[key] !== undefined) {
        // @ts-expect-error Backwards compatibility.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const oldValue = v.persistent[key];

        // @ts-expect-error Backwards compatibility.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        v.persistent.stats[key] = v.persistent[key];
        // @ts-expect-error Backwards compatibility.
        v.persistent[key] = undefined;

        log(`Reshuffled persistent stats key: ${key} --> ${oldValue}`);
      }
    }
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

  const { hour1, hour2, minute1, minute2, second1, second2 } = timerValues;
  return `${hour1}${hour2}:${minute1}${minute2}:${second1}${second2}`;
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
