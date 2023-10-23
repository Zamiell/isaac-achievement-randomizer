import type {
  CollectibleType,
  PillEffect,
  PlayerType,
} from "isaac-typescript-definitions";
import {
  CHARACTER_NAME_TO_TYPE_MAP,
  COLLECTIBLE_NAME_TO_TYPE_MAP,
  FIRST_CHARACTER,
  LAST_VANILLA_CHARACTER,
  PILL_NAME_TO_EFFECT_MAP,
  asCollectibleType,
  asPillEffect,
  getCharacterName,
  getCollectibleName,
  getMapPartialMatch,
  getPillEffectName,
  isEnumValue,
  restart,
} from "isaacscript-common";
import { version } from "../package.json";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { RANDOMIZER_MODES } from "./cachedEnums";
import {
  endRandomizer,
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementRandomizer";
import {
  logSpoilerLog,
  setAreaUnlocked,
  setCharacterUnlocked,
  setCollectibleUnlocked,
  setPillEffectUnlocked,
} from "./classes/features/AchievementTracker";
import { getCharacterObjectiveKindNoHit } from "./classes/features/FloorObjectiveDetection";
import { addObjective } from "./classes/features/achievementTracker/addObjective";
import {
  isRandomizerEnabled,
  setAcceptedVersionMismatch,
} from "./classes/features/achievementTracker/v";
import { getModifiedBossID } from "./enums/BossIDCustom";
import { ObjectiveType } from "./enums/ObjectiveType";
import { RandomizerMode } from "./enums/RandomizerMode";
import { UnlockableArea, getAreaName } from "./enums/UnlockableArea";
import { mod } from "./mod";
import { getObjective } from "./types/Objective";
import { getAdjustedCharacterForObjective } from "./utils";
import { logObjectives, logUnlocks } from "./validate";

export const MIN_SEED = 1;
export const MAX_SEED = 4_294_967_295;

export function initConsoleCommands(): void {
  mod.addConsoleCommand("endRandomizer", endRandomizerCommand);
  mod.addConsoleCommand("forceWrongVersion", forceWrongVersion);
  mod.addConsoleCommand("logAll", logAll);
  mod.addConsoleCommand("objectiveBoss", objectiveBoss);
  mod.addConsoleCommand("objectiveFloor", objectiveFloor);
  mod.addConsoleCommand("startRandomizer", startRandomizerCommand);
  mod.addConsoleCommand("randomizerVersion", randomizerVersion);
  mod.addConsoleCommand("spoilerLog", spoilerLog);
  mod.addConsoleCommand("unlockArea", unlockArea);
  mod.addConsoleCommand("unlockCharacter", unlockCharacter);
  mod.addConsoleCommand("unlockCollectible", unlockCollectible);
  mod.addConsoleCommand("unlockPillEffect", unlockPillEffect);
}

function endRandomizerCommand(_params: string) {
  endRandomizer();
}

function forceWrongVersion(_params: string) {
  setAcceptedVersionMismatch();
  restart();
}

function logAll(_params: string) {
  logObjectives(ALL_OBJECTIVES);
  logUnlocks(ALL_UNLOCKS);
}

function objectiveBoss(_params: string) {
  const bossID = getModifiedBossID();
  if (bossID === undefined) {
    print("Error: Not in a Boss Room.");
    return;
  }

  const objective = getObjective(ObjectiveType.BOSS, bossID);
  addObjective(objective);
}

function objectiveFloor(_params: string) {
  const kind = getCharacterObjectiveKindNoHit();
  if (kind === undefined) {
    print("Error: Not on a no hit floor.");
    return;
  }

  const player = Isaac.GetPlayer();
  const character = getAdjustedCharacterForObjective(player);

  const objective = getObjective(ObjectiveType.CHARACTER, character, kind);
  addObjective(objective);
}

function spoilerLog(_params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not print out the spoiler log.",
    );
    return;
  }

  logSpoilerLog();
}

function startRandomizerCommand(params: string) {
  if (isRandomizerEnabled()) {
    print(
      "Error: You are currently in a randomizer playthrough. If you want to start a new one, you must first exit the current playthrough.",
    );
    return;
  }

  const [randomizerMode, seedString] = params.split(" ");

  if (randomizerMode === undefined || seedString === undefined) {
    print(
      "You must enter a mode and a seed. e.g. achievementRandomizer hardcore 12345",
    );
    return;
  }

  if (!isEnumValue(randomizerMode, RandomizerMode)) {
    const quoted = RANDOMIZER_MODES.map((mode) => `"${mode}"`);
    const allQuoted = quoted.join(" or ");
    print(`The mode must be either ${allQuoted}.`);
    return;
  }

  const seedNumber = tonumber(seedString);
  if (seedNumber === undefined) {
    print(`The provided seed was not a number: ${seedString}`);
    return;
  }

  if (seedNumber < MIN_SEED || seedNumber > MAX_SEED) {
    print(`The seed must be between ${MIN_SEED} and ${MAX_SEED}.`);
    return;
  }

  const seed = seedNumber as Seed;

  if (!isValidSituationForStartingRandomizer()) {
    print(
      "You must be on a hard mode run and not inside a challenge in order to start the randomizer.",
    );
    return;
  }

  // Close the console by restarting the game.
  restart();
  mod.runNextRun(() => {
    mod.runNextRenderFrame(() => {
      startRandomizer(randomizerMode, seed);
    });
  });
}

function randomizerVersion(_params: string) {
  print(`Achievement Randomizer version: ${version}`);
}

function unlockArea(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print("You must specify the number corresponding to the area.");
    return;
  }

  const unlockableAreaNumber = tonumber(params);
  if (unlockableAreaNumber === undefined) {
    print(`That is not a valid number: ${params}`);
    return;
  }

  if (!isEnumValue(unlockableAreaNumber, UnlockableArea)) {
    print(`Invalid area number: ${params}`);
    return;
  }

  const unlockableArea = unlockableAreaNumber as UnlockableArea;
  setAreaUnlocked(unlockableArea);

  const areaName = getAreaName(unlockableArea);
  print(`Unlocked area: ${areaName} (${unlockableArea})`);
}

function unlockCharacter(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print("You must specify a character name or number.");
    return;
  }

  let character: PlayerType;
  const num = tonumber(params) as PlayerType | undefined;
  if (num === undefined) {
    const match = getMapPartialMatch(params, CHARACTER_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown character: ${params}`);
      return;
    }

    character = match[1];
  } else {
    if (num < FIRST_CHARACTER || num > LAST_VANILLA_CHARACTER) {
      print(`Invalid character number: ${num}`);
      return;
    }

    character = num;
  }

  setCharacterUnlocked(character);

  const characterName = getCharacterName(character);
  print(`Unlocked character: ${characterName} (${character})`);
}

function unlockCollectible(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print(
      "You must specify the collectible name or the number corresponding to the collectible type.",
    );
    return;
  }

  const collectibleTypeNumber = tonumber(params);
  let collectibleType: CollectibleType;
  if (collectibleTypeNumber === undefined) {
    const match = getMapPartialMatch(params, COLLECTIBLE_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown collectible: ${params}`);
      return;
    }

    collectibleType = match[1];
  } else {
    collectibleType = asCollectibleType(collectibleTypeNumber);
  }

  setCollectibleUnlocked(collectibleType);

  const collectibleName = getCollectibleName(collectibleType);
  print(`Unlocked collectible: ${collectibleName} (${collectibleType})`);
}

function unlockPillEffect(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print(
      "You must specify the pill effect name or the number corresponding to the pill effect type.",
    );
    return;
  }

  const pillEffectNumber = tonumber(params);
  let pillEffect: PillEffect;
  if (pillEffectNumber === undefined) {
    const match = getMapPartialMatch(params, PILL_NAME_TO_EFFECT_MAP);
    if (match === undefined) {
      print(`Unknown pill effect: ${params}`);
      return;
    }

    pillEffect = match[1];
  } else {
    pillEffect = asPillEffect(pillEffectNumber);
  }

  setPillEffectUnlocked(pillEffect);

  const pillEffectName = getPillEffectName(pillEffect);
  print(`Unlocked pill effect: ${pillEffectName} (${pillEffect})`);
}
