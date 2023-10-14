import type { CollectibleType, PlayerType } from "isaac-typescript-definitions";
import {
  CHARACTER_NAME_TO_TYPE_MAP,
  COLLECTIBLE_NAME_TO_TYPE_MAP,
  FIRST_CHARACTER,
  LAST_VANILLA_CHARACTER,
  asCollectibleType,
  getCharacterName,
  getCollectibleName,
  getMapPartialMatch,
  isEnumValue,
  restart,
} from "isaacscript-common";
import { RANDOMIZER_MODES } from "./cachedEnums";
import {
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementRandomizer";
import {
  logSpoilerLog,
  setCharacterUnlocked,
  setCollectibleUnlocked,
  setPathUnlocked,
} from "./classes/features/AchievementTracker";
import {
  isRandomizerEnabled,
  setAcceptedVersionMismatch,
} from "./classes/features/achievementTracker/v";
import { RandomizerMode } from "./enums/RandomizerMode";
import { UnlockablePath, getPathName } from "./enums/UnlockablePath";
import { mod } from "./mod";

export const MIN_SEED = 1;
export const MAX_SEED = 4_294_967_295;

export function initConsoleCommands(): void {
  mod.addConsoleCommand("achievementRandomizer", achievementRandomizer);
  mod.addConsoleCommand("forceWrongVersion", forceWrongVersion);
  mod.addConsoleCommand("spoilerLog", spoilerLog);
  mod.addConsoleCommand("unlockCharacter", unlockCharacter);
  mod.addConsoleCommand("unlockCollectible", unlockCollectible);
  mod.addConsoleCommand("unlockPath", unlockPath);
}

function achievementRandomizer(params: string) {
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

function forceWrongVersion(_params: string) {
  setAcceptedVersionMismatch();
  restart();
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

function unlockPath(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print("You must specify the number corresponding to the path.");
    return;
  }

  const unlockablePathNumber = tonumber(params);
  if (unlockablePathNumber === undefined) {
    print(`That is not a valid number: ${params}`);
    return;
  }

  if (!isEnumValue(unlockablePathNumber, UnlockablePath)) {
    print(`Invalid path number: ${params}`);
    return;
  }

  const unlockablePath = unlockablePathNumber as UnlockablePath;
  setPathUnlocked(unlockablePath);

  const pathName = getPathName(unlockablePath);
  print(`Unlocked path: ${pathName} (${unlockablePath})`);
}
