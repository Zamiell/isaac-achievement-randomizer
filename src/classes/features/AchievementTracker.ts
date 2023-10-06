import type { CollectibleType } from "isaac-typescript-definitions";
import {
  BossID,
  Difficulty,
  LevelStage,
  ModCallback,
  PlayerType,
  StageType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  KColorDefault,
  MAIN_CHARACTERS,
  ModCallbackCustom,
  ModFeature,
  ReadonlySet,
  VectorZero,
  addSetsToSet,
  assertDefined,
  clearChallenge,
  copyArray,
  fonts,
  game,
  getBossSet,
  getCharacterName,
  getCollectibleName,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  isEven,
  isRepentanceStage,
  isStoryBossID,
  log,
  logError,
  newRNG,
  newSprite,
  onAnyChallenge,
  restart,
  setRunSeed,
} from "isaacscript-common";
import { getAchievementsForRNG } from "../../achievementAssignment";
import { CHARACTER_OBJECTIVE_KINDS, STAGE_TYPES } from "../../cachedEnums";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import { UnlockType } from "../../enums/UnlockType";
import {
  UnlockablePath,
  getUnlockablePathFromCharacterObjectiveKind,
  getUnlockablePathFromStoryBoss,
} from "../../enums/UnlockablePath";
import { ALL_OBJECTIVES, NO_HIT_BOSSES } from "../../objectives";
import type { Objective } from "../../types/Objective";
import {
  getObjective,
  getObjectiveFromID,
  getObjectiveText,
} from "../../types/Objective";
import { getObjectiveID } from "../../types/ObjectiveID";
import type { Unlock } from "../../types/Unlock";
import { getUnlockText } from "../../types/Unlock";
import { getUnlockID } from "../../types/UnlockID";
import { UNLOCKABLE_CHALLENGES } from "../../unlockableChallenges";
import { ALL_UNLOCKS } from "../../unlocks";
import { showNewUnlock } from "./AchievementNotification";
import { preForcedRestart, resetStats } from "./StatsTracker";
import {
  isBossObjectiveCompleted,
  isChallengeObjectiveCompleted,
  isCharacterObjectiveCompleted,
} from "./achievementTracker/completedObjectives";
import {
  isChallengeUnlocked,
  isCharacterUnlocked,
  isPathUnlocked,
  isStageTypeUnlocked,
} from "./achievementTracker/completedUnlocks";
import { checkSwapProblematicAchievement } from "./achievementTracker/swapAchievement";
import { isRandomizerEnabled, v } from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;
const STARTING_CHARACTER = PlayerType.ISAAC;

const BOSS_STAGES = [
  LevelStage.BASEMENT_1,
  LevelStage.CAVES_1,
  LevelStage.DEPTHS_1,
  LevelStage.WOMB_1,
] as const;

let generatingRNG: RNG | undefined;
let numGenerationAttempts = 0;

/** This does not extend from `RandomizerModFeature` to avoid a dependency cycle. */
export class AchievementTracker extends ModFeature {
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
    if (!isRandomizerEnabled()) {
      return;
    }

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

export function getCompletedObjectives(): Objective[] {
  return v.persistent.completedObjectives;
}

export function getCompletedUnlocks(): Unlock[] {
  return v.persistent.completedUnlocks;
}

export function getNumCompletedUnlocks(): int {
  return v.persistent.completedUnlocks.length;
}

// -------------
// Add functions
// -------------

export function addObjective(objective: Objective, emulating = false): void {
  if (hasErrors()) {
    return;
  }

  // Prevent accomplishing non-challenge objectives while inside of a challenge.
  if (
    !emulating &&
    ((!onAnyChallenge() && objective.type === ObjectiveType.CHALLENGE) ||
      (onAnyChallenge() && objective.type !== ObjectiveType.CHALLENGE))
  ) {
    return;
  }

  if (isObjectiveCompleted(objective)) {
    return;
  }

  v.persistent.completedObjectives.push(objective);

  const objectiveID = getObjectiveID(objective);
  const unlock = v.persistent.objectiveToUnlockMap.get(objectiveID);
  assertDefined(
    unlock,
    `Failed to get the unlock corresponding to objective ID: ${objectiveID}`,
  );

  let originalUnlock = unlock;
  let swappedUnlock = unlock;
  do {
    originalUnlock = swappedUnlock;

    if (!emulating) {
      const unlockText = getUnlockText(originalUnlock).join(" - ");
      log(`Checking unlock swap for: ${unlockText}`);
    }

    swappedUnlock = checkSwapProblematicAchievement(
      originalUnlock,
      objectiveID,
    );

    if (!emulating) {
      const unlockText = getUnlockText(swappedUnlock).join(" - ");
      log(`Swapped unlock is: ${unlockText}`);
    }
  } while (getUnlockID(originalUnlock) !== getUnlockID(swappedUnlock));

  v.persistent.completedUnlocks.push(swappedUnlock);

  if (!emulating) {
    const unlockText = getUnlockText(originalUnlock).join(" - ");
    log(`Granted unlock: ${unlockText}`);
  }

  if (emulating) {
    v.persistent.completedUnlocksForRun.push(swappedUnlock);
  } else {
    showNewUnlock(swappedUnlock);
  }
}

function isObjectiveCompleted(objectiveToMatch: Objective): boolean {
  switch (objectiveToMatch.type) {
    case ObjectiveType.CHARACTER: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.character === objectiveToMatch.character &&
          objective.kind === objectiveToMatch.kind,
      );
    }

    case ObjectiveType.BOSS: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.bossID === objectiveToMatch.bossID,
      );
    }

    case ObjectiveType.CHALLENGE: {
      return v.persistent.completedObjectives.some(
        (objective) =>
          objective.type === objectiveToMatch.type &&
          objective.challenge === objectiveToMatch.challenge,
      );
    }
  }
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

// ----------
// Validation
// ----------

/** Emulate a player playing through this randomizer seed to see if every objective is possible. */
function isAchievementsBeatable(): boolean {
  v.persistent.completedUnlocks = [];
  v.persistent.completedObjectives = [];

  while (v.persistent.completedUnlocks.length < ALL_UNLOCKS.length) {
    let unlockedSomething = false;

    for (const character of MAIN_CHARACTERS) {
      if (!isCharacterUnlocked(character)) {
        continue;
      }

      for (const kind of CHARACTER_OBJECTIVE_KINDS) {
        if (
          canGetToCharacterObjectiveKind(kind, false) &&
          !isCharacterObjectiveCompleted(character, kind)
        ) {
          const objective = getObjective(
            ObjectiveType.CHARACTER,
            character,
            kind,
          );
          addObjective(objective, true);
          unlockedSomething = true;
        }
      }
    }

    const reachableNonStoryBossesSet = getReachableNonStoryBossesSet();

    for (const bossID of NO_HIT_BOSSES) {
      if (
        canGetToBoss(bossID, reachableNonStoryBossesSet, false) &&
        !isBossObjectiveCompleted(bossID)
      ) {
        const objective = getObjective(ObjectiveType.BOSS, bossID);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    for (const challenge of UNLOCKABLE_CHALLENGES) {
      if (
        isChallengeUnlocked(challenge, false) &&
        !isChallengeObjectiveCompleted(challenge)
      ) {
        const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    if (!unlockedSomething) {
      log(
        `Failed to emulate beating seed ${v.persistent.seed}: ${v.persistent.completedUnlocks.length} / ${ALL_UNLOCKS.length}`,
      );
      // logMissingObjectives();

      return false;
    }
  }

  return true;
}

export function canGetToCharacterObjectiveKind(
  kind: CharacterObjectiveKind,
  forRun = true,
): boolean {
  // Handle special cases that require two or more unlockable paths.
  if (kind === CharacterObjectiveKind.DELIRIUM) {
    return (
      isPathUnlocked(UnlockablePath.BLUE_WOMB, forRun) &&
      isPathUnlocked(UnlockablePath.VOID, forRun)
    );
  }

  if (kind === CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST) {
    return (
      isPathUnlocked(UnlockablePath.CHEST, forRun) ||
      isPathUnlocked(UnlockablePath.DARK_ROOM, forRun)
    );
  }

  const unlockablePath = getUnlockablePathFromCharacterObjectiveKind(kind);
  if (unlockablePath === undefined) {
    return true;
  }

  return isPathUnlocked(unlockablePath, forRun);
}

export function getReachableNonStoryBossesSet(): Set<BossID> {
  const reachableNonStoryBossesSet = new Set<BossID>();

  for (const stage of BOSS_STAGES) {
    for (const stageType of STAGE_TYPES) {
      if (stageType === StageType.GREED_MODE) {
        continue;
      }

      if (!isStageTypeUnlocked(stage, stageType)) {
        continue;
      }

      if (
        isRepentanceStage(stageType) &&
        !isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS)
      ) {
        continue;
      }

      const bossSet = getBossSet(stage, stageType);
      if (bossSet === undefined) {
        continue;
      }

      addSetsToSet(reachableNonStoryBossesSet, bossSet);
    }
  }

  return reachableNonStoryBossesSet;
}

export function canGetToBoss(
  bossID: BossID,
  reachableBossesSet: Set<BossID>,
  forRun = true,
): boolean {
  if (!isStoryBossID(bossID)) {
    return reachableBossesSet.has(bossID);
  }

  // Handle the special case of Delirium, which requires two separate paths to be unlocked. (Since
  // the mod manually removes void portals, getting to Delirium requires going through Blue Womb.)
  if (bossID === BossID.DELIRIUM) {
    return (
      isPathUnlocked(UnlockablePath.BLUE_WOMB, forRun) &&
      isPathUnlocked(UnlockablePath.VOID, forRun)
    );
  }

  const unlockablePath = getUnlockablePathFromStoryBoss(bossID);
  if (unlockablePath === undefined) {
    return true;
  }

  return isPathUnlocked(unlockablePath, forRun);
}

// -------
// Logging
// -------

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
