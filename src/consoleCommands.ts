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
} from "isaacscript-common";
import {
  setCharacterUnlocked,
  setCollectibleUnlocked,
  startRandomizer,
} from "./classes/features/AchievementTracker";
import { mod } from "./mod";

export const MIN_SEED = 1;
export const MAX_SEED = 4_294_967_295;

export function initConsoleCommands(): void {
  mod.addConsoleCommand("achievementRandomizer", achievementRandomizer);
  mod.addConsoleCommand("unlockCharacter", unlockCharacter);
  mod.addConsoleCommand("unlockCollectible", unlockCollectible);
}

function achievementRandomizer(params: string) {
  if (params === "") {
    print("You must enter a seed. e.g. achievementRandomizer 12345");
    return;
  }

  const seedNumber = tonumber(params);
  if (seedNumber === undefined) {
    print(`The provided seed was not a number: ${params}`);
    return;
  }

  if (seedNumber < MIN_SEED || seedNumber > MAX_SEED) {
    print(`The seed must be between ${MIN_SEED} and ${MAX_SEED}.`);
  }

  const seed = seedNumber as Seed;
  startRandomizer(seed);
}

export function unlockCharacter(params: string): void {
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

export function unlockCollectible(params: string): void {
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
