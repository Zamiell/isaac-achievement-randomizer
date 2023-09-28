import type { PlayerType } from "isaac-typescript-definitions";
import { Challenge } from "isaac-typescript-definitions";
import {
  MAIN_CHARACTERS,
  assertDefined,
  getChallengeName,
  getCharacterName,
  iRange,
  isOdd,
} from "isaacscript-common";
import { NUM_TOTAL_ACHIEVEMENTS } from "./achievementAssignment";
import { CHALLENGES, CHARACTER_OBJECTIVE_KINDS } from "./cachedEnums";
import {
  getAchievementText,
  getCharacterObjectiveKindName,
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
  isChallengeObjectiveCompleted,
  isCharacterObjectiveCompleted,
  isRandomizerEnabled,
  startRandomizer,
} from "./classes/features/AchievementTracker";
import { MAX_SEED, MIN_SEED } from "./consoleCommands";
import { MOD_NAME } from "./constants";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { init } from "./lib/dssmenucore";
import { mod } from "./mod";

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
          str: "randomizer settings",
          dest: "randomizerSettings",
          tooltip: {
            strSet: ["customize the", "timer", "and other", "settings."],
          },
          displayIf: () => isRandomizerEnabled(),
        },
        {
          str: "end randomizer",
          func: () => {
            endRandomizer();
          },
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
          dest: "characterObjectives",
        },
        {
          str: "challenge",
          dest: "challengeObjectives",
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

    characterObjectives: {
      title: "character todo",

      /** @noSelf */
      generate: (menu: DeadSeaScrollsMenu) => {
        menu.buttons = getCharacterButtons();
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
          noSel: true,
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
          noSel: true,
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
          noSel: true,
        },
      ],
    },

    randomizerSettings: {
      title: "randomizer settings",
      buttons: [
        {
          str: "timer",
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

function getCharacterButtons(): DeadSeaScrollsButton[] {
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

  for (const characterObjectiveKind of CHARACTER_OBJECTIVE_KINDS) {
    let objectiveName = getCharacterObjectiveKindName(
      characterObjectiveKind,
    ).toLowerCase();
    if (characterObjectiveKind >= CharacterObjectiveKind.NO_HIT_BASEMENT_1) {
      objectiveName = `no dmg. on floor ${objectiveName}`;
    }

    const completed = isCharacterObjectiveCompleted(
      character,
      characterObjectiveKind,
    );
    const completedText = completed ? "completed" : "x";

    buttons.push(
      {
        str: objectiveName,
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

function getChallengeObjectiveButtons(): DeadSeaScrollsButton[] {
  const buttons: DeadSeaScrollsButton[] = [];

  for (const challenge of CHALLENGES) {
    if (challenge === Challenge.NULL) {
      continue;
    }

    let challengeName = getChallengeName(challenge).toLowerCase();
    if (challengeName.length > 19) {
      challengeName = `${challengeName.slice(0, 19)}...`;
    }

    const completed = isChallengeObjectiveCompleted(challenge);
    const completedText = completed ? "completed" : "x";

    buttons.push(
      {
        str: `${challenge} - ${challengeName}`,
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
