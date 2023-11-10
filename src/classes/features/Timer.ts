import { ModCallback } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { isTimerEnabled } from "../../config";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getPlaythroughSecondsElapsed } from "./StatsTracker";

export class Timer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.drawMainTimer();
  }

  drawMainTimer(): void {
    if (isTimerEnabled()) {
      const seconds = getPlaythroughSecondsElapsed();
      timerDraw(TimerType.MAIN, seconds);
    }
  }
}
