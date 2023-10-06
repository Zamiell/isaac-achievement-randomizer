import { CallbackPriority, ModCallback } from "isaac-typescript-definitions";
import {
  Callback,
  GAME_FRAMES_PER_SECOND,
  ModFeature,
  PriorityCallback,
  game,
  onChallenge,
} from "isaacscript-common";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { convertSecondsToTimerValues } from "../../timer";
import { isRandomizerEnabled } from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

/** `isaacscript-common` uses `CallbackPriority.IMPORTANT` (-200). */
const HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON = (CallbackPriority.IMPORTANT -
  1) as CallbackPriority;

const v = {
  persistent: {
    numCompletedRuns: 0,
    numDeaths: 0,
    gameFramesElapsed: 0,
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

    v.persistent.gameFramesElapsed += game.GetFrameCount();
  }

  incrementCompletedRunsCounter(): void {
    if (!v.run.shouldIncrementCompletedRunsCounter) {
      v.run.shouldIncrementCompletedRunsCounter = true;
      return;
    }

    v.persistent.numCompletedRuns++;
  }

  incrementDeathCounter(): void {
    if (!v.run.shouldIncrementDeathCounter) {
      v.run.shouldIncrementDeathCounter = true;
      return;
    }

    v.persistent.numDeaths++;
  }
}

export function resetStats(): void {
  v.persistent.numCompletedRuns = 0;
  v.persistent.numDeaths = 0;
  v.persistent.gameFramesElapsed = 0;
}

export function preForcedRestart(): void {
  v.run.shouldIncrementTime = false;
  v.run.shouldIncrementCompletedRunsCounter = false;
  v.run.shouldIncrementDeathCounter = false;
}

export function getPlaythroughNumCompletedRuns(): int {
  return v.persistent.numCompletedRuns;
}

export function getPlaythroughNumDeaths(): int {
  return v.persistent.numDeaths;
}

export function getPlaythroughSecondsElapsed(): int {
  const gameFrameCount = game.GetFrameCount();
  const totalFrames = v.persistent.gameFramesElapsed + gameFrameCount;

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
