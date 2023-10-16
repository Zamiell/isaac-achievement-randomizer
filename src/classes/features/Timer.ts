import { ModCallback } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { isTimerEnabled } from "../../config";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
import { getNumSecondsForBossObjective } from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getModifiedBossID,
  getSecondsSinceLastDamage,
} from "./ObjectiveDetection";
import { getPlaythroughSecondsElapsed } from "./StatsTracker";

export class Timer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.drawMainTimer();
    this.drawNoHitTimer();
  }

  drawMainTimer(): void {
    if (isTimerEnabled()) {
      const seconds = getPlaythroughSecondsElapsed();
      timerDraw(TimerType.MAIN, seconds);
    }
  }

  drawNoHitTimer(): void {
    const bossID = getModifiedBossID();
    if (bossID === undefined) {
      return;
    }

    const seconds = getSecondsSinceLastDamage();
    if (seconds === undefined) {
      return;
    }

    const numSecondsForBossObjective = getNumSecondsForBossObjective(bossID);
    const secondsRemaining = numSecondsForBossObjective - seconds;
    timerDraw(TimerType.NO_HIT, secondsRemaining);
  }
}
