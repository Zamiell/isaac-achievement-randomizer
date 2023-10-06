import { Difficulty, ModCallback } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  VectorZero,
  clearChallenge,
  fonts,
  game,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  isEven,
  log,
  newRNG,
  newSprite,
  onAnyChallenge,
  restart,
  setRunSeed,
} from "isaacscript-common";
import { getAchievementsForRNG } from "../../achievementAssignment";
import { STARTING_CHARACTER } from "../../constants";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { preForcedRestart, resetStats } from "./StatsTracker";
import { v } from "./achievementTracker/v";
import { isAchievementsBeatable } from "./achievementTracker/validateAchievements";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;

let generatingRNG: RNG | undefined;
let numGenerationAttempts = 0;

export class AchievementRandomizer extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.checkDrawBlackScreen();
    this.checkGenerate();
  }

  checkDrawBlackScreen(): void {
    if (generatingRNG === undefined) {
      return;
    }

    BLACK_SPRITE.Render(VectorZero);

    const screenCenterPos = getScreenCenterPos();
    const screenBottomRightPos = getScreenBottomRightPos();
    const rightX = screenBottomRightPos.X;

    const text1 = "Randomizing, please wait...";
    const aboveCenterY = screenCenterPos.Y - 10;
    FONT.DrawString(text1, 0, aboveCenterY, KColorDefault, rightX, true);

    // - `numGenerationAttempts` starts at -1, so we normalize it to 1.
    // - Additionally, it is rendered before it is incremented, so we have to add one.
    const numAttempts = Math.max(numGenerationAttempts + 1, 1);
    const text2 = `(attempt #${numAttempts})`;
    const belowCenterY = screenCenterPos.Y + 10;
    FONT.DrawString(text2, 0, belowCenterY, KColorDefault, rightX, true);
  }

  checkGenerate(): void {
    if (generatingRNG === undefined || v.persistent.seed === null) {
      return;
    }

    // Only attempt to generate on odd render frames. Otherwise, the text will not consistently be
    // drawn on top of the black sprite due to lag.
    const renderFrameCount = Isaac.GetFrameCount();
    if (isEven(renderFrameCount)) {
      return;
    }

    numGenerationAttempts++;

    // Allow a render frame to pass before doing the first generation attempt so that the black
    // sprite is drawn to the screen.
    if (numGenerationAttempts === 0) {
      return;
    }

    v.persistent.objectiveToUnlockMap = getAchievementsForRNG(generatingRNG);
    log(
      `Checking to see if randomizer seed ${v.persistent.seed} is beatable. Attempt: #${numGenerationAttempts}`,
    );

    if (!isAchievementsBeatable()) {
      // Try again on the next render frame.
      return;
    }

    generatingRNG = undefined;

    // Reset the persistent variable relating to our playthrough.
    v.persistent.completedUnlocks = [];
    v.persistent.completedObjectives = [];
    resetStats();
    preForcedRestart();

    const rng = newRNG(v.persistent.seed);
    const startSeed = rng.GetSeed();

    clearChallenge();
    restart(STARTING_CHARACTER);
    setRunSeed(startSeed);
  }
}

export function isValidSituationForStartingRandomizer(): boolean {
  return game.Difficulty === Difficulty.HARD && !onAnyChallenge();
}

export function startRandomizer(
  _randomizerMode: RandomizerMode,
  seed: Seed | undefined,
): void {
  if (seed === undefined) {
    seed = getRandomSeed();
  }

  v.persistent.seed = seed;
  log(`Set new randomizer seed: ${v.persistent.seed}`);

  generatingRNG = newRNG(v.persistent.seed);
  numGenerationAttempts = -1;

  const hud = game.GetHUD();
  hud.SetVisible(false);

  // We will start generating achievements on the next render frame.
}

export function endRandomizer(): void {
  v.persistent.seed = null;
  // (We only clear the other persistent variables when a new randomizer is initialized.)

  restart(STARTING_CHARACTER);
}
