import type { CollectibleType } from "isaac-typescript-definitions";
import {
  Difficulty,
  ModCallback,
  PlayerType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  KColorDefault,
  ModCallbackCustom,
  ReadonlySet,
  VectorZero,
  assertDefined,
  clearChallenge,
  copyArray,
  fonts,
  game,
  getCharacterName,
  getCollectibleName,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  isEven,
  log,
  logError,
  newRNG,
  newSprite,
  onAnyChallenge,
  restart,
  setRunSeed,
} from "isaacscript-common";
import { getAchievementsForRNG } from "../../achievementAssignment";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import { UnlockType } from "../../enums/UnlockType";
import { ALL_OBJECTIVES } from "../../objectives";
import type { Objective } from "../../types/Objective";
import { getObjectiveFromID, getObjectiveText } from "../../types/Objective";
import { getObjectiveID } from "../../types/ObjectiveID";
import { getUnlockText } from "../../types/Unlock";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { preForcedRestart, resetStats } from "./StatsTracker";
import { addObjective } from "./achievementTracker/addObjective";
import { isObjectiveCompleted } from "./achievementTracker/completedObjectives";
import { v } from "./achievementTracker/v";
import { isAchievementsBeatable } from "./achievementTracker/validateAchievements";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;
const STARTING_CHARACTER = PlayerType.ISAAC;

let generatingRNG: RNG | undefined;
let numGenerationAttempts = 0;

export class AchievementTracker extends RandomizerModFeature {
  v = v;

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

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    v.persistent.completedUnlocksForRun = copyArray(
      v.persistent.completedUnlocks,
    );
  }
}

// --------------
// Core functions
// --------------

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

// ---------------
// Debug functions
// ---------------

/** Only used for debugging. */
export function setCharacterUnlocked(character: PlayerType): void {
  const objective = findObjectiveForCharacterUnlock(character);
  if (objective === undefined) {
    const characterName = getCharacterName(character);
    error(`Failed to find the objective to unlock character: ${characterName}`);
  }

  addObjective(objective);
}

function findObjectiveForCharacterUnlock(
  character: PlayerType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.CHARACTER &&
      unlock.character === character
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setCollectibleUnlocked(collectibleType: CollectibleType): void {
  const objective = findObjectiveForCollectibleUnlock(collectibleType);
  if (objective === undefined) {
    const collectibleName = getCollectibleName(collectibleType);
    error(
      `Failed to find the objective to unlock character: ${collectibleName}`,
    );
  }

  addObjective(objective);
}

function findObjectiveForCollectibleUnlock(
  collectibleType: CollectibleType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;
    if (
      unlock.type === UnlockType.COLLECTIBLE &&
      unlock.collectibleType === collectibleType
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

// -------
// Logging
// -------

export function logSpoilerLog(): void {
  if (v.persistent.seed === null) {
    logError("The randomizer is not active, so you cannot make a spoiler log.");
    return;
  }

  const line = "-".repeat(40);

  log(line, false);
  log(`Spoiler log for randomizer seed: ${v.persistent.seed}`, false);
  log(line, false);

  for (const [i, objective] of ALL_OBJECTIVES.entries()) {
    const objectiveID = getObjectiveID(objective);

    const unlock = v.persistent.objectiveToUnlockMap.get(objectiveID);
    assertDefined(
      unlock,
      `Failed to get the unlock corresponding to objective ID: ${objectiveID}`,
    );

    const completed = isObjectiveCompleted(objective);
    const completedText = completed ? "[C]" : "[X]";
    const objectiveText = getObjectiveText(objective).join(" ");
    const unlockText = getUnlockText(unlock).join(" - ");

    log(`${i + 1}) ${completedText} ${objectiveText} --> ${unlockText}`, false);
  }

  log(line, false);
}

function _logMissingObjectives() {
  log("Missing objectives:");

  const completedObjectiveIDs = v.persistent.completedObjectives.map(
    (objective) => getObjectiveID(objective),
  );
  const completedObjectiveIDsSet = new ReadonlySet(completedObjectiveIDs);

  const missingObjectives = ALL_OBJECTIVES.filter((objective) => {
    const objectiveID = getObjectiveID(objective);
    return !completedObjectiveIDsSet.has(objectiveID);
  });

  for (const [i, objective] of missingObjectives.entries()) {
    const objectiveText = getObjectiveText(objective).join(" ");
    log(`${i + 1}) ${objectiveText}`);
  }
}
