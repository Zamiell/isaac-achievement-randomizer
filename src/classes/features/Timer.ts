import { ModCallback } from "isaac-typescript-definitions";
import { Callback, getBossID } from "isaacscript-common";
import { NUM_MINUTES_FOR_BOSS_OBJECTIVE } from "../../constants";
import { isTimerEnabled } from "../../deadSeaScrolls";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
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
    const totalSeconds = NUM_MINUTES_FOR_BOSS_OBJECTIVE * 60;
    const secondsRemaining = totalSeconds - seconds;
    timerDraw(TimerType.NO_HIT, secondsRemaining);
  }
}
