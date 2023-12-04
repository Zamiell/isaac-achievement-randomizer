import type {
  PillEffect,
  PlayerType,
  RoomType,
} from "isaac-typescript-definitions";
import {
  CardType,
  Challenge,
  CollectibleType,
  Difficulty,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CARD_NAME_TO_TYPE_MAP,
  CHARACTER_NAME_TO_TYPE_MAP,
  COLLECTIBLE_NAME_TO_TYPE_MAP,
  FIRST_CHARACTER,
  LAST_VANILLA_CHARACTER,
  PILL_NAME_TO_EFFECT_MAP,
  ROOM_NAME_TO_TYPE_MAP,
  TRINKET_NAME_TO_TYPE_MAP,
  asPillEffect,
  asRoomType,
  game,
  getCardName,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  getMapPartialMatch,
  getPillEffectName,
  getRoomTypeName,
  getTrinketName,
  isEnumValue,
  restart,
} from "isaacscript-common";
import { version } from "../package.json";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { ALL_UNLOCKS } from "./arrays/allUnlocks";
import { RANDOMIZER_MODE_VALUES } from "./cachedEnumValues";
import {
  endRandomizer,
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementRandomizer";
import {
  logSpoilerLog,
  setAreaUnlocked,
  setCardUnlocked,
  setChallengeUnlocked,
  setCharacterUnlocked,
  setCollectibleUnlocked,
  setPillEffectUnlocked,
  setRoomUnlocked,
  setTrinketUnlocked,
} from "./classes/features/AchievementTracker";
import { getCharacterObjectiveKindNoHit } from "./classes/features/ChapterObjectiveDetection";
import { addObjective } from "./classes/features/achievementTracker/addObjective";
import {
  isAreaUnlocked,
  isCardTypeUnlocked,
  isChallengeUnlocked,
  isCharacterUnlocked,
  isCollectibleTypeUnlocked,
  isPillEffectUnlocked,
  isRoomTypeUnlocked,
  isTrinketTypeUnlocked,
} from "./classes/features/achievementTracker/completedUnlocks";
import {
  isRandomizerEnabled,
  setAcceptedVersionMismatch,
} from "./classes/features/achievementTracker/v";
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
  mod.addConsoleCommand("objectiveChapter", objectiveChapter);
  mod.addConsoleCommand("startRandomizer", startRandomizerCommand);
  mod.addConsoleCommand("randomizerVersion", randomizerVersion);
  mod.addConsoleCommand("spoilerLog", spoilerLog);
  mod.addConsoleCommand("unlockArea", unlockArea);
  mod.addConsoleCommand("unlockCard", unlockCard);
  mod.addConsoleCommand("unlockChallenge", unlockChallenge);
  mod.addConsoleCommand("unlockCharacter", unlockCharacter);
  mod.addConsoleCommand("unlockCollectible", unlockCollectible);
  mod.addConsoleCommand("unlockPillEffect", unlockPillEffect);
  mod.addConsoleCommand("unlockRoom", unlockRoom);
  mod.addConsoleCommand("unlockTrinket", unlockTrinket);
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

function objectiveChapter(_params: string) {
  const kind = getCharacterObjectiveKindNoHit();
  if (kind === undefined) {
    print("Error: Not on a no hit floor.");
    return;
  }

  if (
    game.Difficulty !== Difficulty.NORMAL &&
    game.Difficulty !== Difficulty.HARD
  ) {
    print("Error: Not on the right difficulty.");
    return;
  }

  const player = Isaac.GetPlayer();
  const character = getAdjustedCharacterForObjective(player);

  const objective = getObjective(
    ObjectiveType.CHARACTER,
    character,
    kind,
    game.Difficulty,
  );
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
    const quoted = RANDOMIZER_MODE_VALUES.map((mode) => `"${mode}"`);
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
      "You must not be inside a challenge in order to start the randomizer.",
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

  const unlockableArea = tonumber(params);
  if (unlockableArea === undefined) {
    print(`That is not a valid number: ${params}`);
    return;
  }

  if (!isEnumValue(unlockableArea, UnlockableArea)) {
    print(`Invalid area number: ${params}`);
    return;
  }

  const areaName = getAreaName(unlockableArea);
  if (isAreaUnlocked(unlockableArea, false)) {
    print(`The area of "${areaName}" (${unlockableArea}) is already unlocked.`);
    return;
  }

  setAreaUnlocked(unlockableArea);
  print(`Unlocked area: ${areaName} (${unlockableArea})`);
}

function unlockCard(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print(
      "You must specify the card name or the number corresponding to the card type.",
    );
    return;
  }

  const cardTypeNumber = tonumber(params);
  let cardType: CardType;
  if (cardTypeNumber === undefined) {
    const match = getMapPartialMatch(params, CARD_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown card: ${params}`);
      return;
    }

    cardType = match[1];
  } else {
    if (!isEnumValue(cardTypeNumber, CardType)) {
      print(`Unknown card type: ${cardTypeNumber}`);
      return;
    }
    cardType = cardTypeNumber;
  }

  const cardName = getCardName(cardType);
  if (isCardTypeUnlocked(cardType, false)) {
    print(`The card of "${cardName}" (${cardType}) is already unlocked.`);
    return;
  }

  setCardUnlocked(cardType);
  print(`Unlocked card: ${cardName} (${cardType})`);
}

function unlockChallenge(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print("You must specify the number corresponding to the challenge.");
    return;
  }

  const challenge = tonumber(params);
  if (challenge === undefined) {
    print(`That is not a valid number: ${params}`);
    return;
  }

  if (!isEnumValue(challenge, Challenge)) {
    print(`Invalid challenge number: ${params}`);
    return;
  }

  const challengeName = getChallengeName(challenge);
  if (isChallengeUnlocked(challenge, false)) {
    print(
      `The challenge of "${challengeName}" (${challenge}) is already unlocked.`,
    );
    return;
  }

  setChallengeUnlocked(challenge);
  print(`Unlocked challenge: ${challengeName} (${challenge})`);
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

  const characterName = getCharacterName(character);
  if (isCharacterUnlocked(character, false)) {
    print(
      `The character of "${characterName}" (${character}) is already unlocked.`,
    );
    return;
  }

  setCharacterUnlocked(character);
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
    if (!isEnumValue(collectibleTypeNumber, CollectibleType)) {
      print(`Unknown collectible type: ${collectibleTypeNumber}`);
      return;
    }
    collectibleType = collectibleTypeNumber;
  }

  const collectibleName = getCollectibleName(collectibleType);
  if (isCollectibleTypeUnlocked(collectibleType, false)) {
    print(
      `The collectible of "${collectibleName}" (${collectibleType}) is already unlocked.`,
    );
    return;
  }

  setCollectibleUnlocked(collectibleType);
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

  const pillEffectName = getPillEffectName(pillEffect);
  if (isPillEffectUnlocked(pillEffect, false)) {
    print(
      `The pill effect of "${pillEffectName}" (${pillEffect}) is already unlocked.`,
    );
    return;
  }

  setPillEffectUnlocked(pillEffect);
  print(`Unlocked pill effect: ${pillEffectName} (${pillEffect})`);
}

function unlockRoom(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print(
      "You must specify the room name or the number corresponding to the room type.",
    );
    return;
  }

  const roomTypeNumber = tonumber(params);
  let roomType: RoomType;
  if (roomTypeNumber === undefined) {
    const match = getMapPartialMatch(params, ROOM_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown room: ${params}`);
      return;
    }

    roomType = match[1];
  } else {
    roomType = asRoomType(roomTypeNumber);
  }

  const roomTypeName = getRoomTypeName(roomType);
  if (isRoomTypeUnlocked(roomType, false)) {
    print(`The room of "${roomTypeName}" (${roomType}) is already unlocked.`);
    return;
  }

  setRoomUnlocked(roomType);
  print(`Unlocked room: ${roomTypeName} (${roomType})`);
}

function unlockTrinket(params: string) {
  if (!isRandomizerEnabled()) {
    print(
      "Error: You are not currently in a randomizer playthrough, so you can not unlock anything.",
    );
    return;
  }

  if (params === "") {
    print(
      "You must specify the trinket name or the number corresponding to the trinket type.",
    );
    return;
  }

  const trinketTypeNumber = tonumber(params);
  let trinketType: TrinketType;
  if (trinketTypeNumber === undefined) {
    const match = getMapPartialMatch(params, TRINKET_NAME_TO_TYPE_MAP);
    if (match === undefined) {
      print(`Unknown trinket: ${params}`);
      return;
    }

    trinketType = match[1];
  } else {
    if (!isEnumValue(trinketTypeNumber, TrinketType)) {
      print(`Unknown trinket type: ${trinketTypeNumber}`);
      return;
    }
    trinketType = trinketTypeNumber;
  }

  const trinketName = getTrinketName(trinketType);
  if (isTrinketTypeUnlocked(trinketType, false)) {
    print(
      `The trinket of "${trinketName}" (${trinketType}) is already unlocked.`,
    );
    return;
  }

  setTrinketUnlocked(trinketType);
  print(`Unlocked trinket: ${trinketName} (${trinketType})`);
}
