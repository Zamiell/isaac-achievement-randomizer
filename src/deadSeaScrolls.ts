import { assertDefined } from "isaacscript-common";
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
          str: "achievementrandomizer 12345", // This must be lowercase.
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
      buttons: [
        {
          str: "no achievements",
          noSel: true,
          displayIf: () => getNumCompletedAchievements() === 0,
        },
        {
          str: "unlocked yet",
          noSel: true,
          displayIf: () => getNumCompletedAchievements() === 0,
        },
        {
          str: () => getRecentAchievementText(1, 1),
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 1,
        },
        {
          str: () => getRecentAchievementText(1, 2),
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 1,
        },
        {
          str: () => getRecentAchievementText(1, 3),
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 1,
        },
        {
          str: "",
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 1,
        },
        {
          str: () => getRecentAchievementText(2, 1),
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 2,
        },
        {
          str: "",
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 2,
        },
        {
          str: () => getRecentAchievementText(3, 1),
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 3,
        },
        {
          str: "",
          noSel: true,
          displayIf: () => getNumCompletedAchievements() >= 3,
        },
      ],
    },

    stats: {
      title: "stats",
      buttons: [
        {
          str: "achievements:",
          noSel: true,
        },
        {
          str: () =>
            `${getNumCompletedAchievements()} / ${NUM_TOTAL_ACHIEVEMENTS}`,
          noSel: true,
          colorSelect: true,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "deaths:",
          noSel: true,
        },
        {
          str: getNumDeaths,
          noSel: true,
          colorSelect: true,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "total time:",
          noSel: true,
        },
        {
          str: getTimeElapsed,
          noSel: true,
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

function getRecentAchievementText(num: int, lineNum: 1 | 2 | 3 | 4): string {
  const index = num * -1;

  switch (lineNum) {
    case 1: {
      const completedObjectives = getCompletedObjectives();
      const objective = completedObjectives.at(index);
      if (objective === undefined) {
        error(`Failed to find the objective at index: ${index}`);
      }

      const objectiveText = getObjectiveText(objective);
      return objectiveText[0];
    }

    case 2: {
      const completedAchievements = getCompletedAchievements();
      const achievement = completedAchievements.at(index);
      if (achievement === undefined) {
        error(`Failed to find the achievement at index: ${index}`);
      }
      const achievementText = getAchievementText(achievement);
      return `${num}) ${
        achievementText[0]
      } - ${achievementText[1].toLowerCase()}`;
    }

    case 3: {
      return "todo";
    }

    case 4: {
      return "todo";
    }
  }
}
