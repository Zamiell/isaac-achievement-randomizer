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
  getChallengeName,
  getCharacterName,
  getRandomSeed,
  log,
  restart,
} from "isaacscript-common";
import { getAchievementsForSeed } from "../../achievementAssignment";
import { showNewAchievement } from "../../achievementUnlock";
import { CHARACTER_OBJECTIVE_KINDS } from "../../cachedEnums";
import { AchievementType } from "../../enums/AchievementType";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { UnlockablePath } from "../../enums/UnlockablePath";
import type { Achievement } from "../../types/Achievement";
import type { Objective } from "../../types/Objective";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../unlockableCollectibleTypes";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../unlockableTrinketTypes";

const STARTING_CHARACTER = PlayerType.ISAAC;

export const NUM_TOTAL_ACHIEVEMENTS = 1132;

const v = {
  persistent: {
    /** If `null`, the randomizer is not enabled. */
    seed: null as Seed | null,

    numDeaths: 0,
    gameFramesElapsed: 0,

    characterAchievements: new DefaultMap<
      PlayerType,
      Map<CharacterObjectiveKind, Achievement>
    >(() => new Map()),
    challengeAchievements: new Map<Challenge, Achievement>(),

    completedAchievements: [] as Achievement[],
    completedObjectives: [] as Objective[],

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

  const { characterAchievements, challengeAchievements } =
    getAchievementsForSeed(seed);

  v.persistent.numDeaths = 0;
  v.persistent.gameFramesElapsed = 0;
  v.persistent.characterAchievements = characterAchievements;
  v.persistent.challengeAchievements = challengeAchievements;
  v.persistent.completedAchievements = [];
  v.persistent.completedObjectives = [];

  restart(STARTING_CHARACTER);
}

export function endRandomizer(): void {
  v.persistent.seed = null;
  // (We only clear the other persistent variables when a new randomizer is initialized.)

  restart(STARTING_CHARACTER);
}

export function getNumCompletedAchievements(): int {
  return v.persistent.completedAchievements.length;
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
  character: PlayerType,
  characterObjectiveKind: CharacterObjectiveKind,
): void {
  if (hasCompletedCharacterObjective(character, characterObjectiveKind)) {
    return;
  }

  const thisCharacterAchievements =
    v.persistent.characterAchievements.getAndSetDefault(character);
  const achievement = thisCharacterAchievements.get(characterObjectiveKind);
  if (achievement === undefined) {
    const characterName = getCharacterName(character);
    error(
      `Failed to get the achievement for a character of ${characterName} for: CharacterObjectiveKind.${CharacterObjectiveKind[characterObjectiveKind]} (${characterObjectiveKind})`,
    );
  }
  v.persistent.completedAchievements.push(achievement);

  const objective: Objective = {
    type: ObjectiveType.CHARACTER,
    character,
    kind: characterObjectiveKind,
  };
  v.persistent.completedObjectives.push(objective);

  showNewAchievement(achievement);
}

function hasCompletedCharacterObjective(
  character: PlayerType,
  characterObjectiveKind: CharacterObjectiveKind,
): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character &&
      objective.kind === characterObjectiveKind,
  );
}

export function addAchievementChallenge(challenge: Challenge): void {
  if (challenge === Challenge.NULL) {
    return;
  }

  if (hasCompletedChallengeObjective(challenge)) {
    return;
  }

  const achievement = v.persistent.challengeAchievements.get(challenge);
  if (achievement === undefined) {
    const challengeName = getChallengeName(challenge);
    error(
      `Failed to get the achievement for the challenge: ${challengeName} (${challenge})`,
    );
  }
  v.persistent.completedAchievements.push(achievement);

  const objective: Objective = {
    type: ObjectiveType.CHALLENGE,
    challenge,
  };
  v.persistent.completedObjectives.push(objective);

  showNewAchievement(achievement);
}

function hasCompletedChallengeObjective(challenge: Challenge): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
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

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.CHARACTER &&
      achievement.character === character,
  );
}

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

/** Only used for debugging. */
export function setCharacterUnlocked(character: PlayerType): void {
  const objective = findCharacterAchievement(character);
  if (objective === undefined) {
    const characterName = getCharacterName(character);
    error(
      `Failed to find the achievement to unlock character: ${characterName}`,
    );
  }

  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      addAchievementCharacterObjective(objective.character, objective.kind);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      addAchievementChallenge(objective.challenge);
      break;
    }
  }
}

function findCharacterAchievement(
  character: PlayerType,
): Objective | undefined {
  for (const [thisCharacter, thisCharacterAchievements] of v.persistent
    .characterAchievements) {
    for (const [
      characterObjectiveKind,
      achievement,
    ] of thisCharacterAchievements) {
      if (
        achievement.type === AchievementType.CHARACTER &&
        achievement.character === character
      ) {
        return {
          type: ObjectiveType.CHARACTER,
          character: thisCharacter,
          kind: characterObjectiveKind,
        };
      }
    }
  }

  for (const [challenge, achievement] of v.persistent.challengeAchievements) {
    if (
      achievement.type === AchievementType.CHARACTER &&
      achievement.character === character
    ) {
      return {
        type: ObjectiveType.CHALLENGE,
        challenge,
      };
    }
  }

  return undefined;
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

export function getUnlockedEdenActiveCollectibleTypes(): CollectibleType[] {
  // TODO
  return [];
}

export function getUnlockedEdenPassiveCollectibleTypes(): CollectibleType[] {
  // TODO
  return [];
}

// -----------------
// Trinket functions
// -----------------

export function isTrinketTypeUnlocked(trinketType: TrinketType): boolean {
  if (ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType)) {
    return true;
  }

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
  return false;
}

export function isCoinSubTypeUnlocked(coinSubType: CoinSubType): boolean {
  // Pennies hearts always start out as being unlocked.
  if (coinSubType === CoinSubType.PENNY) {
    return true;
  }

  // TODO
  return false;
}

export function isBombSubTypeUnlocked(bombSubType: BombSubType): boolean {
  // Normal bomb drops always start out as being unlocked.
  if (bombSubType === BombSubType.NORMAL) {
    return true;
  }

  // TODO
  return false;
}

export function isKeySubTypeUnlocked(keySubType: KeySubType): boolean {
  // Normal key drops always start out as being unlocked.
  if (keySubType === KeySubType.NORMAL) {
    return true;
  }

  // TODO
  return false;
}

export function isBatterySubTypeUnlocked(
  _batterySubType: BatterySubType,
): boolean {
  // TODO
  return false;
}

export function isSackSubTypeUnlocked(_sackSubType: SackSubType): boolean {
  // TODO
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

  // TODO
  return false;
}
