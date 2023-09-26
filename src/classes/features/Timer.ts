import { ModCallback } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { isTimerEnabled } from "../../deadSeaScrolls";
import { timerDraw } from "../../timer";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getSecondsElapsed } from "./AchievementTracker";

export class Timer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    if (isTimerEnabled()) {
      const seconds = getSecondsElapsed();
      timerDraw(seconds);
    }
  }
}
