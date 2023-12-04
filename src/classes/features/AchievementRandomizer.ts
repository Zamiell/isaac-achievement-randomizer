import type { BossID } from "isaac-typescript-definitions";
import {
  CardType,
  CollectibleType,
  ModCallback,
  PlayerType,
  StageID,
} from "isaac-typescript-definitions";
import {
  Callback,
  GAME_FRAMES_PER_SECOND,
  KColorDefault,
  VectorZero,
  clearChallenge,
  fonts,
  game,
  getBossStageIDs,
  getCharacterName,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  getTime,
  isBeforeGameFrame,
  isBeforeRenderFrame,
  log,
  logArray,
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
import { DEBUG, STARTING_CHARACTER } from "../../constants";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { RandomizerMode } from "../../enums/RandomizerMode";
import {
  UnlockableArea,
  getUnlockableAreaFromCharacterObjectiveKind,
} from "../../enums/UnlockableArea";
import type {
  BossObjective,
  ChallengeObjective,
  CharacterObjective,
  Objective,
} from "../../types/Objective";
import { getObjectiveText } from "../../types/Objective";
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
import { v } from "./achievementTracker/v";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;

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

    const text3 = `Confirmed objectives completable: ${v.persistent.completedObjectiveIDs.size} / ${ALL_OBJECTIVES.length}`;
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

    log(
      `Generating achievements for randomizer seed: ${
        v.persistent.seed
      } (attempt #${numGenerationAttempts}, using seed: ${generatingRNG.GetSeed()})`,
    );
    const {
      objectiveIDToUnlockIDMap,
      unlockIDToObjectiveIDMap,
      characterUnlockOrder,
    } = getAchievementsForRNG(generatingRNG);
    v.persistent.objectiveIDToUnlockIDMap = objectiveIDToUnlockIDMap;
    v.persistent.unlockIDToObjectiveIDMap = unlockIDToObjectiveIDMap;
    v.persistent.characterUnlockOrder = characterUnlockOrder;
    log(
      `Generated achievements for randomizer seed: ${v.persistent.seed} (attempt #${numGenerationAttempts})`,
    );

    v.persistent.completedObjectiveIDs = new Set();
    v.persistent.completedUnlockIDs = new Set();
    v.persistent.completedUnlockIDsForRun = new Set();
    v.persistent.uncompletedUnlockIDs = new Set(
      v.persistent.objectiveIDToUnlockIDMap.values(),
    );
    v.persistent.achievementHistory = [];

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
        `Failed to emulate beating seed ${v.persistent.seed}: ${v.persistent.completedObjectiveIDs.size} / ${ALL_OBJECTIVES.length}. Milliseconds taken: ${generationTime}`,
      );

      logMissingObjectives();

      numGenerationAttempts++;
      renderFrameToTryGenerate = renderFrameCount + 1;

      // Clear out the objectives now so that the progress screen goes back to 0. (The "completed"
      // data structures will all be properly reset later on.)
      v.persistent.completedObjectiveIDs = new Set();

      return;
    }

    if (v.persistent.completedObjectiveIDs.size < ALL_OBJECTIVES.length) {
      renderFrameToTestSeed = renderFrameCount + 1;
      return;
    }

    log(`Generation complete. Milliseconds taken: ${generationTime}`);

    generatingRNG = undefined;
    generationTime = 0;

    // Reset the persistent variable relating to our playthrough.
    v.persistent.completedObjectiveIDs = new Set();
    v.persistent.completedUnlockIDs = new Set();
    v.persistent.completedUnlockIDsForRun = new Set();
    v.persistent.uncompletedUnlockIDs = new Set(
      v.persistent.objectiveIDToUnlockIDMap.values(),
    );
    v.persistent.achievementHistory = [];
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
  return !onAnyChallenge();
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

export const OBJECTIVE_ACCESS_FUNCTIONS = {
  [ObjectiveType.CHARACTER]: characterObjectiveFunc,
  [ObjectiveType.BOSS]: bossObjectiveFunc,
  [ObjectiveType.CHALLENGE]: challengeObjectiveFunc,
} as const satisfies Record<ObjectiveType, (objective: Objective) => boolean>;

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

    default: {
      const unlockableArea = getUnlockableAreaFromCharacterObjectiveKind(kind);
      return unlockableArea === undefined
        ? true
        : isAreaUnlocked(unlockableArea, forRun);
    }
  }
}

function bossObjectiveFunc(objective: Objective): boolean {
  const bossObjective = objective as BossObjective;
  return canGetToBoss(bossObjective.bossID, false);
}

function canGetToBoss(bossID: BossID, forRun: boolean): boolean {
  const stageIDs = getBossStageIDs(bossID);

  for (const stageID of stageIDs) {
    if (canGetToStageID(stageID, forRun)) {
      return true;
    }
  }

  return false;
}

const STAGE_ID_ACCESS_FUNCTIONS = {
  [StageID.SPECIAL_ROOMS]: undefined, // 0
  [StageID.BASEMENT]: undefined, // 1
  [StageID.CELLAR]: undefined, // 2
  [StageID.BURNING_BASEMENT]: undefined, // 3
  [StageID.CAVES]: undefined, // 4
  [StageID.CATACOMBS]: undefined, // 5
  [StageID.FLOODED_CAVES]: undefined, // 6
  [StageID.DEPTHS]: undefined, // 7
  [StageID.NECROPOLIS]: undefined, // 8
  [StageID.DANK_DEPTHS]: undefined, // 9
  [StageID.WOMB]: UnlockableArea.WOMB, // 10
  [StageID.UTERO]: UnlockableArea.WOMB, // 11
  [StageID.SCARRED_WOMB]: UnlockableArea.WOMB, // 12
  [StageID.BLUE_WOMB]: UnlockableArea.BLUE_WOMB, // 13
  [StageID.SHEOL]: UnlockableArea.SHEOL, // 14
  [StageID.CATHEDRAL]: UnlockableArea.CATHEDRAL, // 15
  [StageID.DARK_ROOM]: UnlockableArea.DARK_ROOM, // 16
  [StageID.CHEST]: UnlockableArea.CHEST, // 17
  [StageID.SPECIAL_ROOMS_GREED_MODE]: UnlockableArea.GREED_MODE, // 18
  [StageID.BASEMENT_GREED_MODE]: UnlockableArea.GREED_MODE, // 19
  [StageID.CAVES_GREED_MODE]: UnlockableArea.GREED_MODE, // 20
  [StageID.DEPTHS_GREED_MODE]: UnlockableArea.GREED_MODE, // 21
  [StageID.WOMB_GREED_MODE]: UnlockableArea.GREED_MODE, // 22
  [StageID.SHEOL_GREED_MODE]: UnlockableArea.GREED_MODE, // 23
  [StageID.SHOP_GREED_MODE]: UnlockableArea.GREED_MODE, // 24
  [StageID.ULTRA_GREED_GREED_MODE]: UnlockableArea.GREED_MODE, // 25
  [StageID.VOID]: UnlockableArea.VOID, // 26
  [StageID.DOWNPOUR]: UnlockableArea.REPENTANCE_FLOORS, // 27
  [StageID.DROSS]: UnlockableArea.REPENTANCE_FLOORS, // 28
  [StageID.MINES]: UnlockableArea.REPENTANCE_FLOORS, // 29
  [StageID.ASHPIT]: UnlockableArea.REPENTANCE_FLOORS, // 30
  [StageID.MAUSOLEUM]: UnlockableArea.REPENTANCE_FLOORS, // 31
  [StageID.GEHENNA]: UnlockableArea.REPENTANCE_FLOORS, // 32
  [StageID.CORPSE]: UnlockableArea.REPENTANCE_FLOORS, // 33
  [StageID.MORTIS]: UnlockableArea.REPENTANCE_FLOORS, // 34
  [StageID.HOME]: UnlockableArea.ASCENT, // 35
  [StageID.BACKWARDS]: UnlockableArea.ASCENT, // 36
} as const satisfies Record<StageID, UnlockableArea | undefined>;

function canGetToStageID(stageID: StageID, forRun: boolean): boolean {
  const unlockableArea = STAGE_ID_ACCESS_FUNCTIONS[stageID];
  if (unlockableArea === undefined) {
    return true;
  }

  return isAreaUnlocked(unlockableArea, forRun);
}

function challengeObjectiveFunc(objective: Objective): boolean {
  const challengeObjective = objective as ChallengeObjective;
  return isChallengeUnlocked(challengeObjective.challenge, false);
}

/** @returns Whether completing one or more objectives was successful. */
function tryCompleteUncompletedObjectives(): boolean {
  let accomplishedObjective = false;

  for (const objective of ALL_OBJECTIVES) {
    if (isObjectiveCompleted(objective)) {
      continue;
    }

    const canAccessObjectiveFunc = OBJECTIVE_ACCESS_FUNCTIONS[objective.type];
    if (canAccessObjectiveFunc(objective)) {
      addObjective(objective, true);
      accomplishedObjective = true;
    }
  }

  return accomplishedObjective;
}

function logMissingObjectives() {
  if (!DEBUG) {
    return;
  }

  const missingCharacters = v.persistent.characterUnlockOrder.filter(
    (character) => !isCharacterUnlocked(character, false),
  );
  if (missingCharacters.length === 0) {
    log("Missing characters: [n/a; all characters unlocked]");
  } else {
    logArray(v.persistent.characterUnlockOrder, "characterUnlockOrder");
    log(
      `Missing characters (${missingCharacters.length} / ${v.persistent.characterUnlockOrder.length}):`,
    );

    for (const [i, character] of v.persistent.characterUnlockOrder.entries()) {
      if (!isCharacterUnlocked(character, false)) {
        const characterName = getCharacterName(character);
        log(`- ${i + 1}) ${characterName} (${character})`);
      }
    }
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
}
