import { ModCallback } from "isaac-typescript-definitions";
import { Callback, getBossID } from "isaacscript-common";
import { isTimerEnabled } from "../../deadSeaScrolls";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
import { getNumMinutesForBossObjective } from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getSecondsElapsed,
  isBossObjectiveCompleted,
} from "./AchievementTracker";
import { getSecondsSinceLastDamage } from "./ObjectiveDetection";

export class Timer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.drawMainTimer();
    this.drawNoHitTimer();
  }

  drawMainTimer(): void {
    if (isTimerEnabled()) {
      const seconds = getSecondsElapsed();
      timerDraw(TimerType.MAIN, seconds);
    }
  }

  drawNoHitTimer(): void {
    const bossID = getBossID();
    if (bossID === 0) {
      return;
    }

    if (isBossObjectiveCompleted(bossID)) {
      return;
    }

    const seconds = getSecondsSinceLastDamage();
    const numMinutesForBossObjective = getNumMinutesForBossObjective(bossID);
    const totalSeconds = numMinutesForBossObjective * 60;
    const secondsRemaining = totalSeconds - seconds;
    timerDraw(TimerType.NO_HIT, secondsRemaining);
  }
}
