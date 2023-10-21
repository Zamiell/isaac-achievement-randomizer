import { ModCallback } from "isaac-typescript-definitions";
import { Callback, ModFeature } from "isaacscript-common";
import { getModifiedBossID } from "../../enums/BossIDCustom";
import { TimerType } from "../../enums/TimerType";
import { timerDraw } from "../../timer";
import { getNumSecondsForBossObjective } from "../../types/Objective";
import { getSecondsSinceLastDamage } from "./BossNoHitObjectiveDetection";
import { getPlaythroughSecondsElapsed } from "./StatsTracker";

// TODO: RANDOMIZER MOD FEATURE
export class Timer extends ModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.drawMainTimer();
    this.drawNoHitTimer();
  }

  drawMainTimer(): void {
    // if (isTimerEnabled()) {
    const seconds = getPlaythroughSecondsElapsed();
    timerDraw(TimerType.MAIN, seconds);
    // }
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
