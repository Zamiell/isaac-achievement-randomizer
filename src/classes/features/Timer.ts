import { ModCallback } from "isaac-typescript-definitions";
import { Callback, game } from "isaacscript-common";
import { isTimerEnabled } from "../../deadSeaScrolls";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getSecondsSinceLastDamage } from "./AchievementDetection";
import {
  getSecondsElapsed,
  isBossObjectiveCompleted,
} from "./AchievementTracker";

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
    const room = game.GetRoom();
    const bossID = room.GetBossID();
    if (bossID === 0) {
      return;
    }

    if (isBossObjectiveCompleted(bossID)) {
      return;
    }

    const seconds = getSecondsSinceLastDamage();
    timerDraw(TimerType.NO_HIT, seconds);
  }
}
