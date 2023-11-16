import {
  LAST_VANILLA_CARD_TYPE,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  LAST_VANILLA_PILL_EFFECT,
  LAST_VANILLA_TRINKET_TYPE,
  ReadonlyMap,
  assertDefined,
  getCharacterName,
  splitNumber,
} from "isaacscript-common";
import { version } from "../package.json";
import { ALL_OBJECTIVES } from "./arrays/allObjectives";
import { UNLOCKABLE_CHALLENGES } from "./arrays/unlockableChallenges";
import { PLAYABLE_CHARACTERS } from "./arrays/unlockableCharacters";
import {
  endRandomizer,
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementRandomizer";
import {
  getPlaythroughNumCompletedRuns,
  getPlaythroughNumDeaths,
  getPlaythroughTimeElapsed,
  hasDoubleUnlocked,
  hasGeneratedWithCheat,
  hasIllegalPause,
  hasSavedAndQuit,
  hasUsedMods,
} from "./classes/features/StatsTracker";
import {
  isAllChallengeObjectivesCompleted,
  isAllCharactersObjectivesCompleted,
} from "./classes/features/achievementTracker/completedObjectives";
import {
  getNumCompletedObjectives,
  getRandomizerMode,
  getRandomizerSeed,
  isRandomizerEnabled,
} from "./classes/features/achievementTracker/v";
import { DSS_CHOICE_DISABLED, v } from "./config";
import { MAX_SEED, MIN_SEED } from "./consoleCommands";
import { MOD_NAME } from "./constants";
import {
  MENU_PAGE_SIZE,
  getAreaUnlockButtons,
  getBatteryUnlockButtons,
  getBombUnlockButtons,
  getCardUnlockButtons,
  getChallengeObjectiveButtons,
  getChallengeUnlockButtons,
  getCharacterObjectiveButtons,
  getCharacterUnlockButtons,
  getChestUnlockButtons,
  getCoinUnlockButtons,
  getCollectibleUnlockButtons,
  getCompletedText,
  getGridEntityUnlockButtons,
  getHeartUnlockButtons,
  getKeyUnlockButtons,
  getOtherUnlockButtons,
  getPillEffectUnlockButtons,
  getRecentAchievementsButtons,
  getRoomUnlockButtons,
  getSackUnlockButtons,
  getSlotUnlockButtons,
  getSpecificCardUnlockButtons,
  getSpecificChallengeObjectiveButtons,
  getSpecificChallengeUnlockButtons,
  getSpecificCharacterObjectiveButtons,
  getSpecificCollectibleUnlockButtons,
  getSpecificPillEffectUnlockButtons,
  getSpecificTrinketUnlockButtons,
  getTrinketUnlockButtons,
} from "./deadSeaScrollsButtons";
import { RandomizerMode } from "./enums/RandomizerMode";
import type { DSSMod } from "./lib/dssmenucore";
import { init } from "./lib/dssmenucore";
import { mod } from "./mod";

const DSS_CHOICES = ["disabled", "enabled"] as const;

const UNBAN_KEY_TO_NAME = new ReadonlyMap<
  keyof typeof v.persistent.cheat.generation,
  string
>([
  ["unbanEdensBlessing", "Eden's Blessing"], // 381
  ["unbanPlanC", "Plan C"], // 475
  ["unbanClicker", "Clicker"], // 482
  ["unbanMetronome", "Metronome"], // 488
  ["unbanRKey", "R Key"], // 636
  ["unbanTMTRAINER", "TMTRAINER"], // 721
  ["unbanError", "Error"], // 75
  ["unbanKarma", "Karma"], // 85
  ["unbanM", "'M"], // 138
  ["unbanChaosCard", "Chaos Card"], // 42
]);

export function initDeadSeaScrolls(): void {
  mod.saveDataManager("deadSeaScrolls", v);
  const DSSMod = init(`${MOD_NAME}-DSS`, v.persistent.deadSeaScrolls);

  const directory: Record<string, DeadSeaScrollsSubMenu> = {
    main: {
      title: "randomizer menu",
      fSize: 2,
      buttons: [
        {
          str: "playthrough seed:",
          noSel: true,
        },
        {
          str: () => getRandomizerSeed()?.toString() ?? "[disabled]",
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

      generate: (menu) => {
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
              str: "you must be not inside",
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
          str: "startrandomizer casual 12345", // This must be lowercase.
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
      buttons: [
        {
          str: "casual",
          func: () => {
            startRandomizerFromDSS(RandomizerMode.CASUAL, DSSMod);
          },
        },
        {
          str: "(full random)",
          noSel: true,
          fSize: 2,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "hardcore",
          func: () => {
            startRandomizerFromDSS(RandomizerMode.HARDCORE, DSSMod);
          },
        },
        {
          str: "(progressive unlocks)",
          noSel: true,
          fSize: 2,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "nightmare",
          func: () => {
            startRandomizerFromDSS(RandomizerMode.NIGHTMARE, DSSMod);
          },
        },
        {
          str: "(pain)",
          noSel: true,
          fSize: 2,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "[read the manual for more info.]",
          noSel: true,
          fSize: 1,
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

      generate: (menu) => {
        menu.buttons = getRecentAchievementsButtons();
      },
    },

    objectives: {
      title: "objective list",
      buttons: [
        {
          str: `${getCompletedText(
            isAllCharactersObjectivesCompleted(),
          )} - characters`,
          dest: "characterObjectives",
        },
        {
          str: `${getCompletedText(
            isAllChallengeObjectivesCompleted(),
          )} - challenges`,
          dest: "challengeObjectives",
        },
      ],
    },

    characterObjectives: {
      title: "character todo",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getCharacterObjectiveButtons();
      },
    },

    challengeObjectives: {
      title: "challenge todo",
      fSize: 2,

      generate: (menu) => {
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
          str: "areas",
          dest: "areaUnlocks",
        },
        {
          str: "rooms",
          dest: "roomUnlocks",
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

      generate: (menu) => {
        menu.buttons = getCharacterUnlockButtons();
      },
    },

    areaUnlocks: {
      title: "area unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getAreaUnlockButtons();
      },
    },

    roomUnlocks: {
      title: "room unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getRoomUnlockButtons();
      },
    },

    challengeUnlocks: {
      title: "challenge unlocks",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getChallengeUnlockButtons();
      },
    },

    collectibleUnlocks: {
      title: "collectible unlocks",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getCollectibleUnlockButtons();
      },
    },

    trinketUnlocks: {
      title: "trinket unlocks",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getTrinketUnlockButtons();
      },
    },

    cardUnlocks: {
      title: "card unlocks",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getCardUnlockButtons();
      },
    },

    pillEffectUnlocks: {
      title: "pill effect unlocks",
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getPillEffectUnlockButtons();
      },
    },

    heartUnlocks: {
      title: "heart unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getHeartUnlockButtons();
      },
    },

    coinUnlocks: {
      title: "coin unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getCoinUnlockButtons();
      },
    },

    bombUnlocks: {
      title: "bomb unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getBombUnlockButtons();
      },
    },

    keyUnlocks: {
      title: "key unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getKeyUnlockButtons();
      },
    },

    batteryUnlocks: {
      title: "battery unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getBatteryUnlockButtons();
      },
    },

    sackUnlocks: {
      title: "sack unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSackUnlockButtons();
      },
    },

    chestUnlocks: {
      title: "chest unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getChestUnlockButtons();
      },
    },

    slotUnlocks: {
      title: "slot unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSlotUnlockButtons();
      },
    },

    gridEntityUnlocks: {
      title: "grid entity unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getGridEntityUnlockButtons();
      },
    },

    otherUnlocks: {
      title: "other unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getOtherUnlockButtons();
      },
    },

    stats: {
      title: "stats",
      noCursor: true,
      scroller: true,
      fSize: 2,
      buttons: [
        {
          str: "randomizer mode:",
        },
        {
          str: () => getRandomizerMode(),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "objectives:",
        },
        {
          str: () =>
            `${getNumCompletedObjectives()} / ${ALL_OBJECTIVES.length}`,
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
          str: () => getPlaythroughNumCompletedRuns().toString(),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "deaths/resets:",
        },
        {
          str: () => getPlaythroughNumDeaths().toString(),
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
        {
          str: "",
        },
        {
          str: "ever illegally paused?",
        },
        {
          str: () => (hasIllegalPause() ? "yes" : "no"),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "ever illegally saved and",
        },
        {
          str: "quit and continued a run?",
        },
        {
          str: () => (hasSavedAndQuit() ? "yes" : "no"),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "ever illegally double",
        },
        {
          str: "unlocked?",
        },
        {
          str: () => (hasDoubleUnlocked() ? "yes" : "no"),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "ever used illegally",
        },
        {
          str: "mods?",
        },
        {
          str: () => (hasUsedMods() ? "yes" : "no"),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
        {
          str: "ever used illegal",
        },
        {
          str: "items?",
        },
        {
          str: () => (hasGeneratedWithCheat() ? "yes" : "no"),
          colorSelect: true,
          noSel: true,
        },
        {
          str: "",
        },
      ],
    },

    randomizerInfo: {
      title: "randomizer info",
      noCursor: true,
      fSize: 2,
      buttons: [
        {
          str: "version:",
        },
        {
          str: version,
          clr: 3,
        },
        {
          str: "",
        },
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
          str: "(zamiell has two l's on github.)",
          fSize: 1,
        },
      ],
    },

    randomizerSettings: {
      title: "randomizer settings",
      fSize: 2,
      buttons: [
        {
          str: "show timer",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "timer",

          load: () => v.persistent.timer,

          store: (choiceIndex) => {
            v.persistent.timer = choiceIndex;
          },

          tooltip: {
            strSet: ["whether to", "show the", "timer beneath", "the stat ui."],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "prevent illegal pausing",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "preventPause",

          load: () => v.persistent.preventPause,

          store: (choiceIndex) => {
            v.persistent.preventPause = choiceIndex;
          },

          tooltip: {
            strSet: [
              "whether to",
              "prevent",
              "pausing in",
              "rooms with",
              "enemies.",
            ],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "prevent illegal s+q",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "preventSaveAndQuit",

          load: () => v.persistent.preventSaveAndQuit,

          store: (choiceIndex) => {
            v.persistent.preventSaveAndQuit = choiceIndex;
          },

          tooltip: {
            strSet: [
              "whether to",
              "prevent",
              "saving and",
              "quitting and",
              "continuing a",
              "run.",
            ],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "delay achievement text",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "delayAchievementText",

          load: () => v.persistent.delayAchievementText,

          store: (choiceIndex) => {
            v.persistent.delayAchievementText = choiceIndex;
          },

          tooltip: {
            strSet: [
              "whether to",
              "delay",
              "achievement",
              "text that",
              "displays in",
              "the middle",
              "of a battle.",
            ],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "cheat settings",
          dest: "cheatSettings",
          tooltip: {
            strSet: [
              "options to",
              "make to make",
              "the game",
              "easier for",
              "noobs.",
            ],
          },
        },
      ],
    },

    cheatSettings: {
      title: "cheat settings",
      fSize: 2,
      buttons: [
        {
          str: "double unlocks",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "doubleUnlocks",

          load: () => v.persistent.cheat.doubleUnlocks,

          store: (choiceIndex) => {
            v.persistent.cheat.doubleUnlocks = choiceIndex;
          },

          tooltip: {
            strSet: [
              "whether to",
              "make hard",
              "mode unlocks",
              "count as",
              "normal mode",
              "unlocks.",
            ],
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "allow mods",
          choices: DSS_CHOICES,
          setting: DSS_CHOICE_DISABLED,
          variable: "allowMods",

          load: () => v.persistent.cheat.allowMods,

          store: (choiceIndex) => {
            v.persistent.cheat.allowMods = choiceIndex;
          },

          tooltip: {
            strSet: ["whether to", "allow other", "mods that", "add items."],
          },
        },
        {
          str: "",
          noSel: true,
        },
      ],
    },

    menuSettings: {
      title: "settings",
      fSize: 2,
      buttons: [
        DSSMod.gamepadToggleButton,
        {
          str: "",
          noSel: true,
        },
        DSSMod.menuKeybindButton,
        {
          str: "",
          noSel: true,
        },
        DSSMod.paletteButton,
        {
          str: "",
          noSel: true,
        },
        DSSMod.menuHintButton,
        {
          str: "",
          noSel: true,
        },
        DSSMod.menuBuzzerButton,
        {
          str: "",
          noSel: true,
        },
      ],
    },
  };

  // Fill in the "characterObjectivesFoo" menus.
  for (const character of PLAYABLE_CHARACTERS) {
    const characterName = getCharacterName(character).toLowerCase();

    directory[`characterObjectives${character}`] = {
      title: characterName,
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificCharacterObjectiveButtons(character);
      },
    };
  }

  // Fill in the "challengeObjectivesFoo" and "challengeUnlocksFoo" menus. We can use
  // `UNLOCKABLE_CHALLENGES.length` here because the only banned challenge is the final one. In
  // other words, having the final page go to 45 would look like a bug.
  const challengeChunks = splitNumber(
    UNLOCKABLE_CHALLENGES.length,
    MENU_PAGE_SIZE,
  );
  for (const chunk of challengeChunks) {
    const [min, max] = chunk;

    directory[`challengeObjectives${min}`] = {
      title: "challenge todo",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificChallengeObjectiveButtons(min, max);
      },
    };

    directory[`challengeUnlocks${min}`] = {
      title: "challenge unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificChallengeUnlockButtons(min, max);
      },
    };
  }

  // Fill in the "collectibleUnlocksFoo" menus.
  const collectibleChunks = splitNumber(
    LAST_VANILLA_COLLECTIBLE_TYPE,
    MENU_PAGE_SIZE,
  );
  for (const chunk of collectibleChunks) {
    const [min, max] = chunk;

    directory[`collectibleUnlocks${min}`] = {
      title: "collectible unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificCollectibleUnlockButtons(min, max);
      },
    };
  }

  // Fill in the "trinketUnlocksFoo" menus.
  const trinketChunks = splitNumber(LAST_VANILLA_TRINKET_TYPE, MENU_PAGE_SIZE);
  for (const chunk of trinketChunks) {
    const [min, max] = chunk;

    directory[`trinketUnlocks${min}`] = {
      title: "trinket unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificTrinketUnlockButtons(min, max);
      },
    };
  }

  // Fill in the "cardUnlocksFoo" menus.
  const cardChunks = splitNumber(LAST_VANILLA_CARD_TYPE, MENU_PAGE_SIZE);
  for (const chunk of cardChunks) {
    const [min, max] = chunk;

    directory[`cardUnlocks${min}`] = {
      title: "card unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificCardUnlockButtons(min, max);
      },
    };
  }

  // Fill in the "pillEffectUnlocksFoo" menus.
  const pillEffectChunks = splitNumber(
    LAST_VANILLA_PILL_EFFECT,
    MENU_PAGE_SIZE,
    true, // Pill effects start at 0.
  );
  for (const chunk of pillEffectChunks) {
    const [min, max] = chunk;

    directory[`pillEffectUnlocks${min}`] = {
      title: "pill effect unlocks",
      noCursor: true,
      scroller: true,
      fSize: 2,

      generate: (menu) => {
        menu.buttons = getSpecificPillEffectUnlockButtons(min, max);
      },
    };
  }

  // Fill in the "cheatSettings" menus.
  const { cheatSettings } = directory;
  assertDefined(
    cheatSettings,
    "Failed to find the directory key: cheatSettings",
  );
  const cheatSettingsButtons = cheatSettings.buttons;
  assertDefined(
    cheatSettingsButtons,
    "Failed to find the cheat settings buttons.",
  );
  for (const [key, nameRaw] of UNBAN_KEY_TO_NAME) {
    const name = nameRaw.toLowerCase();

    cheatSettingsButtons.push(
      {
        str: `unban ${name}`,
        choices: DSS_CHOICES,
        setting: DSS_CHOICE_DISABLED,
        variable: key,

        load: () => v.persistent.cheat.generation[key],

        store: (choiceIndex) => {
          v.persistent.cheat.generation[key] = choiceIndex;
        },

        tooltip: {
          strSet: [
            "whether to",
            "unban",
            `${name}.`,
            "",
            "(this only",
            "takes effect",
            "when starting",
            "a new",
            "playthrough.)",
          ],
        },
      },
      {
        str: "",
        noSel: true,
      },
    );
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
