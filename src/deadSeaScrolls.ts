import { assertDefined } from "isaacscript-common";
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
      title: "randomizer menu", // Must be lowercase.
      buttons: [
        {
          str: "current seed:",
          noSel: true,
        },
        {
          str: "[disabled]",
          noSel: true,
        },
        {
          str: "",
          noSel: true,
        },
        {
          str: "achievement list",
          dest: "achievements",
          tooltip: {
            strSet: ["see the", "unlocks you", "have yet", "to complete"],
          },
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
              "playthrough",
            ],
          },
        },
        {
          str: "menu settings",
          dest: "settings",
          tooltip: {
            strSet: ["customize the", "menu hotkey", "and other", "settings"],
          },
        },
        {
          str: "resume game",
          action: "resume",
          tooltip: {
            strSet: ["close this", "menu and", "return to the", "game"],
          },
        },
      ],
    },

    settings: {
      title: "settings",
      buttons: [
        DSSMod.gamepadToggleButton,
        DSSMod.menuKeybindButton,
        DSSMod.paletteButton,
        DSSMod.menuHintButton,
        DSSMod.menuBuzzerButton,
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
