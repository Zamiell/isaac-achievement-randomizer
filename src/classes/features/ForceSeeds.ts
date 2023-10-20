import { CallbackPriority } from "isaac-typescript-definitions";
import {
  ModCallbackCustom,
  PriorityCallbackCustom,
  game,
  log,
  onAnyChallenge,
  setRunSeed,
} from "isaacscript-common";
import { DEBUG } from "../../constants";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getPlaythroughNumCompletedRuns,
  getRandomizerRunSeedString,
  preForcedRestart,
} from "./StatsTracker";
import { getRandomizerSeed } from "./achievementTracker/v";

export class ForceSeeds extends RandomizerModFeature {
  /** We want all of the other `POST_GAME_STARTED_REORDERED` callbacks to happen first. */
  @PriorityCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    CallbackPriority.LATE,
    false,
  )
  postGameStartedReorderedFalse(): void {
    // Unfortunately, we cannot play on set seeds inside of challenges.
    if (onAnyChallenge()) {
      return;
    }

    const seed = getRandomizerSeed();
    if (seed === undefined) {
      return;
    }

    const seeds = game.GetSeeds();
    const oldStartSeedString = seeds.GetStartSeedString();
    const newStartSeedString = getRandomizerRunSeedString();

    if (
      newStartSeedString !== undefined &&
      oldStartSeedString !== newStartSeedString &&
      !DEBUG
    ) {
      const numRuns = getPlaythroughNumCompletedRuns();
      log(`Incorrect seed for run #${numRuns}: ${oldStartSeedString}`);

      mod.runNextRenderFrame(() => {
        preForcedRestart();
        setRunSeed(newStartSeedString);
      });
    }
  }
}
