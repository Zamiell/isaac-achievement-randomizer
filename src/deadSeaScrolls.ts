import { assertDefined } from "isaacscript-common";
import {
  endRandomizer,
  getRandomizerSeed,
  isRandomizerEnabled,
  startRandomizer,
} from "./classes/features/AchievementTracker";
import { MAX_SEED, MIN_SEED } from "./consoleCommands";
import { MOD_NAME } from "./constants";
import { init } from "./lib/dssmenucore";
import { mod } from "./mod";

const v = {
  persistent: {},
};

export function initDeadSeaScrolls(): void {
  mod.saveDataManager("deadSeaScrolls", v);
  const DSSMod = init(`${MOD_NAME}-DSS`, 1, v.persistent);

  const directory = {
    main: {
      title: "randomizer menu",
      buttons: [
        {
          str: "current seed:",
          noSel: true,
        },
        {
          str: "",
          colorSelect: true,
          noSel: true,

          /** @noSelf */
          update: (button: DeadSeaScrollsButton) => {
            const randomizerSeed = getRandomizerSeed();

            button.str =
              randomizerSeed === undefined
                ? "[disabled]"
                : randomizerSeed.toString();
          },
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "achievement list",
          dest: "achievements",
          tooltip: {
            strSet: ["see the", "unlocks you", "have yet", "to complete."],
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
          dest: "start",
          tooltip: {
            strSet: ["turn the", " randomizer", "on."],
          },
          displayIf: () => !isRandomizerEnabled(),
        },
        {
          str: "end randomizer",
          func: () => {
            endRandomizer();
          },
          tooltip: {
            strSet: ["turn the", " randomizer", "off."],
          },
          displayIf: () => isRandomizerEnabled(),
        },
        {
          str: "randomizer settings",
          dest: "randomizerSettings",
          tooltip: {
            strSet: ["customize the", "randomizer", "settings."],
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

    start: {
      title: "start",
      buttons: [
        {
          str: "use random seed",
          func: (_item: unknown, menuObj: DeadSeaScrollsMenuSettings) => {
            startRandomizer(undefined);
            menuObj.Close();
          },
        },
        {
          str: "use specific seed",
          dest: "specificSeed",
        },
      ],
    },

    specificSeed: {
      title: "specific seed",
      buttons: [
        {
          str: "open the console and type the",
          fSize: 1,
          noSel: true,
        },
        {
          str: "following command:",
          fSize: 1,
          noSel: true,
        },
        {
          str: "",
          fSize: 1,
          noSel: true,
        },
        {
          str: "achievementRandomizer 12345",
          fSize: 1,
          noSel: true,
          clr: 3,
        },
        {
          str: "",
          fSize: 1,
          noSel: true,
        },
        {
          str: 'where "12345" is the seed that you',
          fSize: 1,
          noSel: true,
        },
        {
          str: `want to use. (it must be between ${MIN_SEED} and`,
          fSize: 1,
          noSel: true,
        },
        {
          str: `${MAX_SEED}.)`,
          fSize: 1,
          noSel: true,
        },
      ],
    },

    achievements: {
      title: "achievements",
    },

    stats: {
      title: "stats",
      buttons: [
        {
          str: "time: 0",
          noSel: true,
        },
        {
          str: "deaths: 0",
          noSel: true,
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

  const directoryKey = {
    Item: directory.main,
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
