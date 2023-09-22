import { ModCallback } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { timerDraw } from "../../timer";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getSecondsElapsed } from "./AchievementTracker";

export class Timer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    // TODO: use option and early return

    const seconds = getSecondsElapsed();
    timerDraw(seconds);
  }
}
