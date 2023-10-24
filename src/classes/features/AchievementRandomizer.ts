import {
  BossID,
  CardType,
  CollectibleType,
  Difficulty,
  LevelStage,
  ModCallback,
  PlayerType,
  StageType,
} from "isaac-typescript-definitions";
import {
  Callback,
  GAME_FRAMES_PER_SECOND,
  KColorDefault,
  MAIN_CHARACTERS,
  VectorZero,
  addSetsToSet,
  assertDefined,
  clearChallenge,
  fonts,
  game,
  getBossName,
  getBossSet,
  getChallengeName,
  getCharacterName,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  getTime,
  isBeforeGameFrame,
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
import { version } from "../../../package.json";
import { getAchievementsForRNG } from "../../achievementAssignment";
import { ALL_OBJECTIVES } from "../../arrays/allObjectives";
import { STAGE_TYPES } from "../../cachedEnums";
import { DEBUG, STARTING_CHARACTER } from "../../constants";
import { BossIDCustom } from "../../enums/BossIDCustom";
import {
  CharacterObjectiveKind,
  getCharacterObjectiveKindName,
} from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import { UnlockType } from "../../enums/UnlockType";
import {
  UnlockableArea,
  getUnlockableAreaFromCharacterObjectiveKind,
  getUnlockableAreaFromStoryBoss,
} from "../../enums/UnlockableArea";
import type {
  BossObjective,
  ChallengeObjective,
  CharacterObjective,
  Objective,
} from "../../types/Objective";
import { getObjectiveFromID, getObjectiveText } from "../../types/Objective";
import { getUnlock } from "../../types/Unlock";
import { validateObjectivesUnlocksMatch } from "../../validate";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { preForcedRestart, resetStats } from "./StatsTracker";
import { addObjective } from "./achievementTracker/addObjective";
import { isObjectiveCompleted } from "./achievementTracker/completedObjectives";
import {
  isAreaUnlocked,
  isCardTypeUnlocked,
  isChallengeUnlocked,
  isCharacterUnlocked,
  isCollectibleTypeUnlocked,
} from "./achievementTracker/completedUnlocks";
import { findObjectiveIDForUnlock, v } from "./achievementTracker/v";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;

const BOSS_STAGES = [
  LevelStage.BASEMENT_1,
  LevelStage.CAVES_1,
  LevelStage.DEPTHS_1,
  LevelStage.WOMB_1,
] as const;

let generatingRNG: RNG | undefined;
let generationTime = 0;
let renderFrameToTryGenerate: int | undefined;
let renderFrameToTestSeed: int | undefined;
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
    this.checkTestSeed();
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
    const text1Y = screenCenterPos.Y - 30;
    FONT.DrawString(text1, 0, text1Y, KColorDefault, rightX, true);

    const text2 = `Attempt: #${numGenerationAttempts}`;
    const text2Y = screenCenterPos.Y - 10;
    FONT.DrawString(text2, 0, text2Y, KColorDefault, rightX, true);

    const text3 = `Confirmed objectives completable: ${v.persistent.completedObjectives.length} / ${ALL_OBJECTIVES.length}`;
    const text3Y = screenCenterPos.Y + 10;
    FONT.DrawString(text3, 0, text3Y, KColorDefault, rightX, true);

    const text4 = "(This could take a few minutes.)";
    const text4Y = screenCenterPos.Y + 30;
    FONT.DrawString(text4, 0, text4Y, KColorDefault, rightX, true);
  }

  checkGenerate(): void {
    if (generatingRNG === undefined || v.persistent.seed === null) {
      return;
    }

    if (isBeforeGameFrame(1)) {
      return;
    }

    if (
      renderFrameToTryGenerate === undefined ||
      isBeforeRenderFrame(renderFrameToTryGenerate)
    ) {
      return;
    }
    renderFrameToTryGenerate = undefined;

    v.persistent.objectiveToUnlockMap = getAchievementsForRNG(generatingRNG);
    log(
      `Generated achievements for randomizer seed: ${v.persistent.seed} (attempt #${numGenerationAttempts})`,
    );

    v.persistent.completedObjectives = [];
    v.persistent.completedUnlocks = [];

    generationTime = 0;
    renderFrameToTestSeed = Isaac.GetFrameCount();
  }

  checkTestSeed(): void {
    if (generatingRNG === undefined || v.persistent.seed === null) {
      return;
    }

    if (isBeforeGameFrame(1)) {
      return;
    }

    if (
      renderFrameToTestSeed === undefined ||
      isBeforeRenderFrame(renderFrameToTestSeed)
    ) {
      return;
    }
    renderFrameToTestSeed = undefined;

    const renderFrameCount = Isaac.GetFrameCount();

    const startTime = getTime(false);
    const accomplishedObjective = tryCompleteUncompletedObjectives();
    const finishTime = getTime(false);

    const elapsedTime = finishTime - startTime;
    generationTime += elapsedTime;

    if (!accomplishedObjective) {
      log(
        `Failed to emulate beating seed ${v.persistent.seed}: ${v.persistent.completedObjectives.length} / ${ALL_OBJECTIVES.length}. Milliseconds taken: ${generationTime}`,
      );

      logMissingObjectives();

      numGenerationAttempts++;
      renderFrameToTryGenerate = renderFrameCount + 1;

      // Clear out the objectives now so that the progress screen goes back to 0.
      v.persistent.completedObjectives = [];

      return;
    }

    if (v.persistent.completedObjectives.length < ALL_OBJECTIVES.length) {
      renderFrameToTestSeed = renderFrameCount + 1;
      return;
    }

    log(`Generation complete. Milliseconds taken: ${generationTime}`);

    generatingRNG = undefined;
    generationTime = 0;

    // Reset the persistent variable relating to our playthrough.
    v.persistent.completedObjectives = [];
    v.persistent.completedUnlocks = [];
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
  randomizerMode: RandomizerMode,
  seed: Seed | undefined,
): void {
  if (seed === undefined) {
    seed = getRandomSeed();
  }

  // First, verify that the amount of objectives and the amount of unlocks match.
  validateObjectivesUnlocksMatch();

  v.persistent.seed = seed;
  log(`Set new randomizer seed: ${v.persistent.seed}`);

  v.persistent.randomizerMode = randomizerMode;
  log(`Set new randomizer mode: ${v.persistent.randomizerMode}`);

  v.persistent.achievementsVersion = version;
  log(
    `Set new randomizer achievements version: ${v.persistent.achievementsVersion}`,
  );

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

const OBJECTIVE_ACCESS_FUNCTIONS = {
  [ObjectiveType.CHARACTER]: characterObjectiveFunc,
  [ObjectiveType.BOSS]: bossObjectiveFunc,
  [ObjectiveType.CHALLENGE]: challengeObjectiveFunc,
} as const satisfies Record<
  ObjectiveType,
  (objective: Objective, reachableNonStoryBossesSet: Set<BossID>) => boolean
>;

function characterObjectiveFunc(objective: Objective): boolean {
  const characterObjective = objective as CharacterObjective;

  // Ensure that helper items can be unlocked by a separate character.
  switch (characterObjective.character) {
    // 31
    case PlayerType.LOST_B: {
      if (!isCardTypeUnlocked(CardType.HOLY, false)) {
        return false;
      }

      break;
    }

    // 37
    case PlayerType.JACOB_B: {
      if (!isCollectibleTypeUnlocked(CollectibleType.ANIMA_SOLA, false)) {
        return false;
      }

      break;
    }

    default: {
      break;
    }
  }

  return canGetToCharacterObjective(
    characterObjective.character,
    characterObjective.kind,
    false,
  );
}

export function canGetToCharacterObjective(
  character: PlayerType,
  kind: CharacterObjectiveKind,
  forRun: boolean,
): boolean {
  if (!isCharacterUnlocked(character, forRun)) {
    return false;
  }

  // Handle special cases that require two or more unlockable areas.
  switch (kind) {
    case CharacterObjectiveKind.DELIRIUM: {
      return (
        isAreaUnlocked(UnlockableArea.BLUE_WOMB, forRun) &&
        isAreaUnlocked(UnlockableArea.VOID, forRun)
      );
    }

    case CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL: {
      return (
        isAreaUnlocked(UnlockableArea.CATHEDRAL, forRun) ||
        isAreaUnlocked(UnlockableArea.SHEOL, forRun)
      );
    }

    case CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST: {
      return (
        isAreaUnlocked(UnlockableArea.CHEST, forRun) ||
        isAreaUnlocked(UnlockableArea.DARK_ROOM, forRun)
      );
    }

    default: {
      const unlockableArea = getUnlockableAreaFromCharacterObjectiveKind(kind);
      return unlockableArea === undefined
        ? true
        : isAreaUnlocked(unlockableArea, forRun);
    }
  }
}

function bossObjectiveFunc(
  objective: Objective,
  reachableNonStoryBossesSet: Set<BossID>,
): boolean {
  const bossObjective = objective as BossObjective;
  return canGetToBoss(bossObjective.bossID, reachableNonStoryBossesSet, false);
}

export function canGetToBoss(
  bossID: BossID,
  reachableBossesSet: Set<BossID>,
  forRun: boolean,
): boolean {
  // First, handle custom bosses.
  if (
    bossID === BossIDCustom.ULTRA_PRIDE ||
    bossID === BossIDCustom.KRAMPUS ||
    bossID === BossIDCustom.URIEL ||
    bossID === BossIDCustom.GABRIEL
  ) {
    return true;
  }

  if (
    bossID === BossIDCustom.ULTRA_FAMINE ||
    bossID === BossIDCustom.ULTRA_PESTILENCE ||
    bossID === BossIDCustom.ULTRA_WAR ||
    bossID === BossIDCustom.ULTRA_DEATH
  ) {
    return isAreaUnlocked(UnlockableArea.ASCENT, forRun);
  }

  if (!isStoryBossID(bossID)) {
    return reachableBossesSet.has(bossID);
  }

  // Handle the special case of Delirium, which requires two separate areas to be unlocked. (Since
  // the mod manually removes void portals, getting to Delirium requires going through Blue Womb.)
  if (bossID === BossID.DELIRIUM) {
    return (
      isAreaUnlocked(UnlockableArea.BLUE_WOMB, forRun) &&
      isAreaUnlocked(UnlockableArea.VOID, forRun)
    );
  }

  const unlockableArea = getUnlockableAreaFromStoryBoss(bossID);

  return unlockableArea === undefined
    ? true
    : isAreaUnlocked(unlockableArea, forRun);
}

function challengeObjectiveFunc(objective: Objective): boolean {
  const challengeObjective = objective as ChallengeObjective;
  return isChallengeUnlocked(challengeObjective.challenge, false);
}

/** @returns Whether completing one or more objectives was successful. */
function tryCompleteUncompletedObjectives(): boolean {
  let accomplishedObjective = false;

  const reachableNonStoryBossesSet = getReachableNonStoryBossesSet();

  for (const objective of ALL_OBJECTIVES) {
    if (isObjectiveCompleted(objective)) {
      continue;
    }

    const canAccessObjectiveFunc = OBJECTIVE_ACCESS_FUNCTIONS[objective.type];
    if (canAccessObjectiveFunc(objective, reachableNonStoryBossesSet)) {
      addObjective(objective, true);
      accomplishedObjective = true;
    }
  }

  return accomplishedObjective;
}

export function getReachableNonStoryBossesSet(): Set<BossID> {
  const reachableNonStoryBossesSet = new Set<BossID>();

  for (const stage of BOSS_STAGES) {
    for (const stageType of STAGE_TYPES) {
      if (stageType === StageType.GREED_MODE) {
        continue;
      }

      if (
        isRepentanceStage(stageType) &&
        !isAreaUnlocked(UnlockableArea.REPENTANCE_FLOORS, false)
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

function logMissingObjectives() {
  if (!DEBUG) {
    return;
  }

  log("Character report:");

  let allCharactersUnlocked = true;

  for (const character of MAIN_CHARACTERS) {
    if (isCharacterUnlocked(character, false)) {
      continue;
    }

    allCharactersUnlocked = false;

    const characterName = getCharacterName(character);
    const unlock = getUnlock(UnlockType.CHARACTER, character);
    const objectiveID = findObjectiveIDForUnlock(unlock);
    assertDefined(
      objectiveID,
      `Failed to find the objective for character: ${character}`,
    );
    const objective = getObjectiveFromID(objectiveID);
    const objectiveText = getObjectiveText(objective).join(" ");

    log(`- Character "${characterName}" locked behind objective:`);
    log(`  - ${objectiveText}`);
    logMissingObjective(0, objective);
  }

  if (allCharactersUnlocked) {
    log("- All characters unlocked!");
  }

  log("Missing objectives:");

  for (const [i, objective] of ALL_OBJECTIVES.entries()) {
    if (!isObjectiveCompleted(objective)) {
      logMissingObjective(i, objective);
    }
  }
}

function logMissingObjective(i: number, objective: Objective) {
  const objectiveText = getObjectiveText(objective).join(" ");
  log(`- Missing objective #${i} - ${objectiveText}`);

  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      logMissingObjectiveCharacter(objective);
      break;
    }

    case ObjectiveType.BOSS: {
      logMissingObjectiveBoss(objective);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      logMissingObjectiveChallenge(objective);
      break;
    }
  }
}

function logMissingObjectiveCharacter(objective: CharacterObjective) {
  log(
    `Character "${getCharacterName(
      objective.character,
    )}" unlocked: ${isCharacterUnlocked(objective.character, false)}`,
  );

  log(
    `Can get to ${getCharacterObjectiveKindName(
      objective.kind,
    )}: ${canGetToCharacterObjective(
      objective.character,
      objective.kind,
      false,
    )}`,
  );
}

function logMissingObjectiveBoss(objective: BossObjective) {
  const reachableBossesSet = getReachableNonStoryBossesSet();
  log(
    `Can get to boss "${getBossName(objective.bossID)}": ${canGetToBoss(
      objective.bossID,
      reachableBossesSet,
      false,
    )}`,
  );
}

function logMissingObjectiveChallenge(objective: ChallengeObjective) {
  const unlock = getUnlock(UnlockType.CHALLENGE, objective.challenge);

  log(
    `Challenge "${getChallengeName(
      objective.challenge,
    )}" unlocked: ${isChallengeUnlocked(objective.challenge, false)}`,
  );

  const newObjectiveID = findObjectiveIDForUnlock(unlock);
  if (newObjectiveID === undefined) {
    log("There was no matching objective for the challenge.");
    return;
  }

  const newObjective = getObjectiveFromID(newObjectiveID);
  const newObjectiveText = getObjectiveText(newObjective).join(" ");
  log(`Matching objective for challenge: ${newObjectiveText}`);

  switch (newObjective.type) {
    case ObjectiveType.CHARACTER: {
      log(
        `Character "${getCharacterName(
          newObjective.character,
        )}" unlocked: ${isCharacterUnlocked(newObjective.character, false)}`,
      );
      log(
        `Can get to objective: ${canGetToCharacterObjective(
          newObjective.character,
          newObjective.kind,
          false,
        )}`,
      );

      break;
    }

    default: {
      break;
    }
  }
}
