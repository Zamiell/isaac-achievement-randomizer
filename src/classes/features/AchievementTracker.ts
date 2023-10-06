import {
  BatterySubType,
  BombSubType,
  BossID,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  Difficulty,
  GridEntityType,
  HeartSubType,
  LevelStage,
  ModCallback,
  PickupVariant,
  PillEffect,
  PlayerType,
  SackSubType,
  SlotVariant,
  StageType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  KColorDefault,
  MAIN_CHARACTERS,
  ModCallbackCustom,
  ModFeature,
  ReadonlyMap,
  ReadonlySet,
  VectorZero,
  addSetsToSet,
  assertDefined,
  clearChallenge,
  copyArray,
  fonts,
  game,
  getBossSet,
  getChallengeBoss,
  getChallengeCharacter,
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
import {
  ALT_FLOORS,
  CHARACTER_OBJECTIVE_KINDS,
  STAGE_TYPES,
} from "../../cachedEnums";
import { AltFloor } from "../../enums/AltFloor";
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
import type { ObjectiveID } from "../../types/ObjectiveID";
import { getObjectiveID } from "../../types/ObjectiveID";
import type { Unlock } from "../../types/Unlock";
import { getUnlock, getUnlockText } from "../../types/Unlock";
import { getUnlockID } from "../../types/UnlockID";
import { UNLOCKABLE_CHALLENGES } from "../../unlockableChallenges";
import { ALL_UNLOCKS } from "../../unlocks";
import { showNewUnlock } from "./AchievementNotification";
import { preForcedRestart, resetStats } from "./StatsTracker";
import {
  getNonCompletedBossObjective,
  isBossObjectiveCompleted,
  isChallengeObjectiveCompleted,
  isCharacterObjectiveCompleted,
} from "./achievementTracker/completedObjectives";
import {
  anyBadPillEffectsUnlocked,
  anyCardTypesUnlocked,
  anyCardsUnlocked,
  anyGoodPillEffectsUnlocked,
  anyPillEffectsUnlocked,
  anyRunesUnlocked,
  anyTrinketTypesUnlocked,
  getWorseLockedCollectibleType,
  getWorseLockedPillEffect,
  isAltFloorUnlocked,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isChallengeUnlocked,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGridEntityTypeUnlocked,
  isHeartSubTypeUnlocked,
  isPathUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
  isStageTypeUnlocked,
} from "./achievementTracker/completedUnlocks";
import { isRandomizerEnabled, v } from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

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

const DEFAULT_TRINKET_UNLOCK = getUnlock(UnlockType.TRINKET, TrinketType.ERROR);

const DEFAULT_CARD_UNLOCK = getUnlock(UnlockType.CARD, CardType.FOOL);

const DEFAULT_PILL_UNLOCK = getUnlock(
  UnlockType.PILL_EFFECT,
  PillEffect.PARALYSIS,
);

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

function getUnlockMatchingObjective(objective: Objective): Unlock | undefined {
  const objectiveID = getObjectiveID(objective);

  for (const [thisObjectiveID, unlock] of v.persistent.objectiveToUnlockMap) {
    if (thisObjectiveID === objectiveID) {
      return unlock;
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
      log(
        `Checking unlock swap for: ${getUnlockText(originalUnlock).join(
          " - ",
        )}`,
      );
    }

    swappedUnlock = checkSwapProblematicAchievement(
      originalUnlock,
      objectiveID,
    );

    if (!emulating) {
      log(`Swapped unlock is: ${getUnlockText(swappedUnlock).join(" - ")}`);
    }
  } while (getUnlockID(originalUnlock) !== getUnlockID(swappedUnlock));

  v.persistent.completedUnlocks.push(swappedUnlock);

  if (!emulating) {
    log(`Granted unlock: ${getUnlockText(originalUnlock).join(" - ")}`);
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

function checkSwapProblematicAchievement(
  unlock: Unlock,
  objectiveID: ObjectiveID,
): Unlock {
  const swappedUnlock = getSwappedUnlock(unlock);
  if (swappedUnlock === undefined) {
    return unlock;
  }

  const swappedObjectiveID = findObjectiveIDForUnlock(swappedUnlock);
  assertDefined(
    swappedObjectiveID,
    `Failed to find the objective ID for swapped unlock: ${getUnlockText(
      swappedUnlock,
    )}`,
  );

  v.persistent.objectiveToUnlockMap.set(objectiveID, swappedUnlock);
  v.persistent.objectiveToUnlockMap.set(swappedObjectiveID, unlock);

  return swappedUnlock;
}

function getSwappedUnlock(unlock: Unlock): Unlock | undefined {
  switch (unlock.type) {
    case UnlockType.PATH: {
      switch (unlock.unlockablePath) {
        case UnlockablePath.VOID: {
          if (!isPathUnlocked(UnlockablePath.BLUE_WOMB, false)) {
            return getUnlock(UnlockType.PATH, UnlockablePath.BLUE_WOMB);
          }

          return undefined;
        }

        case UnlockablePath.ASCENT: {
          if (!isCardTypeUnlocked(CardType.FOOL, false)) {
            return getUnlock(UnlockType.CARD, CardType.FOOL);
          }

          return undefined;
        }

        case UnlockablePath.BLACK_MARKETS: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
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

    case UnlockType.ALT_FLOOR: {
      switch (unlock.altFloor) {
        case AltFloor.DROSS:
        case AltFloor.ASHPIT:
        case AltFloor.GEHENNA: {
          if (!isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS, false)) {
            return getUnlock(UnlockType.PATH, UnlockablePath.REPENTANCE_FLOORS);
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.CHALLENGE: {
      const challengeCharacter = getChallengeCharacter(unlock.challenge);
      if (!isCharacterUnlocked(challengeCharacter)) {
        return getUnlock(UnlockType.CHARACTER, challengeCharacter);
      }

      // All the challenge bosses are story bosses.
      const challengeBossID = getChallengeBoss(unlock.challenge);
      const unlockablePath = getUnlockablePathFromStoryBoss(challengeBossID);
      if (unlockablePath !== undefined && !isPathUnlocked(unlockablePath)) {
        return getUnlock(UnlockType.PATH, unlockablePath);
      }

      const requiredCollectibleTypes =
        CHALLENGE_REQUIRED_COLLECTIBLE_TYPES_MAP.get(unlock.challenge);
      if (requiredCollectibleTypes !== undefined) {
        for (const collectibleType of requiredCollectibleTypes) {
          if (!isCollectibleTypeUnlocked(collectibleType, false)) {
            return getUnlock(UnlockType.COLLECTIBLE, collectibleType);
          }
        }
      }

      return undefined;
    }

    case UnlockType.COLLECTIBLE: {
      // First, check to see if there is a worse collectible available to unlock.
      const worseCollectibleType = getWorseLockedCollectibleType(
        unlock.collectibleType,
      );
      if (worseCollectibleType !== undefined) {
        return getUnlock(UnlockType.COLLECTIBLE, worseCollectibleType);
      }

      switch (unlock.collectibleType) {
        // 75
        case CollectibleType.PHD: {
          if (!anyGoodPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 84
        case CollectibleType.WE_NEED_TO_GO_DEEPER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.CRAWL_SPACE,
            );
          }

          return undefined;
        }

        // 85
        case CollectibleType.DECK_OF_CARDS: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 102
        case CollectibleType.MOMS_BOTTLE_OF_PILLS: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 139
        case CollectibleType.MOMS_PURSE: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 195
        case CollectibleType.MOMS_COIN_PURSE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 203
        case CollectibleType.HUMBLING_BUNDLE: {
          if (!isCoinSubTypeUnlocked(CoinSubType.DOUBLE_PACK, false)) {
            return getUnlock(UnlockType.COIN, CoinSubType.DOUBLE_PACK);
          }

          return undefined;
        }

        // 210
        case CollectibleType.GNAWED_LEAF: {
          const nonCompletedBossObjective = getNonCompletedBossObjective();
          if (nonCompletedBossObjective !== undefined) {
            const matchingUnlock = getUnlockMatchingObjective(
              nonCompletedBossObjective,
            );
            if (matchingUnlock !== undefined) {
              return matchingUnlock;
            }
          }

          return undefined;
        }

        // 250
        case CollectibleType.BOGO_BOMBS: {
          if (!isBombSubTypeUnlocked(BombSubType.DOUBLE_PACK, false)) {
            return getUnlock(UnlockType.BOMB, BombSubType.DOUBLE_PACK);
          }

          return undefined;
        }

        // 251
        case CollectibleType.STARTER_DECK: {
          if (!anyCardTypesUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 252
        case CollectibleType.LITTLE_BAGGY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 263
        case CollectibleType.CLEAR_RUNE: {
          if (!anyRunesUnlocked(false)) {
            return getUnlock(UnlockType.CARD, CardType.RUNE_BLANK);
          }

          return undefined;
        }

        // 286
        case CollectibleType.BLANK_CARD: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 348
        case CollectibleType.PLACEBO: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 424
        case CollectibleType.SACK_HEAD: {
          if (!isSackSubTypeUnlocked(SackSubType.NORMAL, false)) {
            return getUnlock(UnlockType.SACK, SackSubType.NORMAL);
          }

          return undefined;
        }

        // 439
        case CollectibleType.MOMS_BOX: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 451
        case CollectibleType.TAROT_CLOTH: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 458
        case CollectibleType.BELLY_BUTTON: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 479
        case CollectibleType.SMELTER: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 491
        case CollectibleType.ACID_BABY: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 538
        case CollectibleType.MARBLES: {
          if (!anyTrinketTypesUnlocked(false)) {
            return DEFAULT_TRINKET_UNLOCK;
          }

          return undefined;
        }

        // 566
        case CollectibleType.DREAM_CATCHER: {
          for (const altFloor of ALT_FLOORS) {
            if (!isAltFloorUnlocked(altFloor, false)) {
              return getUnlock(UnlockType.ALT_FLOOR, altFloor);
            }
          }

          return undefined;
        }

        // 603
        case CollectibleType.BATTERY_PACK: {
          if (!isBatterySubTypeUnlocked(BatterySubType.NORMAL, false)) {
            return getUnlock(UnlockType.BATTERY, BatterySubType.NORMAL);
          }

          return undefined;
        }

        // 624
        case CollectibleType.BOOSTER_PACK: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 654
        case CollectibleType.FALSE_PHD: {
          if (!anyBadPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.TRINKET: {
      switch (unlock.trinketType) {
        // 22
        case TrinketType.DAEMONS_TAIL: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BLACK, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BLACK);
          }

          return undefined;
        }

        // 44
        case TrinketType.SAFETY_CAP: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 45
        case TrinketType.ACE_OF_SPADES: {
          if (!anyCardsUnlocked(false)) {
            return DEFAULT_CARD_UNLOCK;
          }

          return undefined;
        }

        // 61
        case TrinketType.LEFT_HAND: {
          if (!isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, false)) {
            return getUnlock(UnlockType.CHEST, PickupVariant.RED_CHEST);
          }

          return undefined;
        }

        // 131
        case TrinketType.BLESSED_PENNY: {
          if (!isHeartSubTypeUnlocked(HeartSubType.HALF_SOUL, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.HALF_SOUL);
          }

          return undefined;
        }

        // 159
        case TrinketType.GILDED_KEY: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST);
          }

          return undefined;
        }

        // 168
        case TrinketType.HOLLOW_HEART: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        default: {
          return undefined;
        }
      }
    }

    case UnlockType.CARD: {
      switch (unlock.cardType) {
        // 6
        case CardType.HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.SOUL, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.SOUL);
          }

          return undefined;
        }

        // 11
        case CardType.WHEEL_OF_FORTUNE: {
          if (!isSlotVariantUnlocked(SlotVariant.SLOT_MACHINE, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.SLOT_MACHINE);
          }

          return undefined;
        }

        // 15
        case CardType.TEMPERANCE: {
          if (
            !isSlotVariantUnlocked(SlotVariant.BLOOD_DONATION_MACHINE, false)
          ) {
            return getUnlock(
              UnlockType.SLOT,
              SlotVariant.BLOOD_DONATION_MACHINE,
            );
          }

          return undefined;
        }

        // 21
        case CardType.JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.BEGGAR, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.BEGGAR);
          }

          return undefined;
        }

        // 6
        case CardType.REVERSE_HIEROPHANT: {
          if (!isHeartSubTypeUnlocked(HeartSubType.BONE, false)) {
            return getUnlock(UnlockType.HEART, HeartSubType.BONE);
          }

          return undefined;
        }

        // 64
        case CardType.REVERSE_JUSTICE: {
          if (
            !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, false)
          ) {
            return getUnlock(UnlockType.CHEST, PickupVariant.LOCKED_CHEST);
          }

          return undefined;
        }

        // 70
        case CardType.REVERSE_TEMPERANCE: {
          if (!anyPillEffectsUnlocked(false)) {
            return DEFAULT_PILL_UNLOCK;
          }

          return undefined;
        }

        // 72
        case CardType.REVERSE_TOWER: {
          if (!isGridEntityTypeUnlocked(GridEntityType.ROCK_TINTED, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
              GridEntityType.ROCK_TINTED,
            );
          }

          return undefined;
        }

        // 76
        case CardType.REVERSE_JUDGEMENT: {
          if (!isSlotVariantUnlocked(SlotVariant.SHOP_RESTOCK_MACHINE, false)) {
            return getUnlock(UnlockType.SLOT, SlotVariant.SHOP_RESTOCK_MACHINE);
          }

          return undefined;
        }

        // 77
        case CardType.REVERSE_WORLD: {
          if (!isGridEntityTypeUnlocked(GridEntityType.CRAWL_SPACE, false)) {
            return getUnlock(
              UnlockType.GRID_ENTITY,
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

    case UnlockType.PILL_EFFECT: {
      // Check to see if there is a worse pill effect to unlock.
      const worsePillEffect = getWorseLockedPillEffect(unlock.pillEffect);
      if (worsePillEffect !== undefined) {
        return getUnlock(UnlockType.PILL_EFFECT, worsePillEffect);
      }

      return undefined;
    }

    default: {
      return undefined;
    }
  }
}

function findObjectiveIDForUnlock(
  unlockToMatch: Unlock,
): ObjectiveID | undefined {
  for (const entries of v.persistent.objectiveToUnlockMap) {
    const [objectiveID, unlock] = entries;

    switch (unlock.type) {
      case UnlockType.CHARACTER: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.character === unlockToMatch.character
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.PATH: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.unlockablePath === unlockToMatch.unlockablePath
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.ALT_FLOOR: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.altFloor === unlockToMatch.altFloor
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CHALLENGE: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.challenge === unlockToMatch.challenge
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.COLLECTIBLE: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.collectibleType === unlockToMatch.collectibleType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.TRINKET: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.trinketType === unlockToMatch.trinketType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CARD: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.cardType === unlockToMatch.cardType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.PILL_EFFECT: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.pillEffect === unlockToMatch.pillEffect
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.HEART: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.heartSubType === unlockToMatch.heartSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.COIN: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.coinSubType === unlockToMatch.coinSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.BOMB: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.bombSubType === unlockToMatch.bombSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.KEY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.keySubType === unlockToMatch.keySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.BATTERY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.batterySubType === unlockToMatch.batterySubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.SACK: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.sackSubType === unlockToMatch.sackSubType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.CHEST: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.pickupVariant === unlockToMatch.pickupVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.SLOT: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.slotVariant === unlockToMatch.slotVariant
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.GRID_ENTITY: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.gridEntityType === unlockToMatch.gridEntityType
        ) {
          return objectiveID;
        }

        break;
      }

      case UnlockType.OTHER: {
        if (
          unlock.type === unlockToMatch.type &&
          unlock.kind === unlockToMatch.kind
        ) {
          return objectiveID;
        }

        break;
      }
    }
  }

  return undefined;
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
