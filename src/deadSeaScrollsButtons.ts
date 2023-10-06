import type { PlayerType } from "isaac-typescript-definitions";
import {
  MAIN_CHARACTERS,
  VANILLA_PILL_EFFECTS,
  getBatteryName,
  getBombName,
  getBossName,
  getCardName,
  getChallengeName,
  getCharacterName,
  getChestName,
  getCoinName,
  getCollectibleName,
  getHeartName,
  getKeyName,
  getPillEffectName,
  getSackName,
  getSlotName,
  getTrinketName,
  iRange,
  isOdd,
} from "isaacscript-common";
import {
  ALT_FLOORS,
  CHARACTER_OBJECTIVE_KINDS,
  OTHER_ACHIEVEMENT_KINDS,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import {
  canGetToBoss,
  canGetToCharacterObjectiveKind,
  getCompletedAchievements,
  getCompletedObjectives,
  getReachableNonStoryBossesSet,
  isAltFloorUnlocked,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isBossObjectiveCompleted,
  isCardTypeUnlocked,
  isChallengeObjectiveCompleted,
  isChallengeUnlocked,
  isCharacterObjectiveCompleted,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isGridEntityTypeUnlocked,
  isHeartSubTypeUnlocked,
  isKeySubTypeUnlocked,
  isOtherAchievementUnlocked,
  isPathUnlocked,
  isPillEffectUnlocked,
  isSackSubTypeUnlocked,
  isSlotVariantUnlocked,
  isTrinketTypeUnlocked,
} from "./classes/features/AchievementTracker";
import { getAltFloorName } from "./enums/AltFloor";
import {
  CharacterObjectiveKind,
  getCharacterObjectiveKindName,
} from "./enums/CharacterObjectiveKind";
import { getOtherAchievementName } from "./enums/OtherAchievementKind";
import { getPathName } from "./enums/UnlockablePath";
import { NO_HIT_BOSSES } from "./objectives";
import { getAchievementText } from "./types/Achievement";
import { getObjectiveText } from "./types/Objective";
import { UNLOCKABLE_CARD_TYPES } from "./unlockableCardTypes";
import { UNLOCKABLE_CHALLENGES } from "./unlockableChallenges";
import { UNLOCKABLE_CHARACTERS } from "./unlockableCharacters";
import { UNLOCKABLE_COLLECTIBLE_TYPES } from "./unlockableCollectibleTypes";
import {
  UNLOCKABLE_GRID_ENTITY_TYPES,
  getGridEntityName,
} from "./unlockableGridEntityTypes";
import {
  UNLOCKABLE_BATTERY_SUB_TYPES,
  UNLOCKABLE_BOMB_SUB_TYPES,
  UNLOCKABLE_CHEST_PICKUP_VARIANTS,
  UNLOCKABLE_COIN_SUB_TYPES,
  UNLOCKABLE_HEART_SUB_TYPES,
  UNLOCKABLE_KEY_SUB_TYPES,
  UNLOCKABLE_SACK_KEY_SUB_TYPES,
} from "./unlockablePickupTypes";
import { UNLOCKABLE_SLOT_VARIANTS } from "./unlockableSlotVariants";
import { UNLOCKABLE_TRINKET_TYPES } from "./unlockableTrinketTypes";

// -------------
// Miscellaneous
// -------------

export function getRecentAchievementsButtons(): DeadSeaScrollsButton[] {
  const completedAchievements = getCompletedAchievements();
  completedAchievements.reverse();

  const completedObjectives = getCompletedObjectives();
  completedObjectives.reverse();

  if (completedAchievements.length === 0) {
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

  for (const i of iRange(10)) {
    const achievement = completedAchievements[i];
    const objective = completedObjectives[i];

    if (achievement === undefined || objective === undefined) {
      continue;
    }

    const objectiveText = getObjectiveText(objective);

    buttons.push({
      str: `${i + 1}.`,
    });

    for (const [j, line] of objectiveText.entries()) {
      buttons.push({
        str: line.toLowerCase(),
        clr: isOdd(j) ? 3 : 0,
      });
    }

    buttons.push({
      str: "",
    });

    const achievementText = getAchievementText(achievement);

    for (const [j, line] of achievementText.entries()) {
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

  for (const character of MAIN_CHARACTERS) {
    const characterName = getCharacterName(character).toLowerCase();
    buttons.push({
      str: characterName,
      dest: `character${character}`,
    });
  }

  return buttons;
}

export function getSpecificCharacterObjectiveButtons(
  character: PlayerType,
): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const kind of CHARACTER_OBJECTIVE_KINDS) {
    let objectiveName = getCharacterObjectiveKindName(kind).toLowerCase();
    if (kind >= CharacterObjectiveKind.NO_HIT_BASEMENT_1) {
      objectiveName = `no dmg. on floor ${objectiveName}`;
    }

    const completed = isCharacterObjectiveCompleted(character, kind);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: objectiveName,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "(inaccessible)",
        fSize: 1,
        displayIf: () => !canGetToCharacterObjectiveKind(kind, false),
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getBossObjectiveButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  const reachableBosses = getReachableNonStoryBossesSet();

  for (const bossID of NO_HIT_BOSSES) {
    const bossName = getBossName(bossID).toLowerCase();
    const completed = isBossObjectiveCompleted(bossID);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: `${bossID} - ${bossName}`,
      },
      {
        str: completedText,
        clr: completed ? 0 : 3,
      },
      {
        str: "(inaccessible)",
        fSize: 1,
        displayIf: () => !canGetToBoss(bossID, reachableBosses, false),
      },
      {
        str: "",
      },
    );
  }

  return buttons;
}

export function getChallengeObjectiveButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const challenge of UNLOCKABLE_CHALLENGES) {
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

export function getPathUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const unlockablePath of UNLOCKABLE_PATHS) {
    const pathName = getPathName(unlockablePath).toLowerCase();
    const completed = isPathUnlocked(unlockablePath, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: pathName,
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

export function getAltFloorUnlockButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const altFloor of ALT_FLOORS) {
    const altFloorName = getAltFloorName(altFloor).toLowerCase();
    const completed = isAltFloorUnlocked(altFloor, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: altFloorName,
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

  for (const challenge of UNLOCKABLE_CHALLENGES) {
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

  for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
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

  for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
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

  for (const cardType of UNLOCKABLE_CARD_TYPES) {
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

  for (const pillEffect of VANILLA_PILL_EFFECTS) {
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

  for (const sackSubType of UNLOCKABLE_SACK_KEY_SUB_TYPES) {
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

  for (const otherAchievementKind of OTHER_ACHIEVEMENT_KINDS) {
    const otherAchievementName =
      getOtherAchievementName(otherAchievementKind)[1].toLowerCase();
    const completed = isOtherAchievementUnlocked(otherAchievementKind, false);
    const completedText = getCompletedText(completed);

    buttons.push(
      {
        str: otherAchievementName,
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
function getCompletedText(completed: boolean): string {
  return completed ? "^" : "x";
}
