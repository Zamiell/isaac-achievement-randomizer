import type { PlayerType } from "isaac-typescript-definitions";
import {
  CHARACTER_NAME_TO_TYPE_MAP,
  FIRST_CHARACTER,
  LAST_VANILLA_CHARACTER,
  getCharacterName,
  getMapPartialMatch,
} from "isaacscript-common";
import { startRandomizer } from "./classes/features/AchievementTracker";
import { mod } from "./mod";

export const MIN_SEED = 1;
export const MAX_SEED = 4_294_967_295;

export function initConsoleCommands(): void {
  mod.addConsoleCommand("achievementRandomizer", achievementRandomizer);
  mod.addConsoleCommand("unlockChar", unlockChar);
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

function unlockChar(params: string) {
  if (params === "") {
    print("You must specify a character name or number.");
    return;
  }

  let playerType: PlayerType;
  const num = tonumber(params) as PlayerType | undefined;
  if (num === undefined) {
    const match = getMapPartialMatch(params, CHARACTER_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown character: ${params}`);
      return;
    }

    playerType = match[1];
  } else {
    if (num < FIRST_CHARACTER || num > LAST_VANILLA_CHARACTER) {
      print(`Invalid character number: ${num}`);
      return;
    }

    playerType = num;
  }

  const _characterName = getCharacterName(playerType);
  // TODO
}
