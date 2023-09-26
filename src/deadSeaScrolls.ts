import { assertDefined, iRange, isOdd } from "isaacscript-common";
import { NUM_TOTAL_ACHIEVEMENTS } from "./achievementAssignment";
import {
  getAchievementText,
  getObjectiveText,
} from "./classes/features/AchievementText";
import {
  endRandomizer,
  getCompletedAchievements,
  getCompletedObjectives,
  getNumCompletedAchievements,
  getNumDeaths,
  getRandomizerSeed,
  getTimeElapsed,
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
          str: "achievementrandomizer 12345", // This must be lowercase.
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
      ],
    },

    achievementList: {
      title: "achievement list",
      buttons: [
        {
          str: "recent",
          dest: "recentAchievements",
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "character",
          dest: "characterAchievements",
        },
        {
          str: "challenge",
          dest: "challengeAchievements",
        },
      ],
    },

    recentAchievements: {
      title: "recent achievements",
      noCursor: true,
      scroller: true,

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getRecentAchievementsButtons();
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
            `${getNumCompletedAchievements()} / ${NUM_TOTAL_ACHIEVEMENTS}`,
          colorSelect: true,
        },
        {
          str: "",
        },
        {
          str: "deaths:",
        },
        {
          str: getNumDeaths,
          colorSelect: true,
        },
        {
          str: "",
        },
        {
          str: "total time:",
        },
        {
          str: getTimeElapsed,
          colorSelect: true,
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

function getRecentAchievementsButtons(): DeadSeaScrollsButton[] {
  const completedAchievements = getCompletedAchievements();
  completedAchievements.reverse();

  const completedObjectives = getCompletedObjectives();
  completedObjectives.reverse();

  if (completedAchievements.length === 0) {
    return [
      {
        str: "no achievements",
        noSel: true,
      },
      {
        str: "unlocked yet",
        noSel: true,
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

    for (const [j, line] of objectiveText.entries()) {
      const prefix = j === 0 ? `${i + 1}) ` : "";
      buttons.push({
        str: prefix + line.toLowerCase(),
        noSel: true,
        clr: isOdd(j) ? 3 : 0,
        fSize: 2,
      });
    }

    buttons.push({
      str: "",
      noSel: true,
    });

    const achievementText = getAchievementText(achievement);

    for (const [j, line] of achievementText.entries()) {
      const str =
        j === 0 ? `unlocked ${line.toLowerCase()}:` : line.toLowerCase();

      buttons.push({
        str,
        noSel: true,
        fSize: 2,
        clr: isOdd(j) ? 3 : 0,
      });
    }

    buttons.push({
      str: "",
      noSel: true,
    });
  }

  return buttons;
}
