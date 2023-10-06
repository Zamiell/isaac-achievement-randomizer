import { CallbackPriority } from "isaac-typescript-definitions";
import {
  ModCallbackCustom,
  PriorityCallbackCustom,
  game,
  log,
  newRNG,
  repeat,
} from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getRandomizerSeed } from "./AchievementTracker";
import { getPlaythroughNumCompletedRuns } from "./StatsTracker";

export class ForceSeeds extends RandomizerModFeature {
  /** We want all of the other `POST_GAME_STARTED_REORDERED` callbacks to happen first. */
  @PriorityCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    CallbackPriority.LATE,
    false,
  )
  postGameStartedReorderedFalse(): void {
    const seed = getRandomizerSeed();
    if (seed === undefined) {
      return;
    }

    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();

    const rng = newRNG(seed);
    const num = getPlaythroughNumCompletedRuns();
    repeat(num, () => {
      rng.Next();
    });

    const forcedStartSeed = rng.GetSeed();
    if (startSeed === forcedStartSeed) {
      return;
    }

    const oldStartSeedString = seeds.GetStartSeedString();
    const newStartSeedString = Seeds.Seed2String(forcedStartSeed);

    log(`Incorrect seed: ${oldStartSeedString}`);
    log(`Going to seed: ${newStartSeedString}`);

    mod.runNextRenderFrame(() => {
      Isaac.ExecuteCommand(`seed ${newStartSeedString}`);
    });
  }
}
