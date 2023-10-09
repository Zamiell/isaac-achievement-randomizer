import {
  BossID,
  Difficulty,
  LevelStage,
  ModCallback,
  StageType,
} from "isaac-typescript-definitions";
import {
  Callback,
  GAME_FRAMES_PER_SECOND,
  KColorDefault,
  MAIN_CHARACTERS,
  ReadonlySet,
  VectorZero,
  addSetsToSet,
  clearChallenge,
  fonts,
  game,
  getBossSet,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  isBeforeRenderFrame,
  isRepentanceStage,
  isStoryBossID,
  log,
  newRNG,
  newSprite,
  onAnyChallenge,
  restart,
  setRunSeed,
  setUnseeded,
} from "isaacscript-common";
import { getAchievementsForRNG } from "../../achievementAssignment";
import { ALL_OBJECTIVES, NO_HIT_BOSSES } from "../../arrays/objectives";
import { UNLOCKABLE_CHALLENGES } from "../../arrays/unlockableChallenges";
import { ALL_UNLOCKS } from "../../arrays/unlocks";
import { CHARACTER_OBJECTIVE_KINDS, STAGE_TYPES } from "../../cachedEnums";
import { STARTING_CHARACTER } from "../../constants";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import {
  UnlockablePath,
  getUnlockablePathFromCharacterObjectiveKind,
  getUnlockablePathFromStoryBoss,
} from "../../enums/UnlockablePath";
import { getObjective, getObjectiveText } from "../../types/Objective";
import { getObjectiveID } from "../../types/ObjectiveID";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { preForcedRestart, resetStats } from "./StatsTracker";
import { addObjective } from "./achievementTracker/addObjective";
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
import { v } from "./achievementTracker/v";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;

const BOSS_STAGES = [
  LevelStage.BASEMENT_1,
  LevelStage.CAVES_1,
  LevelStage.DEPTHS_1,
  LevelStage.WOMB_1,
] as const;

let generatingRNG: RNG | undefined;
let renderFrameToTryGenerate: int | undefined;
let numGenerationAttempts = 0;

/**
 * This does the actual randomization after the player selects a starting seed for the playthrough
 * (and draws the black screen).
 */
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

    const text2 = `(attempt #${numGenerationAttempts})`;
    const belowCenterY = screenCenterPos.Y + 10;
    FONT.DrawString(text2, 0, belowCenterY, KColorDefault, rightX, true);
  }

  checkGenerate(): void {
    if (generatingRNG === undefined || v.persistent.seed === null) {
      return;
    }

    if (isBeforeRenderFrame(renderFrameToTryGenerate)) {
      return;
    }
    renderFrameToTryGenerate = undefined;

    v.persistent.objectiveToUnlockMap = getAchievementsForRNG(generatingRNG);
    log(
      `Checking to see if randomizer seed ${v.persistent.seed} is beatable. Attempt: #${numGenerationAttempts}`,
    );

    if (!isAchievementsBeatable()) {
      numGenerationAttempts++;

      const renderFrameCount = Isaac.GetFrameCount();
      renderFrameToTryGenerate = renderFrameCount + 2;

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

  const renderFrameCount = Isaac.GetFrameCount();

  generatingRNG = newRNG(v.persistent.seed);
  renderFrameToTryGenerate = renderFrameCount + 1;
  numGenerationAttempts = 1;

  const hud = game.GetHUD();
  hud.SetVisible(false);

  const player = Isaac.GetPlayer();
  player.AddControlsCooldown(GAME_FRAMES_PER_SECOND);
  player.Velocity = VectorZero;

  // We will start generating achievements on the next render frame.
}

export function endRandomizer(): void {
  v.persistent.seed = null;
  // (We only clear the other persistent variables when a new randomizer is initialized.)

  setUnseeded();
  restart(STARTING_CHARACTER);
}

/** Emulate a player playing through this randomizer seed to see if every objective is possible. */
function isAchievementsBeatable(): boolean {
  v.persistent.completedUnlocks = [];
  v.persistent.completedObjectives = [];

  while (v.persistent.completedUnlocks.length < ALL_UNLOCKS.length) {
    const unlockedSomething = tryUnlockEverythingReachable();
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

/** @returns Whether unlocking one or more things was successful. */
function tryUnlockEverythingReachable(): boolean {
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

  return unlockedSomething;
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
