import type { PlayerType } from "isaac-typescript-definitions";
import {
  MAIN_CHARACTERS,
  VANILLA_PILL_EFFECTS,
  assertDefined,
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
import { ALL_ACHIEVEMENTS } from "./achievements";
import {
  ALT_FLOORS,
  CHARACTER_OBJECTIVE_KINDS,
  OTHER_ACHIEVEMENT_KINDS,
  UNLOCKABLE_PATHS,
} from "./cachedEnums";
import {
  canGetToBoss,
  canGetToCharacterObjectiveKind,
  endRandomizer,
  getCompletedAchievements,
  getCompletedObjectives,
  getNumCompletedAchievements,
  getRandomizerSeed,
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
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementTracker";
import {
  getPlaythroughNumCompletedRuns,
  getPlaythroughNumDeaths,
  getPlaythroughTimeElapsed,
} from "./classes/features/StatsTracker";
import { isRandomizerEnabled } from "./classes/features/achievementTracker/v";
import { MAX_SEED, MIN_SEED } from "./consoleCommands";
import { MOD_NAME } from "./constants";
import { getAltFloorName } from "./enums/AltFloor";
import {
  CharacterObjectiveKind,
  getCharacterObjectiveKindName,
} from "./enums/CharacterObjectiveKind";
import { getOtherAchievementName } from "./enums/OtherAchievementKind";
import { RandomizerMode } from "./enums/RandomizerMode";
import { getPathName } from "./enums/UnlockablePath";
import type { DSSMod } from "./lib/dssmenucore";
import { init } from "./lib/dssmenucore";
import { mod } from "./mod";
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

const DSS_CHOICES = ["disabled", "enabled"] as const;

const v = {
  persistent: {
    timer: 1, // Equal to the first DSS choice.
  },
};

export function isTimerEnabled(): boolean {
  return v.persistent.timer === 2;
}

export function initDeadSeaScrolls(): void {
  mod.saveDataManager("deadSeaScrolls", v);
  const DSSMod = init(`${MOD_NAME}-DSS`, 1, v.persistent);

  const directory: Record<string, unknown> = {
    main: {
      title: "randomizer menu",
      fSize: 2,
      buttons: [
        {
          str: "current seed:",
          noSel: true,
        },
        {
          str: () => getRandomizerSeed() ?? "[disabled]",
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "achievement list",
          dest: "achievementList",
          tooltip: {
            strSet: ["see your", "remaining", "objectives", "and unlocks."],
          },
          displayIf: () => isRandomizerEnabled(),
        },
        {
          str: "stats",
          dest: "stats",
          tooltip: {
            strSet: [
              "see stats",
              "about your",
              "current",
              "randomizer",
              "playthrough.",
            ],
          },
          displayIf: () => isRandomizerEnabled(),
        },
        {
          str: "start randomizer",
          dest: "selectSeed",
          tooltip: {
            strSet: ["turn the", " randomizer", "on."],
          },
          displayIf: () => !isRandomizerEnabled(),
        },
        {
          str: "end randomizer",
          dest: "end",
          tooltip: {
            strSet: [
              "turn the",
              " randomizer",
              "off.",
              "",
              "(this will",
              "delete your",
              "progress.)",
            ],
          },
          displayIf: () => isRandomizerEnabled(),
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "randomizer info",
          dest: "randomizerInfo",
          tooltip: {
            strSet: ["see more", "information", "about this", "mod."],
          },
        },
        {
          str: "randomizer settings",
          dest: "randomizerSettings",
          tooltip: {
            strSet: ["customize the", "timer", "and other", "settings."],
          },
        },
        {
          str: "menu settings",
          dest: "menuSettings",
          tooltip: {
            strSet: ["customize the", "menu hotkey", "and other", "settings."],
          },
        },
        {
          str: "resume game",
          action: "resume",
          tooltip: {
            strSet: ["close this", "menu and", "return to the", "game."],
          },
        },
      ],
    },

    selectSeed: {
      title: "select seed",

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        if (isValidSituationForStartingRandomizer()) {
          menu.buttons = [
            {
              str: "use random seed",
              dest: "selectMode",
            },
            {
              str: "use specific seed",
              dest: "specificSeed",
            },
          ];
          menu.noCursor = false;
          menu.fSize = 3;
        } else {
          menu.buttons = [
            {
              str: "you must be on a hard",
            },
            {
              str: "mode run and not inside",
            },
            {
              str: "a challenge in order to",
            },
            {
              str: "start the randomizer.",
            },
          ];
          menu.noCursor = true;
          menu.fSize = 2;
        }
      },
    },

    specificSeed: {
      title: "specific seed",
      noCursor: true,
      fSize: 1,
      buttons: [
        {
          str: "open the console and type the",
        },
        {
          str: "following command:",
        },
        {
          str: "",
        },
        {
          str: "achievementrandomizer casual 12345", // This must be lowercase.
          clr: 3,
        },
        {
          str: "",
        },
        {
          str: 'where "12345" is the seed that you',
        },
        {
          str: `want to use. (it must be between ${MIN_SEED} and`,
        },
        {
          str: `${MAX_SEED}.)`,
        },
        {
          str: "",
        },
        {
          str: 'change "casual" to "hardcore" if',
        },
        {
          str: "you want to play on hardcore mode.",
        },
      ],
    },

    selectMode: {
      title: "select mode",
      fSize: 2,
      buttons: [
        {
          str: "casual (full random)",
          func: () => {
            startRandomizerFromDSS(RandomizerMode.CASUAL, DSSMod);
          },
        },
        {
          str: "hardcore (logic)",
          func: () => {
            startRandomizerFromDSS(RandomizerMode.HARDCORE, DSSMod);
          },
        },
      ],
    },

    end: {
      title: "end",
      buttons: [
        {
          str: "cancel",
          action: "back",
          tooltip: {
            strSet: ["go back."],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "confirm",
          func: () => {
            endRandomizer();
          },
          tooltip: {
            strSet: ["make sure", "you have a", "backup, if", "needed."],
          },
        },
      ],
    },

    achievementList: {
      title: "achievement list",
      buttons: [
        {
          str: "recent ach.",
          dest: "recentAchievements",
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "objective list",
          dest: "objectives",
        },
        {
          str: "unlock list",
          dest: "unlocks",
        },
      ],
    },

    recentAchievements: {
      title: "recent ach.",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getRecentAchievementsButtons();
      },
    },

    objectives: {
      title: "objective list",
      buttons: [
        {
          str: "characters",
          dest: "characterObjectives",
        },
        {
          str: "bosses",
          dest: "bossObjectives",
        },
        {
          str: "challenges",
          dest: "challengeObjectives",
        },
      ],
    },

    characterObjectives: {
      title: "character todo",
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCharacterObjectiveButtons();
      },
    },

    bossObjectives: {
      title: "boss todo",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getBossObjectiveButtons();
      },
    },

    challengeObjectives: {
      title: "challenge todo",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getChallengeObjectiveButtons();
      },
    },

    unlocks: {
      title: "unlock list",
      fSize: 2,
      buttons: [
        {
          str: "characters",
          dest: "characterUnlocks",
        },
        {
          str: "paths",
          dest: "pathUnlocks",
        },
        {
          str: "alt floors",
          dest: "altFloorUnlocks",
        },
        {
          str: "challenges",
          dest: "challengeUnlocks",
        },
        {
          str: "collectibles",
          dest: "collectibleUnlocks",
        },
        {
          str: "trinkets",
          dest: "trinketUnlocks",
        },
        {
          str: "cards",
          dest: "cardUnlocks",
        },
        {
          str: "pill effects",
          dest: "pillEffectUnlocks",
        },
        {
          str: "hearts",
          dest: "heartUnlocks",
        },
        {
          str: "coins",
          dest: "coinUnlocks",
        },
        {
          str: "bombs",
          dest: "bombUnlocks",
        },
        {
          str: "keys",
          dest: "keyUnlocks",
        },
        {
          str: "batteries",
          dest: "batteryUnlocks",
        },
        {
          str: "sacks",
          dest: "sackUnlocks",
        },
        {
          str: "chests",
          dest: "chestUnlocks",
        },
        {
          str: "slots",
          dest: "slotUnlocks",
        },
        {
          str: "grid entities",
          dest: "gridEntityUnlocks",
        },
        {
          str: "other",
          dest: "otherUnlocks",
        },
      ],
    },

    characterUnlocks: {
      title: "character unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCharacterUnlockButtons();
      },
    },

    pathUnlocks: {
      title: "path unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getPathUnlockButtons();
      },
    },

    altFloorUnlocks: {
      title: "alt floor unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getAltFloorUnlockButtons();
      },
    },

    challengeUnlocks: {
      title: "challenge unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getChallengeUnlockButtons();
      },
    },

    collectibleUnlocks: {
      title: "collectible unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCollectibleUnlockButtons();
      },
    },

    trinketUnlocks: {
      title: "trinket unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getTrinketUnlockButtons();
      },
    },

    cardUnlocks: {
      title: "card unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCardUnlockButtons();
      },
    },

    pillEffectUnlocks: {
      title: "pill effect unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getPillEffectUnlockButtons();
      },
    },

    heartUnlocks: {
      title: "heart unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getHeartUnlockButtons();
      },
    },

    coinUnlocks: {
      title: "coin unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCoinUnlockButtons();
      },
    },

    bombUnlocks: {
      title: "bomb unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getBombUnlockButtons();
      },
    },

    keyUnlocks: {
      title: "key unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getKeyUnlockButtons();
      },
    },

    batteryUnlocks: {
      title: "battery unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getBatteryUnlockButtons();
      },
    },

    sackUnlocks: {
      title: "sack unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getSackUnlockButtons();
      },
    },

    chestUnlocks: {
      title: "chest unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getChestUnlockButtons();
      },
    },

    slotUnlocks: {
      title: "slot unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getSlotUnlockButtons();
      },
    },

    gridEntityUnlocks: {
      title: "grid entity unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getGridEntityUnlockButtons();
      },
    },

    otherUnlocks: {
      title: "other unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getOtherUnlockButtons();
      },
    },

    stats: {
      title: "stats",
      noCursor: true,
      buttons: [
        {
          str: "achievements:",
        },
        {
          str: () =>
            `${getNumCompletedAchievements()} / ${ALL_ACHIEVEMENTS.length}`,
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "completed runs:",
        },
        {
          str: getPlaythroughNumCompletedRuns,
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "deaths:",
        },
        {
          str: getPlaythroughNumDeaths,
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "total time:",
        },
        {
          str: getPlaythroughTimeElapsed,
          colorSelect: true,
          noSel: true,
        },
      ],
    },

    randomizerInfo: {
      title: "randomizer info",
      noCursor: true,
      fSize: 2,
      buttons: [
        {
          str: "created by:",
        },
        {
          str: "zamiel",
          clr: 3,
        },
        {
          str: "",
        },
        {
          str: "read the manual:",
        },
        {
          str: "",
        },
        {
          str: "https://github.com/zamiell/",
          fSize: 1,
        },
        {
          str: "isaac-achievement-randomizer",
          fSize: 1,
        },
        {
          str: "",
          fSize: 1,
        },
        {
          str: "(zamiell is capitalized and has two l's.)",
          fSize: 1,
        },
      ],
    },

    randomizerSettings: {
      title: "randomizer settings",
      buttons: [
        {
          str: "show timer",
          choices: DSS_CHOICES,
          setting: 1,
          variable: "timer",

          load: () => v.persistent.timer,

          /** @noSelf */
          store: (choiceIndex: int) => {
            v.persistent.timer = choiceIndex;
          },

          tooltip: {
            strSet: ["whether to", "show the", "timer beneath", "the stat ui."],
          },
        },
      ],
    },

    menuSettings: {
      title: "settings",
      buttons: [
        DSSMod.gamepadToggleButton,
        DSSMod.menuKeybindButton,
        DSSMod.paletteButton,
        DSSMod.menuHintButton,
        DSSMod.menuBuzzerButton,
      ],
    },
  };

  for (const character of MAIN_CHARACTERS) {
    const characterName = getCharacterName(character).toLowerCase();

    directory[`character${character}`] = {
      title: characterName,
      noCursor: true,
      scroller: true,
      fSize: 2,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getSpecificCharacterObjectiveButtons(character);
      },
    };
  }

  const directoryKey = {
    Item: directory["main"],
    Main: "main",
    Idle: false,
    MaskAlpha: 1,
    Settings: {},
    SettingsChanged: false,
    Path: {},
  };

  const settings = {
    Run: DSSMod.runMenu,
    Open: DSSMod.openMenu,
    Close: DSSMod.closeMenu,
    UseSubMenu: false,
    Directory: directory,
    DirectoryKey: directoryKey,
  };

  assertDefined(
    DeadSeaScrollsMenu,
    "Dead Sea Scrolls failed to initialize the global variable.",
  );

  DeadSeaScrollsMenu.AddMenu(MOD_NAME, settings);
}

function startRandomizerFromDSS(
  randomizerMode: RandomizerMode,
  dssMod: DSSMod,
) {
  // The DSS menu text will continue to be drawn on the screen on top of the "Loading" text from
  // this mod. So, disable DSS until the next run.
  dssMod.setEnabled(false);

  startRandomizer(randomizerMode, undefined);
}

// -------
// Buttons
// -------

function getRecentAchievementsButtons(): DeadSeaScrollsButton[] {
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

function getCharacterObjectiveButtons(): DeadSeaScrollsButton[] {
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

function getSpecificCharacterObjectiveButtons(
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

function getBossObjectiveButtons(): DeadSeaScrollsButton[] {
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

function getChallengeObjectiveButtons(): DeadSeaScrollsButton[] {
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

function getCharacterUnlockButtons(): DeadSeaScrollsButton[] {
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

function getPathUnlockButtons(): DeadSeaScrollsButton[] {
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

function getAltFloorUnlockButtons(): DeadSeaScrollsButton[] {
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

function getChallengeUnlockButtons(): DeadSeaScrollsButton[] {
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

function getCollectibleUnlockButtons(): DeadSeaScrollsButton[] {
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

function getTrinketUnlockButtons(): DeadSeaScrollsButton[] {
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

function getCardUnlockButtons(): DeadSeaScrollsButton[] {
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

function getPillEffectUnlockButtons(): DeadSeaScrollsButton[] {
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

function getHeartUnlockButtons(): DeadSeaScrollsButton[] {
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

function getCoinUnlockButtons(): DeadSeaScrollsButton[] {
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

function getBombUnlockButtons(): DeadSeaScrollsButton[] {
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

function getKeyUnlockButtons(): DeadSeaScrollsButton[] {
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

function getBatteryUnlockButtons(): DeadSeaScrollsButton[] {
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

function getSackUnlockButtons(): DeadSeaScrollsButton[] {
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

function getChestUnlockButtons(): DeadSeaScrollsButton[] {
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

function getSlotUnlockButtons(): DeadSeaScrollsButton[] {
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

function getGridEntityUnlockButtons(): DeadSeaScrollsButton[] {
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

function getOtherUnlockButtons(): DeadSeaScrollsButton[] {
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
