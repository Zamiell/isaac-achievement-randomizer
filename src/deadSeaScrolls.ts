import {
  MAIN_CHARACTERS,
  assertDefined,
  getCharacterName,
} from "isaacscript-common";
import {
  endRandomizer,
  getNumCompletedUnlocks,
  isValidSituationForStartingRandomizer,
  startRandomizer,
} from "./classes/features/AchievementTracker";
import {
  getPlaythroughNumCompletedRuns,
  getPlaythroughNumDeaths,
  getPlaythroughTimeElapsed,
} from "./classes/features/StatsTracker";
import {
  getRandomizerSeed,
  isRandomizerEnabled,
} from "./classes/features/achievementTracker/v";
import { MAX_SEED, MIN_SEED } from "./consoleCommands";
import { MOD_NAME } from "./constants";
import {
  getAltFloorUnlockButtons,
  getBatteryUnlockButtons,
  getBombUnlockButtons,
  getBossObjectiveButtons,
  getCardUnlockButtons,
  getChallengeObjectiveButtons,
  getChallengeUnlockButtons,
  getCharacterObjectiveButtons,
  getCharacterUnlockButtons,
  getChestUnlockButtons,
  getCoinUnlockButtons,
  getCollectibleUnlockButtons,
  getGridEntityUnlockButtons,
  getHeartUnlockButtons,
  getKeyUnlockButtons,
  getOtherUnlockButtons,
  getPathUnlockButtons,
  getPillEffectUnlockButtons,
  getRecentAchievementsButtons,
  getSackUnlockButtons,
  getSlotUnlockButtons,
  getSpecificCharacterObjectiveButtons,
  getTrinketUnlockButtons,
} from "./deadSeaScrollsButtons";
import { RandomizerMode } from "./enums/RandomizerMode";
import type { DSSMod } from "./lib/dssmenucore";
import { init } from "./lib/dssmenucore";
import { mod } from "./mod";
import { ALL_UNLOCKS } from "./unlocks";

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
          str: "unlocks:",
        },
        {
          str: () => `${getNumCompletedUnlocks()} / ${ALL_UNLOCKS.length}`,
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
