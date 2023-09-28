import {
  BatterySubType,
  BombSubType,
  BossID,
  CardType,
  Challenge,
  CoinSubType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PlayerType,
  SackSubType,
} from "isaac-typescript-definitions";
import {
  CHEST_PICKUP_VARIANTS,
  DefaultMap,
  MAIN_CHARACTERS,
  ReadonlySet,
  VANILLA_CARD_TYPES,
  VANILLA_PILL_EFFECTS,
  arrayRemoveIndexInPlace,
  assertDefined,
  copyArray,
  getAllBossesSet,
  getChallengeName,
  getCharacterName,
  getRandomArrayElement,
  getRandomArrayElementAndRemove,
  log,
  newRNG,
  shuffleArray,
} from "isaacscript-common";
import {
  ACHIEVEMENT_TYPES,
  BATTERY_SUB_TYPES,
  BOMB_SUB_TYPES,
  CHALLENGES,
  CHARACTER_OBJECTIVE_KINDS,
  COIN_SUB_TYPES,
  HEART_SUB_TYPES,
  KEY_SUB_TYPES,
  OBJECTIVE_TYPES,
  PILL_ACHIEVEMENT_KINDS,
  SACK_SUB_TYPES,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import { getAchievementText } from "./classes/features/AchievementText";
import { AchievementType } from "./enums/AchievementType";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockablePath } from "./enums/UnlockablePath";
import type { Achievement } from "./types/Achievement";
import type { CharacterObjective, Objective } from "./types/Objective";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";
import { UNLOCKABLE_TRINKET_TYPES } from "./unlockableTrinketTypes";

interface Achievements {
  characterAchievements: DefaultMap<
    PlayerType,
    Map<CharacterObjectiveKind, Achievement>
  >;
  bossAchievements: Map<BossID, Achievement>;
  challengeAchievements: Map<Challenge, Achievement>;
}

const VERBOSE = false as boolean;

/** These are the objectives that The Polaroid and The Negative are gated behind. */
const EASY_OBJECTIVE_KINDS = [
  CharacterObjectiveKind.MOM,
  CharacterObjectiveKind.IT_LIVES,
  CharacterObjectiveKind.ISAAC,
  CharacterObjectiveKind.SATAN,
  CharacterObjectiveKind.NO_DAMAGE_BASEMENT_1,
  CharacterObjectiveKind.NO_DAMAGE_BASEMENT_2,
  CharacterObjectiveKind.NO_DAMAGE_CAVES_1,
  CharacterObjectiveKind.NO_DAMAGE_CAVES_2,
  CharacterObjectiveKind.NO_DAMAGE_DEPTHS_1,
  CharacterObjectiveKind.NO_DAMAGE_DEPTHS_2,
  CharacterObjectiveKind.NO_DAMAGE_WOMB_1,
  CharacterObjectiveKind.NO_DAMAGE_WOMB_2,
] as const;

/** These are the unlockable paths that are gated behind `EASY_OBJECTIVE_KINDS`. */
const EASY_UNLOCKABLE_PATHS = [
  UnlockablePath.THE_CHEST,
  UnlockablePath.DARK_ROOM,
] as const;

/**
 * These consist of objectives that are from:
 * 1) beating bosses
 * 2) not gated behind an unlockable path (with the exception of The Chest / Dark Room, since those
 *    are behind easy Isaac objectives)
 */
const BASIC_CHARACTER_OBJECTIVES = new ReadonlySet<CharacterObjectiveKind>([
  CharacterObjectiveKind.MOM,
  CharacterObjectiveKind.IT_LIVES,
  CharacterObjectiveKind.ISAAC,
  CharacterObjectiveKind.BLUE_BABY,
  CharacterObjectiveKind.SATAN,
  CharacterObjectiveKind.THE_LAMB,
]);

const ALL_BOSS_IDS = [...getAllBossesSet()] as const;

export const NUM_TOTAL_ACHIEVEMENTS = getAllAchievements().length;

export function getAchievementsForSeed(seed: Seed): Achievements {
  const rng = newRNG(seed);

  const characterAchievements = new DefaultMap<
    PlayerType,
    Map<CharacterObjectiveKind, Achievement>
  >(() => new Map());
  const bossAchievements = new Map<BossID, Achievement>();
  const challengeAchievements = new Map<Challenge, Achievement>();

  const achievements = getAllAchievements();
  const objectives = getAllObjectives();

  if (achievements.length !== objectives.length) {
    logAchievements(achievements);
    error(
      `There were ${achievements.length} total achievements and ${objectives.length} total objectives. These must exactly match.`,
    );
  }

  // The Polaroid and The Negative are guaranteed to be unlocked via an easy objective for Isaac.
  const easyObjectiveKinds = copyArray(EASY_OBJECTIVE_KINDS);
  for (const unlockablePath of EASY_UNLOCKABLE_PATHS) {
    const achievement = getAndRemoveAchievement(
      achievements,
      AchievementType.PATH,
      unlockablePath,
    );
    const randomEasyObjectiveKind = getRandomArrayElementAndRemove(
      easyObjectiveKinds,
      rng,
    );
    removeCharacterObjective(
      objectives,
      PlayerType.ISAAC,
      randomEasyObjectiveKind,
    );

    const isaacAchievements = characterAchievements.getAndSetDefault(
      PlayerType.ISAAC,
    );
    if (isaacAchievements.has(randomEasyObjectiveKind)) {
      const characterName = getCharacterName(PlayerType.ISAAC);
      error(
        `Failed to add an easy achievement to ${characterName}: ${CharacterObjectiveKind[randomEasyObjectiveKind]}`,
      );
    }

    isaacAchievements.set(randomEasyObjectiveKind, achievement);
    if (VERBOSE) {
      const characterName = getCharacterName(PlayerType.ISAAC);
      log(
        `Set easy achievement on ${characterName} --> ${CharacterObjectiveKind[randomEasyObjectiveKind]}`,
      );
      logAchievement(achievement);
    }
  }

  // Each character is guaranteed to unlock another character from a basic objective.
  let lastUnlockedCharacter = PlayerType.ISAAC;
  const mainCharacters = shuffleArray(MAIN_CHARACTERS, rng);
  for (const character of mainCharacters) {
    if (character === PlayerType.ISAAC) {
      continue;
    }

    const achievement = getAndRemoveAchievement(
      achievements,
      AchievementType.CHARACTER,
      character,
    );
    const lastCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        objective.character === lastUnlockedCharacter &&
        BASIC_CHARACTER_OBJECTIVES.has(objective.kind),
    ) as CharacterObjective[];
    const randomCharacterObjective = getRandomArrayElement(
      lastCharacterObjectives,
      rng,
    );
    removeCharacterObjective(
      objectives,
      lastUnlockedCharacter,
      randomCharacterObjective.kind,
    );

    const lastCharacterAchievements = characterAchievements.getAndSetDefault(
      lastUnlockedCharacter,
    );
    if (lastCharacterAchievements.has(randomCharacterObjective.kind)) {
      const characterName = getCharacterName(lastUnlockedCharacter);
      error(
        `Failed to add a progressive character achievement to ${characterName}: ${
          CharacterObjectiveKind[randomCharacterObjective.kind]
        }`,
      );
    }

    lastCharacterAchievements.set(randomCharacterObjective.kind, achievement);
    if (VERBOSE) {
      const characterName = getCharacterName(lastUnlockedCharacter);
      log(
        `Set progressive character achievement on ${characterName} --> ${
          CharacterObjectiveKind[randomCharacterObjective.kind]
        }`,
      );
      logAchievement(achievement);
    }

    lastUnlockedCharacter = character;
  }

  // The Fool Card must unlock before The Ascent.
  {
    const foolAchievement = getAndRemoveAchievement(
      achievements,
      AchievementType.CARD,
      CardType.FOOL,
    );
    const basicCharacterObjectives = objectives.filter(
      (objective) =>
        objective.type === ObjectiveType.CHARACTER &&
        BASIC_CHARACTER_OBJECTIVES.has(objective.kind),
    ) as CharacterObjective[];
    const randomBasicCharacterObjective = getRandomArrayElement(
      basicCharacterObjectives,
      rng,
    );
    removeCharacterObjective(
      objectives,
      randomBasicCharacterObjective.character,
      randomBasicCharacterObjective.kind,
    );

    const thisCharacterAchievements = characterAchievements.getAndSetDefault(
      randomBasicCharacterObjective.character,
    );
    if (thisCharacterAchievements.has(randomBasicCharacterObjective.kind)) {
      const characterName = getCharacterName(
        randomBasicCharacterObjective.character,
      );
      error(
        `Failed to add the Fool achievement to ${characterName}: ${
          CharacterObjectiveKind[randomBasicCharacterObjective.kind]
        }`,
      );
    }

    thisCharacterAchievements.set(
      randomBasicCharacterObjective.kind,
      foolAchievement,
    );
    if (VERBOSE) {
      const characterName = getCharacterName(lastUnlockedCharacter);
      log(
        `Set Fool achievement on ${characterName} --> ${
          CharacterObjectiveKind[randomBasicCharacterObjective.kind]
        }`,
      );
      logAchievement(foolAchievement);
    }
  }

  // Now, do the rest of the unlocks with no restrictions.
  for (const achievement of achievements) {
    const objective = getRandomArrayElementAndRemove(objectives, rng);

    switch (objective.type) {
      case ObjectiveType.CHARACTER: {
        const thisCharacterAchievements =
          characterAchievements.getAndSetDefault(objective.character);
        if (thisCharacterAchievements.has(objective.kind)) {
          const characterName = getCharacterName(objective.character);
          error(
            `Failed to add an achievement to ${characterName}: ${
              CharacterObjectiveKind[objective.kind]
            }`,
          );
        }

        thisCharacterAchievements.set(objective.kind, achievement);
        if (VERBOSE) {
          const characterName = getCharacterName(lastUnlockedCharacter);
          log(
            `Set normal character achievement on ${characterName} --> ${
              CharacterObjectiveKind[objective.kind]
            }`,
          );
          logAchievement(achievement);
        }

        break;
      }

      case ObjectiveType.BOSS: {
        if (bossAchievements.has(objective.bossID)) {
          const bossIDName = `${BossID[objective.bossID]} (${
            objective.bossID
          })`;
          error(`Failed to add an achievement to the boss map: ${bossIDName}`);
        }

        bossAchievements.set(objective.bossID, achievement);
        if (VERBOSE) {
          const bossIDName = `${BossID[objective.bossID]} (${
            objective.bossID
          })`;
          log(`Set normal boss achievement: ${bossIDName}`);
          logAchievement(achievement);
        }

        break;
      }

      case ObjectiveType.CHALLENGE: {
        if (challengeAchievements.has(objective.challenge)) {
          const challengeName = getChallengeName(objective.challenge);
          error(
            `Failed to add an achievement to the challenge map: ${challengeName}`,
          );
        }

        challengeAchievements.set(objective.challenge, achievement);
        if (VERBOSE) {
          const challengeName = getChallengeName(objective.challenge);
          log(`Set normal challenge achievement: ${challengeName}`);
          logAchievement(achievement);
        }

        break;
      }
    }
  }

  const allAchievements: Achievements = {
    characterAchievements,
    bossAchievements,
    challengeAchievements,
  };
  validateAchievements(allAchievements);

  return allAchievements;
}

function validateAchievements(achievements: Achievements) {
  const { characterAchievements, challengeAchievements } = achievements;

  if (characterAchievements.size !== MAIN_CHARACTERS.length) {
    error(
      `The "characterAchievements" map had ${characterAchievements.size} elements but it needs ${MAIN_CHARACTERS.length} elements.`,
    );
  }
  for (const [character, thisCharacterAchievements] of characterAchievements) {
    if (thisCharacterAchievements.size !== CHARACTER_OBJECTIVE_KINDS.length) {
      const characterName = getCharacterName(character);
      error(
        `The "characterAchievements" map for ${characterName} had ${thisCharacterAchievements.size} elements but it needs ${CHARACTER_OBJECTIVE_KINDS.length} elements.`,
      );
    }
  }
  if (challengeAchievements.size !== CHALLENGES.length - 1) {
    error(
      `The "challengeAchievements" map had ${
        challengeAchievements.size
      } elements but it needs ${CHALLENGES.length - 1} elements.`,
    );
  }
}

function getAllAchievements(): Achievement[] {
  const achievements: Achievement[] = [];

  for (const achievementType of ACHIEVEMENT_TYPES) {
    switch (achievementType) {
      case AchievementType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          if (character === PlayerType.ISAAC) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CHARACTER,
            character,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PATH: {
        for (const unlockablePath of UNLOCKABLE_PATHS) {
          const achievement: Achievement = {
            type: AchievementType.PATH,
            unlockablePath,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHALLENGE: {
        for (const challenge of CHALLENGES) {
          if (challenge === Challenge.NULL) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CHALLENGE,
            challenge,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.COLLECTIBLE: {
        for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.COLLECTIBLE,
            collectibleType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.TRINKET: {
        for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
          const achievement: Achievement = {
            type: AchievementType.TRINKET,
            trinketType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CARD: {
        for (const cardType of VANILLA_CARD_TYPES) {
          if (cardType === CardType.RUNE_SHARD) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CARD,
            cardType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PILL_EFFECT: {
        for (const pillEffect of VANILLA_PILL_EFFECTS) {
          const achievement: Achievement = {
            type: AchievementType.PILL_EFFECT,
            pillEffect,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.PILL: {
        for (const pillAchievementKind of PILL_ACHIEVEMENT_KINDS) {
          const achievement: Achievement = {
            type: AchievementType.PILL,
            kind: pillAchievementKind,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.HEART: {
        for (const heartSubType of HEART_SUB_TYPES) {
          if (
            heartSubType === HeartSubType.NULL || // 0
            heartSubType === HeartSubType.HALF // 2
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.HEART,
            heartSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.COIN: {
        for (const coinSubType of COIN_SUB_TYPES) {
          if (
            coinSubType === CoinSubType.NULL || // 0
            coinSubType === CoinSubType.PENNY // 1
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.COIN,
            coinSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BOMB: {
        for (const bombSubType of BOMB_SUB_TYPES) {
          if (
            bombSubType === BombSubType.NULL || // 0
            bombSubType === BombSubType.NORMAL || // 1
            bombSubType === BombSubType.TROLL || // 3
            bombSubType === BombSubType.MEGA_TROLL || // 5
            bombSubType === BombSubType.GOLDEN_TROLL || // 6
            bombSubType === BombSubType.GIGA // 7
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.BOMB,
            bombSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.KEY: {
        for (const keySubType of KEY_SUB_TYPES) {
          if (
            keySubType === KeySubType.NULL || // 0
            keySubType === KeySubType.NORMAL // 1
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.KEY,
            keySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.BATTERY: {
        for (const batterySubType of BATTERY_SUB_TYPES) {
          if (
            batterySubType === BatterySubType.NULL // 0
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.BATTERY,
            batterySubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.SACK: {
        for (const sackSubType of SACK_SUB_TYPES) {
          if (
            sackSubType === SackSubType.NULL // 0
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.SACK,
            sackSubType,
          };
          achievements.push(achievement);
        }

        break;
      }

      case AchievementType.CHEST: {
        for (const pickupVariant of CHEST_PICKUP_VARIANTS) {
          if (
            pickupVariant === PickupVariant.CHEST || // 50
            pickupVariant === PickupVariant.OLD_CHEST || // 55
            pickupVariant === PickupVariant.MOMS_CHEST // 390
          ) {
            continue;
          }

          const achievement: Achievement = {
            type: AchievementType.CHEST,
            pickupVariant,
          };
          achievements.push(achievement);
        }

        break;
      }
    }
  }

  return achievements;
}

function logAchievements(achievements: Achievement[]) {
  log("Logging all achievements.");

  for (const achievementType of ACHIEVEMENT_TYPES) {
    const thisTypeAchievements = achievements.filter(
      (achievement) => achievement.type === achievementType,
    );
    log(
      `- ${AchievementType[achievementType]} - ${thisTypeAchievements.length}`,
    );
  }
}

function logAchievement(achievement: Achievement) {
  const achievementText = getAchievementText(achievement);
  log(`Achievement: ${achievementText[0]} - ${achievementText[1]}`);
}

function getAllObjectives(): Objective[] {
  const objectives: Objective[] = [];

  for (const objectiveType of OBJECTIVE_TYPES) {
    switch (objectiveType) {
      case ObjectiveType.CHARACTER: {
        for (const character of MAIN_CHARACTERS) {
          for (const characterObjectiveKind of CHARACTER_OBJECTIVE_KINDS) {
            const objective: Objective = {
              type: ObjectiveType.CHARACTER,
              character,
              kind: characterObjectiveKind,
            };
            objectives.push(objective);
          }
        }

        break;
      }

      case ObjectiveType.BOSS: {
        for (const bossID of ALL_BOSS_IDS) {
          const objective: Objective = {
            type: ObjectiveType.BOSS,
            bossID,
          };
          objectives.push(objective);
        }

        break;
      }

      case ObjectiveType.CHALLENGE: {
        for (const challenge of CHALLENGES) {
          if (challenge === Challenge.NULL) {
            continue;
          }

          const objective: Objective = {
            type: ObjectiveType.CHALLENGE,
            challenge,
          };
          objectives.push(objective);
        }

        break;
      }
    }
  }

  return objectives;
}

function _logObjectives(objectives: Objective[]) {
  log("Logging all objectives.");

  for (const objectiveType of OBJECTIVE_TYPES) {
    const thisTypeObjectives = objectives.filter(
      (objective) => objective.type === objectiveType,
    );
    log(`- ${ObjectiveType[objectiveType]} - ${thisTypeObjectives.length}`);
  }
}

function getAndRemoveAchievement(
  achievements: Achievement[],
  type: AchievementType,
  kind: int,
): Achievement {
  const index = getAchievementIndexMatchingType(achievements, type, kind);
  const achievement = achievements[index];
  assertDefined(
    achievement,
    `Failed to find the achievement at index: ${index}`,
  );

  arrayRemoveIndexInPlace(achievements, index);

  return achievement;
}

function getAchievementIndexMatchingType(
  achievements: Achievement[],
  type: AchievementType,
  kind: int,
): int {
  let index: int;

  switch (type) {
    case AchievementType.PATH: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === AchievementType.PATH &&
          achievement.unlockablePath === kind,
      );
      break;
    }

    case AchievementType.CHARACTER: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === AchievementType.CHARACTER &&
          achievement.character === kind,
      );
      break;
    }

    case AchievementType.CARD: {
      index = achievements.findIndex(
        (achievement) =>
          achievement.type === AchievementType.CARD &&
          achievement.cardType === kind,
      );
      break;
    }

    default: {
      return error(
        `Unhandled matching logic for achievement type: ${AchievementType[type]}`,
      );
    }
  }

  if (index === -1) {
    error(
      `Failed to find achievement of type ${AchievementType[type]}: ${kind}`,
    );
  }

  return index;
}

function removeCharacterObjective(
  objectives: Objective[],
  character: PlayerType,
  kind: CharacterObjectiveKind,
) {
  const index = objectives.findIndex(
    (objective) =>
      objective.type === ObjectiveType.CHARACTER &&
      objective.character === character &&
      objective.kind === kind,
  );
  const objective = objectives[index];
  assertDefined(objective, `Failed to find the objective at index: ${index}`);

  arrayRemoveIndexInPlace(objectives, index);
}
