import type { PlayerType } from "isaac-typescript-definitions";
import { Difficulty } from "isaac-typescript-definitions";
import {
  LAST_VANILLA_CARD_TYPE,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  LAST_VANILLA_PILL_EFFECT,
  LAST_VANILLA_TRINKET_TYPE,
  getBatteryName,
  getBombName,
  getCardName,
  getChallengeName,
  getCharacterName,
  getChestName,
  getCoinName,
  getCollectibleName,
  getHeartName,
  getKeyName,
  getPillEffectName,
  getRoomTypeName,
  getSackName,
  getSlotName,
  getTrinketName,
  iRange,
  isOdd,
  splitNumber,
} from "isaacscript-common";
import { UNLOCKABLE_CARD_TYPES } from "./arrays/unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "./arrays/unlockableChallenges";
import {
  PLAYABLE_CHARACTERS,
  UNLOCKABLE_CHARACTERS,
} from "./arrays/unlockableCharacters";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./arrays/unlockableCollectibleTypes";
import {
  UNLOCKABLE_GRID_ENTITY_TYPES,
  getGridEntityName,
} from "./arrays/unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_SUB_TYPES,
} from "./arrays/unlockablePickupTypes";
import { UNLOCKABLE_PILL_EFFECTS } from "./arrays/unlockablePillEffects";
import { UNLOCKABLE_ROOM_TYPES } from "./arrays/unlockableRoomTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "./arrays/unlockableSlotVariants";
import { UNLOCKABLE_TRINKET_TYPES } from "./arrays/unlockableTrinketTypes";
import {
  CHARACTER_OBJECTIVE_KINDS,
  OTHER_UNLOCK_KINDS,
  UNLOCKABLE_AREAS,
} from "./cachedEnums";
import { canGetToCharacterObjective } from "./classes/features/AchievementRandomizer";
import {
  isAllCharacterObjectivesCompleted,
  isChallengeObjectiveCompleted,
  isChallengeRangeObjectivesCompleted,
  isCharacterObjectiveCompleted,
} from "./classes/features/achievementTracker/completedObjectives";
import {
  isAreaUnlocked,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isChallengeUnlocked,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGridEntityTypeUnlocked,
  isHeartSubTypeUnlocked,
  isKeySubTypeUnlocked,
  isOtherUnlockKindUnlocked,
  isPillEffectUnlocked,
  isRoomTypeUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
  isTrinketTypeUnlocked,
} from "./classes/features/achievementTracker/completedUnlocks";
import {
  getAchievementHistory,
  isCardTypeInPlaythrough,
  isCollectibleTypeInPlaythrough,
  isPillEffectInPlaythrough,
  isTrinketTypeInPlaythrough,
} from "./classes/features/achievementTracker/v";
import { DIFFICULTIES } from "./constants";
import {
  CharacterObjectiveKind,
  getCharacterObjectiveKindName,
} from "./enums/CharacterObjectiveKind";
import { getOtherUnlockName } from "./enums/OtherUnlockKind";
import { getAreaName } from "./enums/UnlockableArea";
import { getObjectiveFromID, getObjectiveText } from "./types/Objective";
import { getUnlockFromID, getUnlockText } from "./types/Unlock";

export const MENU_PAGE_SIZE = 25;

// -------------
// Miscellaneous
// -------------

export function getRecentAchievementsButtons(): DeadSeaScrollsButton[] {
  const achievementHistory = getAchievementHistory().toReversed();

  if (achievementHistory.length === 0) {
    return [
      {
        str: "no achievements",
      },
      {
        str: "unlocked yet.",
      },
    ];
  }

  const buttons: DeadSeaScrollsButton[] = [];

  for (const i of iRange(MENU_PAGE_SIZE)) {
    const achievementTuple = achievementHistory[i];
    if (achievementTuple === undefined) {
      continue;
    }

    const [runNum, achievement] = achievementTuple;
    const { objectiveID, unlockID } = achievement;

    const objective = getObjectiveFromID(objectiveID);
    const objectiveText = getObjectiveText(objective);

    buttons.push(
      {
        str: `${i + 1}.`,
      },
      {
        str: "",
      },
      {
        str: `run #${runNum}`,
      },
      {
        str: "",
      },
    );

    for (const [j, line] of objectiveText.entries()) {
      buttons.push({
        str: line.toLowerCase(),
        clr: isOdd(j) ? 3 : 0,
      });
    }

    buttons.push({
      str: "",
    });

    const unlock = getUnlockFromID(unlockID);
    const unlockText = getUnlockText(unlock);

    for (const [j, line] of unlockText.entries()) {
      const str =
        j === 0 ? `unlocked ${line.toLowerCase()}:` : line.toLowerCase();

      buttons.push({
        str,
        clr: isOdd(j) ? 3 : 0,
      });
    }

    buttons.push({
      str: "",
    });
  }

  return buttons;
}

// -----------------
// Objective buttons
// -----------------

export function getCharacterObjectiveButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const character of PLAYABLE_CHARACTERS) {
    const characterName = getCharacterName(character).toLowerCase();
    buttons.push({
      str: `${getCompletedText(
        isAllCharacterObjectivesCompleted(character),
      )} - ${characterName}`,
      dest: `characterObjectives${character}`,
    });
  }

  return buttons;
}

export function getSpecificCharacterObjectiveButtons(
  character: PlayerType,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const kind of CHARACTER_OBJECTIVE_KINDS) {
    for (const difficulty of DIFFICULTIES) {
      const difficultyText =
        difficulty === Difficulty.NORMAL ? "(normal)" : "(hard)";
      const objectiveName = getCharacterObjectiveKindName(kind).toLowerCase();
      const objectiveLines =
        kind < CharacterObjectiveKind.NO_HIT_BASEMENT
          ? [`${objectiveName} ${difficultyText}`]
          : ["no hits on", `${objectiveName} ${difficultyText}`];

      const completed = isCharacterObjectiveCompleted(
        character,
        kind,
        difficulty,
      );
      const completedText = getCompletedText(completed);

      for (const line of objectiveLines) {
        buttons.push({
          str: line,
        });
      }

      buttons.push(
        {
          str: completedText,
          clr: completed ? 0 : 3,
        },
        {
          str: "(inaccessible)",
          fSize: 1,
          displayIf: () => !canGetToCharacterObjective(character, kind, false),
        },
        {
          str: "",
        },
      );
    }
  }

  return buttons;
}

export function getChallengeObjectiveButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  // We can use `UNLOCKABLE_CHALLENGES.length` here because the only banned challenge is the final
  // one. In other words, having the final page go to 45 would look like a bug.
  const chunks = splitNumber(UNLOCKABLE_CHALLENGES.length, MENU_PAGE_SIZE);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    const challengeRangeCompleted = isChallengeRangeObjectivesCompleted(
      min,
      max,
    );
    const completedText = getCompletedText(challengeRangeCompleted);
    buttons.push({
      str: `${completedText} - ${min}-${max}`,
      dest: `challengeObjectives${min}`,
    });
  }

  return buttons;
}

export function getSpecificChallengeObjectiveButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const challenge of UNLOCKABLE_CHALLENGES) {
    if (challenge < min || challenge > max) {
      continue;
    }

    const challengeName = getChallengeName(challenge).toLowerCase();
    const challengeNameTruncated = getNameTruncated(challengeName);
    const completed = isChallengeObjectiveCompleted(challenge);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${challenge} - ${challengeNameTruncated}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "(inaccessible)",
        fSize: 1,
        displayIf: () => !isChallengeUnlocked(challenge, false),
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

// --------------
// Unlock buttons
// --------------

export function getCharacterUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const character of UNLOCKABLE_CHARACTERS) {
    const characterName = getCharacterName(character).toLowerCase();
    const completed = isCharacterUnlocked(character, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: characterName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getAreaUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const unlockableArea of UNLOCKABLE_AREAS) {
    const areaName = getAreaName(unlockableArea).toLowerCase();
    const completed = isAreaUnlocked(unlockableArea, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: areaName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getRoomUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const roomType of UNLOCKABLE_ROOM_TYPES) {
    const roomTypeName = getRoomTypeName(roomType).toLowerCase();
    const completed = isRoomTypeUnlocked(roomType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: roomTypeName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getChallengeUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  // We can use `UNLOCKABLE_CHALLENGES.length` here because the only banned challenge is the final
  // one. In other words, having the final page go to 45 would look like a bug.
  const chunks = splitNumber(UNLOCKABLE_CHALLENGES.length, MENU_PAGE_SIZE);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    buttons.push({
      str: `${min}-${max}`,
      dest: `challengeUnlocks${min}`,
    });
  }

  return buttons;
}

export function getSpecificChallengeUnlockButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const challenge of UNLOCKABLE_CHALLENGES) {
    if (challenge < min || challenge > max) {
      continue;
    }

    const challengeName = getChallengeName(challenge).toLowerCase();
    const challengeNameTruncated = getNameTruncated(challengeName);
    const completed = isChallengeUnlocked(challenge, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${challenge} - ${challengeNameTruncated}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getCollectibleUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  const chunks = splitNumber(LAST_VANILLA_COLLECTIBLE_TYPE, MENU_PAGE_SIZE);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    buttons.push({
      str: `${min}-${max}`,
      dest: `collectibleUnlocks${min}`,
    });
  }

  return buttons;
}

export function getSpecificCollectibleUnlockButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
    if (collectibleType < min || collectibleType > max) {
      continue;
    }

    if (!isCollectibleTypeInPlaythrough(collectibleType)) {
      continue;
    }

    const collectibleName = getCollectibleName(collectibleType).toLowerCase();
    const completed = isCollectibleTypeUnlocked(collectibleType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${collectibleType} - ${collectibleName}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getTrinketUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  const chunks = splitNumber(LAST_VANILLA_TRINKET_TYPE, MENU_PAGE_SIZE);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    buttons.push({
      str: `${min}-${max}`,
      dest: `trinketUnlocks${min}`,
    });
  }

  return buttons;
}

export function getSpecificTrinketUnlockButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
    if (trinketType < min || trinketType > max) {
      continue;
    }

    if (!isTrinketTypeInPlaythrough(trinketType)) {
      continue;
    }

    const trinketName = getTrinketName(trinketType).toLowerCase();
    const completed = isTrinketTypeUnlocked(trinketType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${trinketType} - ${trinketName}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getCardUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  const chunks = splitNumber(LAST_VANILLA_CARD_TYPE, MENU_PAGE_SIZE);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    buttons.push({
      str: `${min}-${max}`,
      dest: `cardUnlocks${min}`,
    });
  }

  return buttons;
}

export function getSpecificCardUnlockButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const cardType of UNLOCKABLE_CARD_TYPES) {
    if (cardType < min || cardType > max) {
      continue;
    }

    if (!isCardTypeInPlaythrough(cardType)) {
      continue;
    }

    const cardName = getCardName(cardType).toLowerCase();
    const completed = isCardTypeUnlocked(cardType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: cardName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getPillEffectUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  // Pill effects start at 0.
  const chunks = splitNumber(LAST_VANILLA_PILL_EFFECT, MENU_PAGE_SIZE, true);
  for (const chunk of chunks) {
    const [min, max] = chunk;
    buttons.push({
      str: `${min}-${max}`,
      dest: `pillEffectUnlocks${min}`,
    });
  }

  return buttons;
}

export function getSpecificPillEffectUnlockButtons(
  min: int,
  max: int,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const pillEffect of UNLOCKABLE_PILL_EFFECTS) {
    if (pillEffect < min || pillEffect > max) {
      continue;
    }

    if (!isPillEffectInPlaythrough(pillEffect)) {
      continue;
    }

    const pillEffectName = getPillEffectName(pillEffect).toLowerCase();
    const pillEffectNameTruncated = getNameTruncated(pillEffectName);
    const completed = isPillEffectUnlocked(pillEffect, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${pillEffect} - ${pillEffectNameTruncated}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getHeartUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const heartSubType of UNLOCKABLE_HEART_SUB_TYPES) {
    const heartName = getHeartName(heartSubType).toLowerCase();
    const completed = isHeartSubTypeUnlocked(heartSubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: heartName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getCoinUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const coinSubType of UNLOCKABLE_COIN_SUB_TYPES) {
    const coinName = getCoinName(coinSubType).toLowerCase();
    const completed = isCoinSubTypeUnlocked(coinSubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: coinName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getBombUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const bombSubType of UNLOCKABLE_BOMB_SUB_TYPES) {
    const bombName = getBombName(bombSubType).toLowerCase();
    const completed = isBombSubTypeUnlocked(bombSubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: bombName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getKeyUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const keySubType of UNLOCKABLE_KEY_SUB_TYPES) {
    const keyName = getKeyName(keySubType).toLowerCase();
    const completed = isKeySubTypeUnlocked(keySubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: keyName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getBatteryUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const batterySubType of UNLOCKABLE_BATTERY_SUB_TYPES) {
    const batteryName = getBatteryName(batterySubType).toLowerCase();
    const completed = isBatterySubTypeUnlocked(batterySubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: batteryName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getSackUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const sackSubType of UNLOCKABLE_SACK_SUB_TYPES) {
    const sackName = getSackName(sackSubType).toLowerCase();
    const completed = isSackSubTypeUnlocked(sackSubType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: sackName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getChestUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const pickupVariant of UNLOCKABLE_CHEST_PICKUP_VARIANTS) {
    const chestName = getChestName(pickupVariant).toLowerCase();
    const completed = isChestPickupVariantUnlocked(pickupVariant, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: chestName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getSlotUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const slotVariant of UNLOCKABLE_SLOT_VARIANTS) {
    const slotName = getSlotName(slotVariant).toLowerCase();
    const completed = isSlotVariantUnlocked(slotVariant, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: slotName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getGridEntityUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const gridEntityType of UNLOCKABLE_GRID_ENTITY_TYPES) {
    const gridEntityName = getGridEntityName(gridEntityType).toLowerCase();
    const completed = isGridEntityTypeUnlocked(gridEntityType, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: gridEntityName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getOtherUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const otherUnlockKind of OTHER_UNLOCK_KINDS) {
    const otherUnlockName =
      getOtherUnlockName(otherUnlockKind)[1].toLowerCase();
    const completed = isOtherUnlockKindUnlocked(otherUnlockKind, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: otherUnlockName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

// -----------
// Subroutines
// -----------

function getNameTruncated(name: string): string {
  return name.length > 19 ? `${name.slice(0, 19)}...` : name;
}

/** We manually replaced the caret image in the "16font.png" file from a caret to a checkmark. */
export function getCompletedText(completed: boolean): string {
  return completed ? "^" : "x";
}
