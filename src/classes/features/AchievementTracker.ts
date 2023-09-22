import type {
  BatterySubType,
  CardType,
  CollectibleType,
  PillEffect,
  SackSubType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  BombSubType,
  Challenge,
  CoinSubType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PlayerType,
} from "isaac-typescript-definitions";
import {
  DefaultMap,
  GAME_FRAMES_PER_SECOND,
  ModFeature,
  game,
  getRandomSeed,
  log,
  restart,
} from "isaacscript-common";
import type { CharacterObjective } from "../../enums/CharacterObjective";
import type { UnlockablePath } from "../../enums/UnlockablePath";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../unlockableCollectibleTypes";

const STARTING_CHARACTER = PlayerType.ISAAC;

export const NUM_TOTAL_ACHIEVEMENTS = 1132;

const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,

    numDeaths: 0,
    gameFramesElapsed: 0,

    completedCharacterObjectives: new DefaultMap<
      PlayerType,
      Set<CharacterObjective>
    >(() => new Set()),
    completedChallenges: new Set<Challenge>(),
    numAchievements: 0,

    config: {
      showTimer: false,
    },
  },
};

export class AchievementTracker extends ModFeature {
  v = v;
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
  log(`Set new seed: ${v.persistent.seed}`);

  // TODO: set persistent variables

  restart(STARTING_CHARACTER);
}

export function endRandomizer(): void {
  v.persistent.seed = null;

  // TODO: empty persistent variables

  restart(STARTING_CHARACTER);
}

export function getNumAchievements(): int {
  return v.persistent.numAchievements;
}

export function getNumDeaths(): int {
  return v.persistent.numDeaths;
}

export function getSecondsElapsed(): int {
  const gameFrameCount = game.GetFrameCount();
  const totalFrames = v.persistent.gameFramesElapsed + gameFrameCount;

  return totalFrames / GAME_FRAMES_PER_SECOND;
}

export function addAchievementCharacterObjective(
  characterObjective: CharacterObjective,
): void {
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();
  const characterObjectives =
    v.persistent.completedCharacterObjectives.getAndSetDefault(character);

  if (characterObjectives.has(characterObjective)) {
    return;
  }

  characterObjectives.add(characterObjective);
  v.persistent.numAchievements++;
  // TODO
}

export function addAchievementChallenge(challenge: Challenge): void {
  if (challenge === Challenge.NULL) {
    return;
  }

  if (v.persistent.completedChallenges.has(challenge)) {
    return;
  }

  v.persistent.completedChallenges.add(challenge);
  v.persistent.numAchievements++;
  // TODO
}

// ----------------
// Config functions
// ----------------

export function shouldShowTimer(): boolean {
  return v.persistent.config.showTimer;
}

// -------------------
// Character functions
// -------------------

export function isCharacterUnlocked(character: PlayerType): boolean {
  // Isaac is always unlocked.
  if (character === PlayerType.ISAAC) {
    return true;
  }

  // TODO
  return false;
}

// --------------
// Path functions
// --------------

export function isPathUnlocked(_unlockablePath: UnlockablePath): boolean {
  // TODO
  return false;
}

// -------------------
// Challenge functions
// -------------------

export function isChallengeUnlocked(challenge: Challenge): boolean {
  if (challenge === Challenge.NULL) {
    return true;
  }

  // TODO
  return false;
}

// ---------------------
// Collectible functions
// ---------------------

export function isCollectibleTypeUnlocked(
  collectibleType: CollectibleType,
): boolean {
  if (ALWAYS_UNLOCKED_COLLECTIBLE_TYPES.has(collectibleType)) {
    return true;
  }

  // TODO
  return false;
}

// -----------------
// Trinket functions
// -----------------

export function isTrinketTypeUnlocked(_trinketType: TrinketType): boolean {
  // TODO
  return false;
}

export function getUnlockedTrinketTypes(): ReadonlySet<TrinketType> {
  // TODO
  return new Set();
}

// --------------
// Card functions
// --------------

export function anyCardTypesUnlocked(): boolean {
  // TODO
  return false;
}

export function isCardTypeUnlocked(_cardType: CardType): boolean {
  // TODO
  return false;
}

export function getUnlockedCardTypes(): ReadonlySet<CardType> {
  // TODO
  return new Set();
}

// --------------
// Pill functions
// --------------

export function anyPillEffectsUnlocked(): boolean {
  // TODO
  return false;
}

export function isPillEffectUnlocked(_pillEffect: PillEffect): boolean {
  // TODO
  return false;
}

export function getUnlockedPillEffects(): ReadonlySet<PillEffect> {
  // TODO
  return new Set();
}

export function isGoldPillUnlocked(): boolean {
  // TODO
  return false;
}

export function isHorsePillsUnlocked(): boolean {
  // TODO
  return false;
}

// ----------------------
// Other pickup functions
// ----------------------

export function isHeartSubTypeUnlocked(heartSubType: HeartSubType): boolean {
  // Half red hearts are always unlocked.
  if (heartSubType === HeartSubType.HALF) {
    return true;
  }

  // TODO
  // - Red Heart (5.10.1)
  // - Soul Heart (5.10.3)
  // - Eternal Heart (5.10.4)
  // - Double Heart (5.10.5)
  // - Black Heart (5.10.6)
  // - Gold Heart (5.10.7)
  // - Half Soul Heart (5.10.8)
  // - Scared Heart (5.10.9)
  // - Blended Heart (5.10.10)
  // - Bone Heart (5.10.11)
  // - Rotten Heart (5.10.12)
  return false;
}

export function isCoinSubTypeUnlocked(coinSubType: CoinSubType): boolean {
  // Pennies hearts always start out as being unlocked.
  if (coinSubType === CoinSubType.PENNY) {
    return true;
  }

  // TODO
  // - Nickel (5.20.2)
  // - Dime (5.20.3)
  // - Double Penny (5.20.4)
  // - Lucky Penny (5.20.5)
  // - Sticky Nickel (5.20.6)
  // - Golden Penny (5.20.7)
  return false;
}

export function isBombSubTypeUnlocked(bombSubType: BombSubType): boolean {
  // Normal bomb drops always start out as being unlocked.
  if (bombSubType === BombSubType.NORMAL) {
    return true;
  }

  // TODO
  // - Double Bomb (5.40.2)
  // - (Troll Bombs are 5.40.3.)
  // - Golden Bomb (5.40.4)
  // - (Mega Troll Bombs are 5.40.5.)
  // - (Golden Troll Bombs are 5.40.6.)
  // - (Giga Bombs are 5.40.7.)
  return false;
}

export function isKeySubTypeUnlocked(keySubType: KeySubType): boolean {
  // Normal key drops always start out as being unlocked.
  if (keySubType === KeySubType.NORMAL) {
    return true;
  }

  // TODO
  // - Golden Key (5.30.2)
  // - Key Ring (5.30.3)
  // - Charged Key (5.30.4)
  return false;
}

export function isBatterySubTypeUnlocked(
  _batterySubType: BatterySubType,
): boolean {
  // TODO
  // - Micro Battery (5.90.2)
  // - Lil' Battery (5.90.1)
  // - Mega Battery (5.90.3)
  // - Golden Battery (5.90.4)
  return false;
}

export function isSackSubTypeUnlocked(_sackSubType: SackSubType): boolean {
  // TODO
  // - Grab Bag (5.69.1)
  // - Black Sack (5.69.2)
  return false;
}

export function isChestVariantUnlocked(pickupVariant: PickupVariant): boolean {
  // Normal chests always start out as being unlocked.
  if (pickupVariant === PickupVariant.CHEST) {
    return true;
  }

  // Other types of chests do not randomly spawn.
  if (
    pickupVariant === PickupVariant.OLD_CHEST || // 55
    pickupVariant === PickupVariant.MOMS_CHEST // 390
  ) {
    return true;
  }

  // - Locked Chest (5.60)
  // - Red Chest (5.360)
  // - Bomb Chest (5.51)
  // - Eternal Chest (5.53)
  // - Spiked Chest (5.52)
  // - Mimic Chest (5.54)
  // - Wooden Chest (5.56)
  // - Mega Chest (5.57)
  // - Haunted Chest (5.58)
  return false;
}
