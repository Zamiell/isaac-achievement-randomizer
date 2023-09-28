import type {
  BatterySubType,
  CardType,
  PillEffect,
  SackSubType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  BombSubType,
  BossID,
  CallbackPriority,
  Challenge,
  CoinSubType,
  CollectibleType,
  HeartSubType,
  ItemConfigTag,
  KeySubType,
  ModCallback,
  PickupVariant,
  PlayerType,
  SlotVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  DefaultMap,
  GAME_FRAMES_PER_SECOND,
  ModFeature,
  PriorityCallback,
  collectibleHasTag,
  filterMap,
  game,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  getRandomSeed,
  isActiveCollectible,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  log,
  restart,
} from "isaacscript-common";
import { getAchievementsForSeed } from "../../achievementAssignment";
import { CHARACTER_OBJECTIVE_KINDS } from "../../cachedEnums";
import { AchievementType } from "../../enums/AchievementType";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { UnlockablePath } from "../../enums/UnlockablePath";
import { convertSecondsToTimerValues } from "../../timer";
import type { Achievement } from "../../types/Achievement";
import { OtherAchievementKind } from "../../types/Achievement";
import type { Objective } from "../../types/Objective";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../unlockableCollectibleTypes";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../unlockableTrinketTypes";
import { showNewAchievement } from "./AchievementText";

const STARTING_CHARACTER = PlayerType.ISAAC;

/** `isaacscript-common` uses `CallbackPriority.IMPORTANT` (-200). */
const HIGHER_PRIORITY_THAN_ISAACSCRIPT_COMMON = (CallbackPriority.IMPORTANT -
  1) as CallbackPriority;

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
    bossAchievements: new Map<BossID, Achievement>(),
    challengeAchievements: new Map<Challenge, Achievement>(),

    completedObjectives: [] as Objective[],
    completedAchievements: [] as Achievement[],
  },

  run: {
    shouldIncrementTime: true,
    shouldIncrementDeathCounter: true,
  },
};

/** This does not extend from `RandomizerModFeature` to avoid a dependency cycle. */
export class AchievementTracker extends ModFeature {
  v = v;

  // 16
  @Callback(ModCallback.POST_GAME_END)
  postGameEnd(isGameOver: boolean): void {
    if (v.persistent.seed === null) {
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
    if (v.persistent.seed === null) {
      return;
    }

    this.incrementTime();
    this.incrementDeathCounter();
  }

  incrementTime(): void {
    if (!v.run.shouldIncrementTime) {
      v.run.shouldIncrementTime = true;
      return;
    }

    v.persistent.gameFramesElapsed += game.GetFrameCount();
  }

  incrementDeathCounter(): void {
    if (!v.run.shouldIncrementDeathCounter) {
      v.run.shouldIncrementDeathCounter = true;
      return;
    }

    v.persistent.numDeaths++;
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
  log(`Set new seed: ${v.persistent.seed}`);

  const { characterAchievements, bossAchievements, challengeAchievements } =
    getAchievementsForSeed(seed);

  v.persistent.numDeaths = 0;
  v.persistent.gameFramesElapsed = 0;
  v.persistent.characterAchievements = characterAchievements;
  v.persistent.bossAchievements = bossAchievements;
  v.persistent.challengeAchievements = challengeAchievements;
  v.persistent.completedAchievements = [];
  v.persistent.completedObjectives = [];

  preForcedRestart();
  restart(STARTING_CHARACTER);
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
  const { hour1, hour2, minute1, minute2, second1, second2 } =
    convertSecondsToTimerValues(seconds);

  return `${hour1}${hour2}:${minute1}${minute2}:${second1}${second2}`;
}

export function preForcedRestart(): void {
  v.run.shouldIncrementTime = false;
  v.run.shouldIncrementDeathCounter = false;
}

export function addAchievementCharacterObjective(
  character: PlayerType,
  characterObjectiveKind: CharacterObjectiveKind,
): void {
  if (isCharacterObjectiveCompleted(character, characterObjectiveKind)) {
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

export function addAchievementBoss(bossID: BossID): void {
  if (isBossObjectiveCompleted(bossID)) {
    return;
  }

  const achievement = v.persistent.bossAchievements.get(bossID);
  if (achievement === undefined) {
    const bossIDName = `${BossID[bossID]} (${bossID})`;
    error(`Failed to get the achievement for boss: ${bossIDName}`);
  }
  v.persistent.completedAchievements.push(achievement);

  const objective: Objective = {
    type: ObjectiveType.BOSS,
    bossID,
  };
  v.persistent.completedObjectives.push(objective);

  showNewAchievement(achievement);
}

export function addAchievementChallenge(challenge: Challenge): void {
  if (challenge === Challenge.NULL) {
    return;
  }

  if (isChallengeObjectiveCompleted(challenge)) {
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

export function isCharacterObjectiveCompleted(
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

// --------------
// Path functions
// --------------

export function isPathUnlocked(unlockablePath: UnlockablePath): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.PATH &&
      achievement.unlockablePath === unlockablePath,
  );
}

// --------------
// Boss functions
// --------------

export function isBossObjectiveCompleted(bossID: BossID): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.BOSS && objective.bossID === bossID,
  );
}

// -------------------
// Challenge functions
// -------------------

export function isChallengeUnlocked(challenge: Challenge): boolean {
  if (challenge === Challenge.NULL) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.CHALLENGE &&
      achievement.challenge === challenge,
  );
}

export function isChallengeObjectiveCompleted(challenge: Challenge): boolean {
  return v.persistent.completedObjectives.some(
    (objective) =>
      objective.type === ObjectiveType.CHALLENGE &&
      objective.challenge === challenge,
  );
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

  return v.persistent.completedAchievements.some(
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

function getUnlockedCollectibleTypes(): CollectibleType[] {
  return filterMap(v.persistent.completedAchievements, (achievement) =>
    achievement.type === AchievementType.COLLECTIBLE
      ? achievement.collectibleType
      : undefined,
  );
}

// -----------------
// Trinket functions
// -----------------

export function isTrinketTypeUnlocked(trinketType: TrinketType): boolean {
  if (ALWAYS_UNLOCKED_TRINKET_TYPES.has(trinketType)) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.TRINKET &&
      achievement.trinketType === trinketType,
  );
}

export function getUnlockedTrinketTypes(): TrinketType[] {
  return filterMap(v.persistent.completedAchievements, (achievement) =>
    achievement.type === AchievementType.TRINKET
      ? achievement.trinketType
      : undefined,
  );
}

// --------------
// Card functions
// --------------

export function anyCardTypesUnlocked(): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) => achievement.type === AchievementType.CARD,
  );
}

export function isCardTypeUnlocked(cardType: CardType): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.CARD &&
      achievement.cardType === cardType,
  );
}

export function getUnlockedCardTypes(): CardType[] {
  return filterMap(v.persistent.completedAchievements, (achievement) =>
    achievement.type === AchievementType.CARD
      ? achievement.cardType
      : undefined,
  );
}

// --------------
// Pill functions
// --------------

export function anyPillEffectsUnlocked(): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) => achievement.type === AchievementType.PILL_EFFECT,
  );
}

export function isPillEffectUnlocked(pillEffect: PillEffect): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.PILL_EFFECT &&
      achievement.pillEffect === pillEffect,
  );
}

export function getUnlockedPillEffects(): PillEffect[] {
  return filterMap(v.persistent.completedAchievements, (achievement) =>
    achievement.type === AchievementType.PILL_EFFECT
      ? achievement.pillEffect
      : undefined,
  );
}

export function isGoldPillUnlocked(): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.OTHER &&
      achievement.kind === OtherAchievementKind.GOLD_PILLS,
  );
}

export function isHorsePillsUnlocked(): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.OTHER &&
      achievement.kind === OtherAchievementKind.HORSE_PILLS,
  );
}

// ----------------------
// Other pickup functions
// ----------------------

export function isHeartSubTypeUnlocked(heartSubType: HeartSubType): boolean {
  // Half red hearts are always unlocked.
  if (heartSubType === HeartSubType.HALF) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.HEART &&
      achievement.heartSubType === heartSubType,
  );
}

export function isCoinSubTypeUnlocked(coinSubType: CoinSubType): boolean {
  // Pennies hearts always start out as being unlocked.
  if (coinSubType === CoinSubType.PENNY) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.COIN &&
      achievement.coinSubType === coinSubType,
  );
}

export function isBombSubTypeUnlocked(bombSubType: BombSubType): boolean {
  // Normal bomb drops, all troll bombs, and Giga Bombs start out as being unlocked.
  if (
    bombSubType === BombSubType.NORMAL ||
    bombSubType === BombSubType.TROLL ||
    bombSubType === BombSubType.MEGA_TROLL ||
    bombSubType === BombSubType.GOLDEN_TROLL ||
    bombSubType === BombSubType.GIGA
  ) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.BOMB &&
      achievement.bombSubType === bombSubType,
  );
}

export function isKeySubTypeUnlocked(keySubType: KeySubType): boolean {
  // Normal key drops always start out as being unlocked.
  if (keySubType === KeySubType.NORMAL) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.KEY &&
      achievement.keySubType === keySubType,
  );
}

export function isBatterySubTypeUnlocked(
  batterySubType: BatterySubType,
): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.BATTERY &&
      achievement.batterySubType === batterySubType,
  );
}

export function isSackSubTypeUnlocked(sackSubType: SackSubType): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.SACK &&
      achievement.sackSubType === sackSubType,
  );
}

export function isChestPickupVariantUnlocked(
  pickupVariant: PickupVariant,
): boolean {
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

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.CHEST &&
      achievement.pickupVariant === pickupVariant,
  );
}

// --------------
// Slot functions
// --------------

export function isSlotVariantUnlocked(slotVariant: SlotVariant): boolean {
  // Ignore quest slots.
  if (
    slotVariant === SlotVariant.DONATION_MACHINE ||
    slotVariant === SlotVariant.GREED_DONATION_MACHINE ||
    slotVariant === SlotVariant.ISAAC_SECRET
  ) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.SLOT &&
      achievement.slotVariant === slotVariant,
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

  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      addAchievementCharacterObjective(objective.character, objective.kind);
      break;
    }

    case ObjectiveType.BOSS: {
      addAchievementBoss(objective.bossID);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      addAchievementChallenge(objective.challenge);
      break;
    }
  }
}

function findObjectiveForCharacterAchievement(
  character: PlayerType,
): Objective | undefined {
  for (const [thisCharacter, characterAchievements] of v.persistent
    .characterAchievements) {
    for (const [characterObjectiveKind, achievement] of characterAchievements) {
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

/** Only used for debugging. */
export function setCollectibleUnlocked(collectibleType: CollectibleType): void {
  const objective = findObjectiveForCollectibleAchievement(collectibleType);
  if (objective === undefined) {
    const collectibleName = getCollectibleName(collectibleType);
    error(
      `Failed to find the objective to unlock character: ${collectibleName}`,
    );
  }

  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      addAchievementCharacterObjective(objective.character, objective.kind);
      break;
    }

    case ObjectiveType.BOSS: {
      addAchievementBoss(objective.bossID);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      addAchievementChallenge(objective.challenge);
      break;
    }
  }
}

function findObjectiveForCollectibleAchievement(
  collectibleType: CollectibleType,
): Objective | undefined {
  for (const [thisCharacter, characterAchievements] of v.persistent
    .characterAchievements) {
    for (const [characterObjectiveKind, achievement] of characterAchievements) {
      if (
        achievement.type === AchievementType.COLLECTIBLE &&
        achievement.collectibleType === collectibleType
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
      achievement.type === AchievementType.COLLECTIBLE &&
      achievement.collectibleType === collectibleType
    ) {
      return {
        type: ObjectiveType.CHALLENGE,
        challenge,
      };
    }
  }

  return undefined;
}
