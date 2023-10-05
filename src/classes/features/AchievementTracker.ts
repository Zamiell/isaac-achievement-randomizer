import type { KeySubType } from "isaac-typescript-definitions";
import {
  BatterySubType,
  BombSubType,
  BossID,
  CallbackPriority,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  GridEntityType,
  HeartSubType,
  ItemConfigTag,
  LevelStage,
  ModCallback,
  PickupVariant,
  PillEffect,
  PlayerType,
  SackSubType,
  SeedEffect,
  SlotVariant,
  StageType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  GAME_FRAMES_PER_SECOND,
  KColorDefault,
  MAIN_CHARACTERS,
  MAX_QUALITY,
  ModCallbackCustom,
  ModFeature,
  PriorityCallback,
  ReadonlyMap,
  ReadonlySet,
  VectorZero,
  addSetsToSet,
  assertDefined,
  assertNotNull,
  collectibleHasTag,
  copyArray,
  eRange,
  filterMap,
  fonts,
  game,
  getBossSet,
  getCharacterName,
  getCollectibleName,
  getCollectibleQuality,
  getRandomSeed,
  getScreenBottomRightPos,
  getScreenCenterPos,
  getVanillaCollectibleTypesOfQuality,
  includes,
  isActiveCollectible,
  isCard,
  isEven,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRepentanceStage,
  isRune,
  log,
  logError,
  newRNG,
  newSprite,
  restart,
  setUnseeded,
  shuffleArray,
} from "isaacscript-common";
import { getAchievementsForRNG } from "../../achievementAssignment";
import { ALL_ACHIEVEMENTS } from "../../achievements";
import {
  ALT_FLOORS,
  CHALLENGES,
  CHARACTER_OBJECTIVE_KINDS,
  STAGE_TYPES,
} from "../../cachedEnums";
import { AchievementType } from "../../enums/AchievementType";
import { AltFloor, getAltFloor } from "../../enums/AltFloor";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { ALL_OBJECTIVES, NO_HIT_BOSSES } from "../../objectives";
import { convertSecondsToTimerValues } from "../../timer";
import type { Achievement } from "../../types/Achievement";
import { getAchievement, getAchievementText } from "../../types/Achievement";
import { getAchievementID } from "../../types/AchievementID";
import type { BossObjective, Objective } from "../../types/Objective";
import {
  getObjective,
  getObjectiveFromID,
  getObjectiveText,
} from "../../types/Objective";
import type { ObjectiveID } from "../../types/ObjectiveID";
import { getObjectiveID } from "../../types/ObjectiveID";
import { UNLOCKABLE_CARD_TYPES } from "../../unlockableCardTypes";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "../../unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_KEY_SUB_TYPES,
} from "../../unlockablePickupTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "../../unlockableSlotVariants";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../unlockableTrinketTypes";
import { showNewAchievement } from "./AchievementText";
import { hasErrors } from "./checkErrors/v";

const VERBOSE = false as boolean;
const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");
const FONT = fonts.droid;
const STARTING_CHARACTER = PlayerType.ISAAC;

const CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP = new ReadonlyMap<
  Challenge,
  CollectibleType[]
>([
  // 6
  [
    Challenge.SOLAR_SYSTEM,
    [
      CollectibleType.DISTANT_ADMIRATION, // 57
      CollectibleType.FOREVER_ALONE, // 128
    ],
  ],

  // 8
  [Challenge.CAT_GOT_YOUR_TONGUE, [CollectibleType.GUPPYS_HAIRBALL]],

  // 13
  [
    Challenge.BEANS,
    [
      CollectibleType.BEAN, // 111
      CollectibleType.NINE_VOLT, // 116
    ],
  ],

  // 19
  [Challenge.FAMILY_MAN, [CollectibleType.BROTHER_BOBBY]],

  // 23
  [
    Challenge.BLUE_BOMBER,
    [
      CollectibleType.KAMIKAZE, // 40
      CollectibleType.PYROMANIAC, // 223
    ],
  ],

  // 24
  [
    Challenge.PAY_TO_PLAY,
    [CollectibleType.SACK_OF_PENNIES, CollectibleType.MONEY_EQUALS_POWER],
  ],

  // 25
  [Challenge.HAVE_A_HEART, [CollectibleType.CHARM_OF_THE_VAMPIRE]],

  // 27
  [Challenge.BRAINS, [CollectibleType.BOBS_BRAIN]],

  // 29
  [Challenge.ONANS_STREAK, [CollectibleType.CHOCOLATE_MILK]],

  // 30
  [
    Challenge.GUARDIAN,
    [
      CollectibleType.ISAACS_HEART, // 276
      CollectibleType.PUNCHING_BAG, // 281
      CollectibleType.SPEAR_OF_DESTINY, // 400
    ],
  ],

  // 36
  [
    Challenge.SCAT_MAN,
    [
      CollectibleType.POOP, // 36
      CollectibleType.NINE_VOLT, // 116
      CollectibleType.THUNDER_THIGHS, // 314
      CollectibleType.DIRTY_MIND, // 576
    ],
  ],

  // 37
  [Challenge.BLOODY_MARY, [CollectibleType.BLOOD_OATH]],

  // 38
  [
    Challenge.BAPTISM_BY_FIRE,
    [
      CollectibleType.GUPPYS_PAW, // 133
      CollectibleType.SCHOOLBAG, // 534
      CollectibleType.URN_OF_SOULS, // 640
    ],
  ],

  // 41
  [Challenge.PICA_RUN, [CollectibleType.MOMS_BOX]],

  // 44
  [Challenge.RED_REDEMPTION, [CollectibleType.RED_KEY]],

  // 45
  [Challenge.DELETE_THIS, [CollectibleType.TMTRAINER]],
]);

const BOSS_STAGES = [
  LevelStage.BASEMENT_1,
  LevelStage.CAVES_1,
  LevelStage.DEPTHS_1,
  LevelStage.WOMB_1,
] as const;

const GOOD_COLLECTIBLES = new ReadonlySet([
  CollectibleType.CHOCOLATE_MILK, // 69 (quality 3)
  CollectibleType.BOOK_OF_REVELATIONS, // 78 (quality 3)
  CollectibleType.RELIC, // 98 (quality 3)
  CollectibleType.GNAWED_LEAF, // 210 (quality 1)
  CollectibleType.CRICKETS_BODY, // 224 (quality 3)
  CollectibleType.MONSTROS_LUNG, // 229 (quality 2)
  CollectibleType.DEATHS_TOUCH, // 237 (quality 3)
  CollectibleType.TECH_5, // 244 (quality 3)
  CollectibleType.PROPTOSIS, // 261 (quality 3)
  CollectibleType.CANCER, // 301 (quality 3)
  CollectibleType.DEAD_EYE, // 373 (quality 3)
  CollectibleType.MAW_OF_THE_VOID, // 399 (quality 3)
  CollectibleType.ROCK_BOTTOM, // 562 (quality 3)
  CollectibleType.SPIRIT_SWORD, // 579 (quality 3)
  CollectibleType.ECHO_CHAMBER, // 700 (quality 3)
  CollectibleType.TMTRAINER, // 721 (quality 0)
]);

/** `isaacscript-common` uses `CallbackPriority.IMPORTANT` (-200). */
const HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON = (CallbackPriority.IMPORTANT -
  1) as CallbackPriority;

const DEFAULT_TRINKET_ACHIEVEMENT = getAchievement(
  AchievementType.TRINKET,
  TrinketType.ERROR,
);

const DEFAULT_CARD_ACHIEVEMENT = getAchievement(
  AchievementType.CARD,
  CardType.FOOL,
);

const DEFAULT_PILL_ACHIEVEMENT = getAchievement(
  AchievementType.PILL_EFFECT,
  PillEffect.I_FOUND_PILLS,
);

const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,

    numCompletedRuns: 0,
    numDeaths: 0,
    gameFramesElapsed: 0,

    objectiveToAchievementMap: new Map<ObjectiveID, Achievement>(),

    completedObjectives: [] as Objective[],
    completedAchievements: [] as Achievement[],
    completedAchievementsForRun: [] as Achievement[],
  },

  run: {
    shouldIncrementTime: true,
    shouldIncrementCompletedRunsCounter: true,
    shouldIncrementDeathCounter: true,
  },
};

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

    const seeds = game.GetSeeds();
    seeds.AddSeedEffect(SeedEffect.NO_HUD);

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
    if (generatingRNG === undefined) {
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

    v.persistent.objectiveToAchievementMap =
      getAchievementsForRNG(generatingRNG);
    log(
      `Checking to see if randomizer seed ${v.persistent.seed} is beatable. Attempt: #${numGenerationAttempts}`,
    );

    if (!isAchievementsBeatable()) {
      // Try again on the next render frame.
      return;
    }

    generatingRNG = undefined;

    // Reset the persistent variable relating to our streak.
    v.persistent.numDeaths = 0;
    v.persistent.gameFramesElapsed = 0;
    v.persistent.completedAchievements = [];
    v.persistent.completedObjectives = [];

    preForcedRestart();
    setUnseeded();

    const challenge = Isaac.GetChallenge();
    if (challenge !== Challenge.NULL) {
      Isaac.ExecuteCommand("challenge 0");
    }

    restart(STARTING_CHARACTER);
  }

  // 16
  @Callback(ModCallback.POST_GAME_END)
  postGameEnd(isGameOver: boolean): void {
    if (!isRandomizerEnabled()) {
      return;
    }

    if (!isGameOver) {
      v.run.shouldIncrementDeathCounter = false;
    }
  }

  /**
   * We need this function to fire before the save data manager or else the `numDeaths` modification
   * will never be written to disk.
   */
  // 17
  @PriorityCallback(
    ModCallback.PRE_GAME_EXIT,
    HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON,
  )
  preGameExit(): void {
    if (!isRandomizerEnabled()) {
      return;
    }

    this.incrementTime();
    this.incrementCompletedRunsCounter();
    this.incrementDeathCounter();
  }

  incrementTime(): void {
    if (!v.run.shouldIncrementTime) {
      v.run.shouldIncrementTime = true;
      return;
    }

    v.persistent.gameFramesElapsed += game.GetFrameCount();
  }

  incrementCompletedRunsCounter(): void {
    if (!v.run.shouldIncrementCompletedRunsCounter) {
      v.run.shouldIncrementCompletedRunsCounter = true;
      return;
    }

    v.persistent.numCompletedRuns++;
  }

  incrementDeathCounter(): void {
    if (!v.run.shouldIncrementDeathCounter) {
      v.run.shouldIncrementDeathCounter = true;
      return;
    }

    v.persistent.numDeaths++;
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    if (!isRandomizerEnabled()) {
      return;
    }

    v.persistent.completedAchievementsForRun = copyArray(
      v.persistent.completedAchievements,
    );
  }
}

// --------------
// Core functions
// --------------

export function isRandomizerEnabled(): boolean {
  return v.persistent.seed !== null;
}

export function getRandomizerSeed(): Seed | undefined {
  return v.persistent.seed ?? undefined;
}

export function startRandomizer(seed: Seed | undefined): void {
  if (seed === undefined) {
    seed = getRandomSeed();
  }

  v.persistent.seed = seed;
  log(`Set new randomizer seed: ${v.persistent.seed}`);

  generatingRNG = newRNG(v.persistent.seed);
  numGenerationAttempts = -1;

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

export function getCompletedAchievements(): Achievement[] {
  return v.persistent.completedAchievements;
}

export function getNumCompletedAchievements(): int {
  return v.persistent.completedAchievements.length;
}

export function getNumCompletedRuns(): int {
  return v.persistent.numCompletedRuns;
}

export function getNumDeaths(): int {
  return v.persistent.numDeaths;
}

export function getSecondsElapsed(): int {
  const gameFrameCount = game.GetFrameCount();
  const totalFrames = v.persistent.gameFramesElapsed + gameFrameCount;

  return totalFrames / GAME_FRAMES_PER_SECOND;
}

export function getTimeElapsed(): string {
  const seconds = getSecondsElapsed();
  const timerValues = convertSecondsToTimerValues(seconds);
  if (timerValues === undefined) {
    return "unknown";
  }

  const { hour1, hour2, minute1, minute2, second1, second2 } = timerValues;
  return `${hour1}${hour2}:${minute1}${minute2}:${second1}${second2}`;
}

export function preForcedRestart(): void {
  v.run.shouldIncrementTime = false;
  v.run.shouldIncrementCompletedRunsCounter = false;
  v.run.shouldIncrementDeathCounter = false;
}

function getAchievementMatchingObjective(
  objective: Objective,
): Achievement | undefined {
  const objectiveID = getObjectiveID(objective);

  for (const [thisObjectiveID, achievement] of v.persistent
    .objectiveToAchievementMap) {
    if (thisObjectiveID === objectiveID) {
      return achievement;
    }
  }

  return undefined;
}

// -------------
// Add functions
// -------------

export function addObjective(objective: Objective, emulating = false): void {
  if (hasErrors()) {
    return;
  }

  // Prevent accomplishing non-challenge objectives while inside of a challenge.
  if (!emulating) {
    const challenge = Isaac.GetChallenge();
    if (
      (challenge === Challenge.NULL &&
        objective.type === ObjectiveType.CHALLENGE) ||
      (challenge !== Challenge.NULL &&
        objective.type !== ObjectiveType.CHALLENGE)
    ) {
      return;
    }
  }

  if (isObjectiveCompleted(objective)) {
    return;
  }

  v.persistent.completedObjectives.push(objective);

  const objectiveID = getObjectiveID(objective);
  const achievement = v.persistent.objectiveToAchievementMap.get(objectiveID);
  assertDefined(
    achievement,
    `Failed to get the achievement corresponding to objective ID: ${objectiveID}`,
  );

  let originalAchievement = achievement;
  let swappedAchievement = achievement;
  do {
    if (VERBOSE) {
      log(
        `Checking achievement swap for: ${getAchievementText(
          originalAchievement,
        ).join(" - ")}`,
      );
    }

    originalAchievement = swappedAchievement;
    swappedAchievement = checkSwapProblematicAchievement(
      originalAchievement,
      objectiveID,
    );

    if (VERBOSE) {
      log(
        `Swapped achievement is: ${getAchievementText(originalAchievement).join(
          " - ",
        )}`,
      );
    }
  } while (
    getAchievementID(originalAchievement) !==
    getAchievementID(swappedAchievement)
  );

  v.persistent.completedAchievements.push(swappedAchievement);

  if (emulating) {
    v.persistent.completedAchievementsForRun.push(swappedAchievement);
  } else {
    showNewAchievement(swappedAchievement);
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

function checkSwapProblematicAchievement(
  achievement: Achievement,
  objectiveID: ObjectiveID,
): Achievement {
  const swappedAchievement = getSwappedAchievement(achievement);
  if (swappedAchievement === undefined) {
    return achievement;
  }

  const swappedObjectiveID = findObjectiveIDForAchievement(swappedAchievement);
  assertDefined(
    swappedObjectiveID,
    `Failed to find the objective ID for swapped achievement: ${getAchievementText(
      swappedAchievement,
    )}`,
  );

  v.persistent.objectiveToAchievementMap.set(objectiveID, swappedAchievement);
  v.persistent.objectiveToAchievementMap.set(swappedObjectiveID, achievement);

  return swappedAchievement;
}

function getSwappedAchievement(
  achievement: Achievement,
): Achievement | undefined {
  switch (achievement.type) {
    case AchievementType.PATH: {
      switch (achievement.unlockablePath) {
        case UnlockablePath.VOID: {
          if (!isPathUnlocked(UnlockablePath.BLUE_WOMB, false)) {
            return getAchievement(
              AchievementType.PATH,
              UnlockablePath.BLUE_WOMB,
            );
          }

          return undefined;
        }

        case UnlockablePath.ASCENT: {
          if (!isCardTypeUnlocked(CardType.FOOL, false)) {
            return getAchievement(AchievementType.CARD, CardType.FOOL);
          }

          return undefined;
        }

        case UnlockablePath.BLACK_MARKETS: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getAchievement(
              AchievementType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case AchievementType.ALT_FLOOR: {
      switch (achievement.altFloor) {
        case AltFloor.DROSS:
        case AltFloor.ASHPIT:
        case AltFloor.GEHENNA: {
          if (!isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS, false)) {
            return getAchievement(
              AchievementType.PATH,
              UnlockablePath.REPENTANCE_FLOORS,
            );
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case AchievementType.CHALLENGE: {
      const requiredCollectibleTypes =
        CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP.get(achievement.challenge);
      if (requiredCollectibleTypes === undefined) {
        return undefined;
      }

      for (const collectibleType of requiredCollectibleTypes) {
        if (!isCollectibleTypeUnlocked(collectibleType, false)) {
          return getAchievement(AchievementType.COLLECTIBLE, collectibleType);
        }
      }

      return undefined;
    }

    case AchievementType.COLLECTIBLE: {
      // First, check to see if there is a worse collectible available to unlock.
      const worseCollectibleType = getWorseCollectibleType(
        achievement.collectibleType,
      );
      if (worseCollectibleType !== undefined) {
        return getAchievement(
          AchievementType.COLLECTIBLE,
          worseCollectibleType,
        );
      }

      switch (achievement.collectibleType) {
        // 75
        case CollectibleType.PHD: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 84
        case CollectibleType.WE_NEED_TO_GO_DEEPER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getAchievement(
              AchievementType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        // 85
        case CollectibleType.DECK_OF_CARDS: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 102
        case CollectibleType.MOMS_BOTTLE_OF_PILLS: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 139
        case CollectibleType.MOMS_PURSE: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_ACHIEVEMENT;
          }

          return undefined;
        }

        // 195
        case CollectibleType.MOMS_COIN_PURSE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 203
        case CollectibleType.HUMBLING_BUNDLE: {
          if (!isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)) {
            return getAchievement(
              AchievementType.COIN,
              CoinSubType.DOUBLE_PACK,
            );
          }

          return undefined;
        }

        // 210
        case CollectibleType.GNAWED_LEAF: {
          const nonCompletedBossObjective = getNonCompletedBossObjective();
          if (nonCompletedBossObjective !== undefined) {
            const matchingAchievement = getAchievementMatchingObjective(
              nonCompletedBossObjective,
            );
            if (matchingAchievement !== undefined) {
              return matchingAchievement;
            }
          }

          return undefined;
        }

        // 250
        case CollectibleType.BOGO_BOMBS: {
          if (!isBombSubTypeUnlocked(BombSubType.DOUBLE_PACK, false)) {
            return getAchievement(
              AchievementType.BOMB,
              BombSubType.DOUBLE_PACK,
            );
          }

          return undefined;
        }

        // 251
        case CollectibleType.STARTER_DECK: {
          if (!anyCardTypesUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 252
        case CollectibleType.LITTLE_BAGGY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 263
        case CollectibleType.CLEAR_RUNE: {
          if (!anyRunesUnlocked(false)) {
            return getAchievement(AchievementType.CARD, CardType.RUNE_BLANK);
          }

          return undefined;
        }

        // 286
        case CollectibleType.BLANK_CARD: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 348
        case CollectibleType.PLACEBO: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 424
        case CollectibleType.SACK_HEAD: {
          if (!isSackSubTypeUnlocked(SackSubType.NORMAL, false)) {
            return getAchievement(AchievementType.SACK, SackSubType.NORMAL);
          }

          return undefined;
        }

        // 439
        case CollectibleType.MOMS_BOX: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_ACHIEVEMENT;
          }

          return undefined;
        }

        // 451
        case CollectibleType.TAROT_CLOTH: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 458
        case CollectibleType.BELLY_BUTTON: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_ACHIEVEMENT;
          }

          return undefined;
        }

        // 479
        case CollectibleType.SMELTER: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_ACHIEVEMENT;
          }

          return undefined;
        }

        // 491
        case CollectibleType.ACID_BABY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 538
        case CollectibleType.MARBLES: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_ACHIEVEMENT;
          }

          return undefined;
        }

        // 566
        case CollectibleType.DREAM_CATCHER: {
          for (const altFloor of ALT_FLOORS) {
            if (!isAltFloorUnlocked(altFloor, false)) {
              return getAchievement(AchievementType.ALT_FLOOR, altFloor);
            }
          }

          return undefined;
        }

        // 603
        case CollectibleType.BATTERY_PACK: {
          if (!isBatterySubTypeUnlocked(BatterySubType.NORMAL, false)) {
            return getAchievement(
              AchievementType.BATTERY,
              BatterySubType.NORMAL,
            );
          }

          return undefined;
        }

        // 624
        case CollectibleType.BOOSTER_PACK: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 654
        case CollectibleType.FALSE_PHD: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case AchievementType.TRINKET: {
      switch (achievement.trinketType) {
        // 22
        case TrinketType.DAEMONS_TAIL: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BLACK, false)) {
            return getAchievement(AchievementType.HEART, HeartSubType.BLACK);
          }

          return undefined;
        }

        // 44
        case TrinketType.SAFETY_CAP: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 45
        case TrinketType.ACE_OF_SPADES: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_ACHIEVEMENT;
          }

          return undefined;
        }

        // 61
        case TrinketType.LEFT_HAND: {
          if (!isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)) {
            return getAchievement(
              AchievementType.CHEST,
              PickupVariant.RED_CHEST,
            );
          }

          return undefined;
        }

        // 159
        case TrinketType.GILDED_KEY: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getAchievement(
              AchievementType.CHEST,
              PickupVariant.LOCKED_CHEST,
            );
          }

          return undefined;
        }

        // 168
        case TrinketType.HOLLOW_HEART: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getAchievement(AchievementType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case AchievementType.CARD: {
      switch (achievement.cardType) {
        // 6
        case CardType.HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.SOUL, false)) {
            return getAchievement(AchievementType.HEART, HeartSubType.SOUL);
          }

          return undefined;
        }

        // 11
        case CardType.WHEEL_OF_FORTUNE: {
          if (!isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)) {
            return getAchievement(
              AchievementType.SLOT,
              SlotVariant.SLOT_MACHINE,
            );
          }

          return undefined;
        }

        // 15
        case CardType.TEMPERANCE: {
          if (
            !isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
          ) {
            return getAchievement(
              AchievementType.SLOT,
              SlotVariant.BLOOD_DONATION_MACHINE,
            );
          }

          return undefined;
        }

        // 21
        case CardType.JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.BEGGAR, false)) {
            return getAchievement(AchievementType.SLOT, SlotVariant.BEGGAR);
          }

          return undefined;
        }

        // 6
        case CardType.REVERSE_HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getAchievement(AchievementType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        // 64
        case CardType.REVERSE_JUSTICE: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getAchievement(
              AchievementType.CHEST,
              PickupVariant.LOCKED_CHEST,
            );
          }

          return undefined;
        }

        // 70
        case CardType.REVERSE_TEMPERANCE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_ACHIEVEMENT;
          }

          return undefined;
        }

        // 72
        case CardType.REVERSE_TOWER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.ROCK_TINTED, false)) {
            return getAchievement(
              AchievementType.GRID_ENTITY,
              GridEntityType.ROCK_TINTED,
            );
          }

          return undefined;
        }

        // 76
        case CardType.REVERSE_JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.SHOP_RESTOCK_MACHINE, false)) {
            return getAchievement(
              AchievementType.SLOT,
              SlotVariant.SHOP_RESTOCK_MACHINE,
            );
          }

          return undefined;
        }

        // 77
        case CardType.REVERSE_WORLD: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getAchievement(
              AchievementType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    default: {
      return undefined;
    }
  }
}

function findObjectiveIDForAchievement(
  achievementToMatch: Achievement,
): ObjectiveID | undefined {
  for (const entries of v.persistent.objectiveToAchievementMap) {
    const [objectiveID, achievement] = entries;

    switch (achievement.type) {
      case AchievementType.CHARACTER: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.character === achievementToMatch.character
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.PATH: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.unlockablePath === achievementToMatch.unlockablePath
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.ALT_FLOOR: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.altFloor === achievementToMatch.altFloor
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.CHALLENGE: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.challenge === achievementToMatch.challenge
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.COLLECTIBLE: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.collectibleType === achievementToMatch.collectibleType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.TRINKET: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.trinketType === achievementToMatch.trinketType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.CARD: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.cardType === achievementToMatch.cardType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.PILL_EFFECT: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.pillEffect === achievementToMatch.pillEffect
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.HEART: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.heartSubType === achievementToMatch.heartSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.COIN: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.coinSubType === achievementToMatch.coinSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.BOMB: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.bombSubType === achievementToMatch.bombSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.KEY: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.keySubType === achievementToMatch.keySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.BATTERY: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.batterySubType === achievementToMatch.batterySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.SACK: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.sackSubType === achievementToMatch.sackSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.CHEST: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.pickupVariant === achievementToMatch.pickupVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.SLOT: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.slotVariant === achievementToMatch.slotVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.GRID_ENTITY: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.gridEntityType === achievementToMatch.gridEntityType
        ) {
          return objectiveID;
        }

        break;
      }

      case AchievementType.OTHER: {
        if (
          achievement.type === achievementToMatch.type &&
          achievement.kind === achievementToMatch.kind
        ) {
          return objectiveID;
        }

        break;
      }
    }
  }

  return undefined;
}

// -----------------------------
// Completed objective functions
// -----------------------------

export function isAllCharacterObjectivesCompleted(
  character: PlayerType,
): boolean {
  const completedCharacterObjectives = v.persistent.completedObjectives.filter(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character,
  );

  return (
    completedCharacterObjectives.length === CHARACTER_OBJECTIVE_KINDS.length
  );
}

export function isCharacterObjectiveCompleted(
  character: PlayerType,
  kind: CharacterObjectiveKind,
): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character &&
      objective.kind === kind,
  );
}

export function isBossObjectiveCompleted(bossID: BossID): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.BOSS && objective.bossID === bossID,
  );
}

export function isChallengeObjectiveCompleted(challenge: Challenge): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
}

function getNonCompletedBossObjective(): BossObjective | undefined {
  const completedBossObjectives = v.persistent.completedObjectives.filter(
    (objective) => objective.type === ObjectiveType.BOSS,
  ) as BossObjective[];
  const completedBossIDs = completedBossObjectives.map(
    (objective) => objective.bossID,
  );
  const completedBossIDsSet = new Set(completedBossIDs);

  for (const bossID of NO_HIT_BOSSES) {
    if (!completedBossIDsSet.has(bossID)) {
      return {
        type: ObjectiveType.BOSS,
        bossID,
      };
    }
  }

  return undefined;
}

// ---------------------------------
// Achievement - Character functions
// ---------------------------------

export function isCharacterUnlocked(character: PlayerType): boolean {
  // Isaac is always unlocked.
  if (character === PlayerType.ISAAC) {
    return true;
  }

  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.CHARACTER &&
      achievement.character === character,
  );
}

// ----------------------------
// Achievement - Path functions
// ----------------------------

export function isPathUnlocked(
  unlockablePath: UnlockablePath,
  forRun = true,
): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.PATH &&
      achievement.unlockablePath === unlockablePath,
  );
}

// ---------------------------------
// Achievement - Alt floor functions
// ---------------------------------

export function isAltFloorUnlocked(altFloor: AltFloor, forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.ALT_FLOOR &&
      achievement.altFloor === altFloor,
  );
}

export function isStageTypeUnlocked(
  stage: LevelStage,
  stageType: StageType,
): boolean {
  const altFloor = getAltFloor(stage, stageType);
  if (altFloor === undefined) {
    return true;
  }

  return isAltFloorUnlocked(altFloor);
}

// ---------------------------------
// Achievement - Challenge functions
// ---------------------------------

export function isChallengeUnlocked(challenge: Challenge): boolean {
  if (challenge === Challenge.NULL) {
    return true;
  }

  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.CHALLENGE &&
      achievement.challenge === challenge,
  );
}

// -----------------------------------
// Achievement - Collectible functions
// -----------------------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
  forRun = true,
): boolean {
  if (ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.COLLECTIBLE &&
      achievement.collectibleType === collectibleType,
  );
}

export function getUnlockedEdenActiveCollectibleTypes(): CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes();

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isActiveCollectible(collectibleType),
  );
}

export function getUnlockedEdenPassiveCollectibleTypes(): CollectibleType[] {
  const unlockedCollectibleTypes = getUnlockedCollectibleTypes();

  return unlockedCollectibleTypes.filter(
    (collectibleType) =>
      !isHiddenCollectible(collectibleType) &&
      !collectibleHasTag(collectibleType, ItemConfigTag.NO_EDEN) &&
      isPassiveOrFamiliarCollectible(collectibleType) &&
      collectibleType !== CollectibleType.TMTRAINER,
  );
}

function getWorseCollectibleType(
  collectibleType: CollectibleType,
): CollectibleType | undefined {
  // Some collectibles result in a won run and should be treated as maximum quality.
  const quality = GOOD_COLLECTIBLES.has(collectibleType)
    ? MAX_QUALITY
    : getCollectibleQuality(collectibleType);

  for (const lowerQualityInt of eRange(quality)) {
    const lowerQuality = lowerQualityInt as Quality;
    const lowerQualityCollectibleTypes =
      getVanillaCollectibleTypesOfQuality(lowerQuality);
    assertNotNull(
      v.persistent.seed,
      "Failed to get a worse collectible type since the seed was null.",
    );
    const shuffledCollectibleTypes = shuffleArray(
      [...lowerQualityCollectibleTypes],
      v.persistent.seed,
    );
    for (const lowerQualityCollectibleType of shuffledCollectibleTypes) {
      if (ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(lowerQualityCollectibleType)) {
        continue;
      }

      if (!isCollectibleTypeUnlocked(lowerQualityCollectibleType, false)) {
        return lowerQualityCollectibleType;
      }
    }
  }

  return undefined;
}

function getUnlockedCollectibleTypes(): CollectibleType[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.COLLECTIBLE
      ? achievement.collectibleType
      : undefined,
  );
}

// -------------------------------
// Achievement - Trinket functions
// -------------------------------

function anyTrinketTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) => achievement.type === AchievementType.TRINKET,
  );
}

export function isTrinketTypeUnlocked(trinketType: TrinketType): boolean {
  if (ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType)) {
    return true;
  }

  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.TRINKET &&
      achievement.trinketType === trinketType,
  );
}

export function getUnlockedTrinketTypes(): TrinketType[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.TRINKET
      ? achievement.trinketType
      : undefined,
  );
}

// ----------------------------
// Achievement - Card functions
// ----------------------------

export function anyCardTypesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some((achievement) => achievement.type === AchievementType.CARD);
}

function anyCardsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD && isCard(achievement.cardType),
  );
}

function anyRunesUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD && isRune(achievement.cardType),
  );
}

export function isCardTypeUnlocked(cardType: CardType, forRun = true): boolean {
  if (!UNLOCKABLE_CARD_TYPES.includes(cardType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CARD &&
      achievement.cardType === cardType,
  );
}

export function getUnlockedCardTypes(): CardType[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.CARD
      ? achievement.cardType
      : undefined,
  );
}

// -----------------------------------
// Achievement - Pill effect functions
// -----------------------------------

export function anyPillEffectsUnlocked(forRun = true): boolean {
  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) => achievement.type === AchievementType.PILL_EFFECT,
  );
}

export function isPillEffectUnlocked(pillEffect: PillEffect): boolean {
  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.PILL_EFFECT &&
      achievement.pillEffect === pillEffect,
  );
}

export function getUnlockedPillEffects(): PillEffect[] {
  return filterMap(v.persistent.completedAchievementsForRun, (achievement) =>
    achievement.type === AchievementType.PILL_EFFECT
      ? achievement.pillEffect
      : undefined,
  );
}

// ------------------------------------
// Achievement - Other pickup functions
// ------------------------------------

export function isHeartSubTypeUnlocked(
  heartSubType: HeartSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_HEART_SUB_TYPES, heartSubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.HEART &&
      achievement.heartSubType === heartSubType,
  );
}

export function isCoinSubTypeUnlocked(
  coinSubType: CoinSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_COIN_SUB_TYPES, coinSubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.COIN &&
      achievement.coinSubType === coinSubType,
  );
}

export function isBombSubTypeUnlocked(
  bombSubType: BombSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_BOMB_SUB_TYPES, bombSubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.BOMB &&
      achievement.bombSubType === bombSubType,
  );
}

export function isKeySubTypeUnlocked(keySubType: KeySubType): boolean {
  if (!includes(UNLOCKABLE_KEY_SUB_TYPES, keySubType)) {
    return true;
  }

  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.KEY &&
      achievement.keySubType === keySubType,
  );
}

export function isBatterySubTypeUnlocked(
  batterySubType: BatterySubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_BATTERY_SUB_TYPES, batterySubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.BATTERY &&
      achievement.batterySubType === batterySubType,
  );
}

export function isSackSubTypeUnlocked(
  sackSubType: SackSubType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_SACK_KEY_SUB_TYPES, sackSubType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.SACK &&
      achievement.sackSubType === sackSubType,
  );
}

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_CHEST_PICKUP_VARIANTS, pickupVariant)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.CHEST &&
      achievement.pickupVariant === pickupVariant,
  );
}

// ----------------------------
// Achievement - Slot functions
// ----------------------------

export function isSlotVariantUnlocked(
  slotVariant: SlotVariant,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_SLOT_VARIANTS, slotVariant)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.SLOT &&
      achievement.slotVariant === slotVariant,
  );
}

// -----------------------------------
// Achievement - Grid entity functions
// -----------------------------------

export function isGridEntityTypeUnlocked(
  gridEntityType: GridEntityType,
  forRun = true,
): boolean {
  if (!includes(UNLOCKABLE_GRID_ENTITY_TYPES, gridEntityType)) {
    return true;
  }

  const array = forRun
    ? v.persistent.completedAchievementsForRun
    : v.persistent.completedAchievements;

  return array.some(
    (achievement) =>
      achievement.type === AchievementType.GRID_ENTITY &&
      achievement.gridEntityType === gridEntityType,
  );
}

// -----------------------------
// Achievement - Other functions
// -----------------------------

export function isOtherAchievementUnlocked(
  otherAchievementKind: OtherAchievementKind,
): boolean {
  return v.persistent.completedAchievementsForRun.some(
    (achievement) =>
      achievement.type === AchievementType.OTHER &&
      achievement.kind === otherAchievementKind,
  );
}

// ---------------
// Debug functions
// ---------------

/** Only used for debugging. */
export function setCharacterUnlocked(character: PlayerType): void {
  const objective = findObjectiveForCharacterAchievement(character);
  if (objective === undefined) {
    const characterName = getCharacterName(character);
    error(`Failed to find the objective to unlock character: ${characterName}`);
  }

  addObjective(objective);
}

function findObjectiveForCharacterAchievement(
  character: PlayerType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToAchievementMap) {
    const [objectiveID, achievement] = entries;
    if (
      achievement.type === AchievementType.CHARACTER &&
      achievement.character === character
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

/** Only used for debugging. */
export function setCollectibleUnlocked(collectibleType: CollectibleType): void {
  const objective = findObjectiveForCollectibleAchievement(collectibleType);
  if (objective === undefined) {
    const collectibleName = getCollectibleName(collectibleType);
    error(
      `Failed to find the objective to unlock character: ${collectibleName}`,
    );
  }

  addObjective(objective);
}

function findObjectiveForCollectibleAchievement(
  collectibleType: CollectibleType,
): Objective | undefined {
  for (const entries of v.persistent.objectiveToAchievementMap) {
    const [objectiveID, achievement] = entries;
    if (
      achievement.type === AchievementType.COLLECTIBLE &&
      achievement.collectibleType === collectibleType
    ) {
      return getObjectiveFromID(objectiveID);
    }
  }

  return undefined;
}

// ----------
// Validation
// ----------

/** Emulate a player playing through this randomizer seed to see if every achievement can unlock. */
function isAchievementsBeatable(): boolean {
  v.persistent.completedAchievements = [];
  v.persistent.completedObjectives = [];

  while (v.persistent.completedAchievements.length < ALL_ACHIEVEMENTS.length) {
    let unlockedSomething = false;

    for (const character of MAIN_CHARACTERS) {
      if (!isCharacterUnlocked(character)) {
        continue;
      }

      for (const kind of CHARACTER_OBJECTIVE_KINDS) {
        if (
          canGetToCharacterObjectiveKind(kind) &&
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
        canGetToBoss(bossID, reachableNonStoryBossesSet) &&
        !isBossObjectiveCompleted(bossID)
      ) {
        const objective = getObjective(ObjectiveType.BOSS, bossID);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    for (const challenge of CHALLENGES) {
      if (
        challenge !== Challenge.NULL &&
        isChallengeUnlocked(challenge) &&
        !isChallengeObjectiveCompleted(challenge)
      ) {
        const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
        addObjective(objective, true);
        unlockedSomething = true;
      }
    }

    if (!unlockedSomething) {
      log(
        `Failed to emulate beating seed ${v.persistent.seed}: ${v.persistent.completedAchievements.length} / ${ALL_ACHIEVEMENTS.length}`,
      );
      logMissingObjectives();

      return false;
    }
  }

  return true;
}

function canGetToCharacterObjectiveKind(kind: CharacterObjectiveKind): boolean {
  switch (kind) {
    case CharacterObjectiveKind.MOM:
    case CharacterObjectiveKind.IT_LIVES:
    case CharacterObjectiveKind.ISAAC:
    case CharacterObjectiveKind.SATAN: {
      return true;
    }

    case CharacterObjectiveKind.BLUE_BABY: {
      return isPathUnlocked(UnlockablePath.CHEST);
    }

    case CharacterObjectiveKind.LAMB: {
      return isPathUnlocked(UnlockablePath.DARK_ROOM);
    }

    case CharacterObjectiveKind.MEGA_SATAN: {
      return isPathUnlocked(UnlockablePath.MEGA_SATAN);
    }

    case CharacterObjectiveKind.BOSS_RUSH: {
      return isPathUnlocked(UnlockablePath.BOSS_RUSH);
    }

    case CharacterObjectiveKind.HUSH: {
      return isPathUnlocked(UnlockablePath.BLUE_WOMB);
    }

    case CharacterObjectiveKind.DELIRIUM: {
      return (
        isPathUnlocked(UnlockablePath.BLUE_WOMB) &&
        isPathUnlocked(UnlockablePath.VOID)
      );
    }

    case CharacterObjectiveKind.MOTHER: {
      return isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS);
    }

    case CharacterObjectiveKind.BEAST: {
      return isPathUnlocked(UnlockablePath.ASCENT);
    }

    case CharacterObjectiveKind.ULTRA_GREED: {
      return isPathUnlocked(UnlockablePath.GREED_MODE);
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_1:
    case CharacterObjectiveKind.NO_HIT_BASEMENT_2:
    case CharacterObjectiveKind.NO_HIT_CAVES_1:
    case CharacterObjectiveKind.NO_HIT_CAVES_2:
    case CharacterObjectiveKind.NO_HIT_DEPTHS_1:
    case CharacterObjectiveKind.NO_HIT_DEPTHS_2:
    case CharacterObjectiveKind.NO_HIT_WOMB_1:
    case CharacterObjectiveKind.NO_HIT_WOMB_2:
    case CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL: {
      return true;
    }

    case CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST: {
      return (
        isPathUnlocked(UnlockablePath.CHEST) ||
        isPathUnlocked(UnlockablePath.DARK_ROOM)
      );
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_1:
    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_2:
    case CharacterObjectiveKind.NO_HIT_MINES_1:
    case CharacterObjectiveKind.NO_HIT_MINES_2:
    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_1:
    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_2:
    case CharacterObjectiveKind.NO_HIT_CORPSE_1:
    case CharacterObjectiveKind.NO_HIT_CORPSE_2: {
      return isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS);
    }
  }
}

function getReachableNonStoryBossesSet(): Set<BossID> {
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

function canGetToBoss(
  bossID: BossID,
  reachableBossesSet: Set<BossID>,
): boolean {
  switch (bossID) {
    // 6, 8, 24, 25, 39
    case BossID.MOM:
    case BossID.MOMS_HEART:
    case BossID.SATAN:
    case BossID.IT_LIVES:
    case BossID.ISAAC: {
      return true;
    }

    // 40
    case BossID.BLUE_BABY: {
      return isPathUnlocked(UnlockablePath.CHEST);
    }

    // 54
    case BossID.LAMB: {
      return isPathUnlocked(UnlockablePath.DARK_ROOM);
    }

    // 55
    case BossID.MEGA_SATAN: {
      return isPathUnlocked(UnlockablePath.MEGA_SATAN);
    }

    // 62, 71
    case BossID.ULTRA_GREED:
    case BossID.ULTRA_GREEDIER: {
      return isPathUnlocked(UnlockablePath.GREED_MODE);
    }

    // 63
    case BossID.HUSH: {
      return isPathUnlocked(UnlockablePath.BLUE_WOMB);
    }

    // 70
    case BossID.DELIRIUM: {
      return (
        isPathUnlocked(UnlockablePath.BLUE_WOMB) &&
        isPathUnlocked(UnlockablePath.VOID)
      );
    }

    // 88, 89, 90
    case BossID.MOTHER:
    case BossID.MAUSOLEUM_MOM:
    case BossID.MAUSOLEUM_MOMS_HEART: {
      return isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS);
    }

    // 99, 100
    case BossID.DOGMA:
    case BossID.BEAST: {
      return isPathUnlocked(UnlockablePath.ASCENT);
    }

    default: {
      return reachableBossesSet.has(bossID);
    }
  }
}

// -------
// Logging
// -------

function logMissingObjectives() {
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

  const line = "-".repeat(20);

  log(line, false);
  log(`Spoiler log for randomizer seed: ${v.persistent.seed}`, false);
  log(line, false);

  for (const entries of v.persistent.objectiveToAchievementMap) {
    const [objectiveID, achievement] = entries;
    const objective = getObjectiveFromID(objectiveID);

    const objectiveText = getObjectiveText(objective).join(" -");
    const achievementText = getAchievementText(achievement).join(" -");

    log(`${objectiveText} --> ${achievementText}`, false);
  }

  log(line, false);
}
