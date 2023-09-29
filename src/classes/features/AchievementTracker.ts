import type {
  BatterySubType,
  CardType,
  GridEntityType,
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
  SeedEffect,
  SlotVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  DefaultMap,
  GAME_FRAMES_PER_SECOND,
  KColorDefault,
  MAIN_CHARACTERS,
  ModFeature,
  PriorityCallback,
  VectorZero,
  collectibleHasTag,
  filterMap,
  fonts,
  game,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  getRandomSeed,
  getScreenBottomRightPos,
  isActiveCollectible,
  isHiddenCollectible,
  isPassiveOrFamiliarCollectible,
  isRepentanceBoss,
  log,
  logError,
  newRNG,
  newSprite,
  restart,
} from "isaacscript-common";
import {
  ALL_BOSS_IDS,
  NUM_TOTAL_ACHIEVEMENTS,
  getAchievementsForRNG,
} from "../../achievementAssignment";
import { CHALLENGES, CHARACTER_OBJECTIVE_KINDS } from "../../cachedEnums";
import { AchievementType } from "../../enums/AchievementType";
import type { AltFloor } from "../../enums/AltFloor";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import type { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { UnlockablePath } from "../../enums/UnlockablePath";
import type { Achievements } from "../../interfaces/Achievements";
import { mod } from "../../mod";
import { convertSecondsToTimerValues } from "../../timer";
import type { Achievement } from "../../types/Achievement";
import { getAchievementText } from "../../types/Achievement";
import type { Objective } from "../../types/Objective";
import { ALWAYS_UNLOCKED_COLLECTIBLE_TYPES } from "../../unlockableCollectibleTypes";
import { UNLOCKABLE_GRID_ENTITY_TYPES } from "../../unlockableGridEntityTypes";
import { ALWAYS_UNLOCKED_TRINKET_TYPES } from "../../unlockableTrinketTypes";
import { showNewAchievement } from "./AchievementText";

const STARTING_CHARACTER = PlayerType.ISAAC;

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");

const FONT = fonts.droid;

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
  const seeds = game.GetSeeds();
  seeds.AddSeedEffect(SeedEffect.NO_HUD);
  BLACK_SPRITE.Render(VectorZero);

  const bottomRightPos = getScreenBottomRightPos();
  const position = bottomRightPos.mul(0.5);
  const text = "Randomizing, please wait...";
  const length = FONT.GetStringWidthUTF8(text);
  FONT.DrawString(text, position.X - length / 2, position.Y, KColorDefault);

  // We need to wait a frame for the text to be drawn to the screen.
  mod.runNextRenderFrame(() => {
    const seeds2 = game.GetSeeds();
    seeds2.RemoveSeedEffect(SeedEffect.NO_HUD);

    startRandomizer2(seed);
  });
}

function startRandomizer2(seed: Seed | undefined) {
  if (seed === undefined) {
    seed = getRandomSeed();
  }

  v.persistent.seed = seed;
  log(`Set new randomizer seed: ${v.persistent.seed}`);

  const rng = newRNG(seed);

  let numAttempts = 0;
  let achievements: Achievements;
  do {
    achievements = getAchievementsForRNG(rng);

    const { characterAchievements, bossAchievements, challengeAchievements } =
      achievements;

    v.persistent.numDeaths = 0;
    v.persistent.gameFramesElapsed = 0;
    v.persistent.characterAchievements = characterAchievements;
    v.persistent.bossAchievements = bossAchievements;
    v.persistent.challengeAchievements = challengeAchievements;
    v.persistent.completedAchievements = [];
    v.persistent.completedObjectives = [];

    numAttempts++;
    log(
      `Checking to see if randomizer seed ${seed} is beatable. Attempt: ${numAttempts}`,
    );
  } while (!isAchievementsBeatable());

  // We need to clear out the completed arrays because they were filled by the validation emulation.
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

export function addObjectiveCharacter(
  character: PlayerType,
  characterObjectiveKind: CharacterObjectiveKind,
  emulating = false,
): void {
  if (isCharacterObjectiveCompleted(character, characterObjectiveKind)) {
    return;
  }

  const objective: Objective = {
    type: ObjectiveType.CHARACTER,
    character,
    kind: characterObjectiveKind,
  };
  v.persistent.completedObjectives.push(objective);

  const achievementsMap =
    v.persistent.characterAchievements.getAndSetDefault(character);
  const achievement = achievementsMap.get(characterObjectiveKind);
  if (achievement === undefined) {
    const characterName = getCharacterName(character);
    error(
      `Failed to get the achievement for a character of ${characterName} for: CharacterObjectiveKind.${CharacterObjectiveKind[characterObjectiveKind]} (${characterObjectiveKind})`,
    );
  }

  const potentialNewAchievement = swapAchievementToPreventSoftlock(achievement);
  if (potentialNewAchievement !== undefined) {
    achievementsMap.set(characterObjectiveKind, potentialNewAchievement);
  }

  const achievementToGrant = potentialNewAchievement ?? achievement;
  v.persistent.completedAchievements.push(achievementToGrant);

  if (!emulating) {
    showNewAchievement(achievementToGrant);
  }
}

export function addObjectiveBoss(bossID: BossID, emulating = false): void {
  if (isBossObjectiveCompleted(bossID)) {
    return;
  }

  const objective: Objective = {
    type: ObjectiveType.BOSS,
    bossID,
  };
  v.persistent.completedObjectives.push(objective);

  const achievement = v.persistent.bossAchievements.get(bossID);
  if (achievement === undefined) {
    const bossIDName = `${BossID[bossID]} (${bossID})`;
    error(`Failed to get the achievement for boss: ${bossIDName}`);
  }

  const potentialNewAchievement = swapAchievementToPreventSoftlock(achievement);
  if (potentialNewAchievement !== undefined) {
    v.persistent.bossAchievements.set(bossID, potentialNewAchievement);
  }

  const achievementToGrant = potentialNewAchievement ?? achievement;
  v.persistent.completedAchievements.push(achievementToGrant);

  if (!emulating) {
    showNewAchievement(achievementToGrant);
  }
}

export function addObjectiveChallenge(
  challenge: Challenge,
  emulating = false,
): void {
  if (challenge === Challenge.NULL) {
    return;
  }

  if (isChallengeObjectiveCompleted(challenge)) {
    return;
  }

  const objective: Objective = {
    type: ObjectiveType.CHALLENGE,
    challenge,
  };
  v.persistent.completedObjectives.push(objective);

  const achievement = v.persistent.challengeAchievements.get(challenge);
  if (achievement === undefined) {
    const challengeName = getChallengeName(challenge);
    error(
      `Failed to get the achievement for the challenge: ${challengeName} (${challenge})`,
    );
  }

  const potentialNewAchievement = swapAchievementToPreventSoftlock(achievement);
  if (potentialNewAchievement !== undefined) {
    v.persistent.challengeAchievements.set(challenge, potentialNewAchievement);
  }

  const achievementToGrant = potentialNewAchievement ?? achievement;
  v.persistent.completedAchievements.push(achievementToGrant);

  if (!emulating) {
    showNewAchievement(achievementToGrant);
  }
}

function swapAchievementToPreventSoftlock(
  _achievement: Achievement,
): Achievement | undefined {
  // TODO
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
// Alt floor functions
// -------------------

export function isAltFloorUnlocked(altFloor: AltFloor): boolean {
  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.ALT_FLOOR &&
      achievement.altFloor === altFloor,
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

// ---------------------
// Grid entity functions
// ---------------------

export function isGridEntityTypeUnlocked(
  gridEntityType: GridEntityType,
): boolean {
  if (!UNLOCKABLE_GRID_ENTITY_TYPES.includes(gridEntityType)) {
    return true;
  }

  return v.persistent.completedAchievements.some(
    (achievement) =>
      achievement.type === AchievementType.GRID_ENTITY &&
      achievement.gridEntityType === gridEntityType,
  );
}

// ---------------
// Other functions
// ---------------

export function isOtherAchievementsUnlocked(
  otherAchievementKind: OtherAchievementKind,
): boolean {
  return v.persistent.completedAchievements.some(
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

  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      addObjectiveCharacter(objective.character, objective.kind);
      break;
    }

    case ObjectiveType.BOSS: {
      addObjectiveBoss(objective.bossID);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      addObjectiveChallenge(objective.challenge);
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
      addObjectiveCharacter(objective.character, objective.kind);
      break;
    }

    case ObjectiveType.BOSS: {
      addObjectiveBoss(objective.bossID);
      break;
    }

    case ObjectiveType.CHALLENGE: {
      addObjectiveChallenge(objective.challenge);
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

// ----------
// Validation
// ----------

/** Emulate a player playing through this randomizer seed to see if every achievement can unlock. */
function isAchievementsBeatable(): boolean {
  while (v.persistent.completedAchievements.length < NUM_TOTAL_ACHIEVEMENTS) {
    let unlockedSomething = false;

    for (const character of MAIN_CHARACTERS) {
      if (!isCharacterUnlocked(character)) {
        continue;
      }

      for (const characterObjectiveKind of CHARACTER_OBJECTIVE_KINDS) {
        if (
          canGetToCharacterObjectiveKind(characterObjectiveKind) &&
          !isCharacterObjectiveCompleted(character, characterObjectiveKind)
        ) {
          addObjectiveCharacter(character, characterObjectiveKind, true);
          unlockedSomething = true;
        }
      }
    }

    for (const bossID of ALL_BOSS_IDS) {
      if (canGetToBoss(bossID) && !isBossObjectiveCompleted(bossID)) {
        addObjectiveBoss(bossID, true);
        unlockedSomething = true;
      }
    }

    for (const challenge of CHALLENGES) {
      if (
        challenge !== Challenge.NULL &&
        isChallengeUnlocked(challenge) &&
        !isChallengeObjectiveCompleted(challenge)
      ) {
        addObjectiveChallenge(challenge, true);
        unlockedSomething = true;
      }
    }

    if (!unlockedSomething) {
      return false;
    }
  }

  return true;
}

function canGetToCharacterObjectiveKind(
  characterObjectiveKind: CharacterObjectiveKind,
): boolean {
  switch (characterObjectiveKind) {
    case CharacterObjectiveKind.MOM:
    case CharacterObjectiveKind.IT_LIVES:
    case CharacterObjectiveKind.ISAAC:
    case CharacterObjectiveKind.SATAN: {
      return true;
    }

    case CharacterObjectiveKind.BLUE_BABY: {
      return isPathUnlocked(UnlockablePath.CHEST);
    }

    case CharacterObjectiveKind.THE_LAMB: {
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

    case CharacterObjectiveKind.THE_BEAST: {
      return isPathUnlocked(UnlockablePath.THE_ASCENT);
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

function canGetToBoss(bossID: BossID): boolean {
  if (bossID === BossID.BLUE_BABY && !isPathUnlocked(UnlockablePath.CHEST)) {
    return false;
  }

  if (bossID === BossID.LAMB && !isPathUnlocked(UnlockablePath.DARK_ROOM)) {
    return false;
  }

  if (
    bossID === BossID.MEGA_SATAN &&
    !isPathUnlocked(UnlockablePath.MEGA_SATAN)
  ) {
    return false;
  }

  if (bossID === BossID.HUSH && !isPathUnlocked(UnlockablePath.BLUE_WOMB)) {
    return false;
  }

  if (
    bossID === BossID.DELIRIUM &&
    (!isPathUnlocked(UnlockablePath.BLUE_WOMB) ||
      !isPathUnlocked(UnlockablePath.VOID))
  ) {
    return false;
  }

  if (
    isRepentanceBoss(bossID) &&
    !isPathUnlocked(UnlockablePath.REPENTANCE_FLOORS)
  ) {
    return false;
  }

  if (
    (bossID === BossID.DOGMA || bossID === BossID.BEAST) &&
    !isPathUnlocked(UnlockablePath.THE_ASCENT)
  ) {
    return false;
  }

  if (
    bossID === BossID.ULTRA_GREED &&
    !isPathUnlocked(UnlockablePath.GREED_MODE)
  ) {
    return false;
  }

  return true;
}

// -------
// Logging
// -------

export function logSpoilerLog(): void {
  if (v.persistent.seed === null) {
    logError("The randomizer is not active, so you cannot make a spoiler log.");
    return;
  }

  const line = "-".repeat(20);

  log(line, false);
  log(`Spoiler log for randomizer seed: ${v.persistent.seed}`, false);

  log(line, false);
  log("Character achievements:", false);
  log(line, false);

  for (const [character, achievementsMap] of v.persistent
    .characterAchievements) {
    for (const [characterObjectiveKind, achievement] of achievementsMap) {
      const text = getAchievementText(achievement).join(" - ");
      log(
        `${character} - ${PlayerType[character]} - ${characterObjectiveKind} - ${CharacterObjectiveKind[characterObjectiveKind]} - ${text}`,
        false,
      );
    }
  }

  log(line, false);
  log("Boss achievements:", false);
  log(line, false);

  for (const [bossID, achievement] of v.persistent.bossAchievements) {
    const text = getAchievementText(achievement).join(" - ");
    log(`${bossID} - ${BossID[bossID]} - ${text}`, false);
  }

  log(line, false);
  log("Challenge achievements:", false);
  log(line, false);

  for (const [challenge, achievement] of v.persistent.challengeAchievements) {
    const text = getAchievementText(achievement).join(" - ");
    log(`${challenge} - ${Challenge[challenge]} - ${text}`, false);
  }

  log(line, false);
}
