import { todo } from "isaacscript-common";
import { MOD_NAME } from "./constants";
import { DSSInitializerFunction } from "./lib/dssmenucore";

interface DeadSeaScrollsMenuSettings {
  Run: () => void;
  Open: () => void;
  Close: () => void;
  UseSubMenu: boolean;
  Directory: unknown;
  DirectoryKey: unknown;
}

declare const DeadSeaScrollsMenu: {
  AddMenu: (
    this: void,
    name: string,
    settings: DeadSeaScrollsMenuSettings,
  ) => void;
};

function loadSaveData() {
  return {
    MenuPalette: 1,
  };
}

function storeSaveData() {
  todo();
}

const menuProvider = {
  SaveSaveData: () => {},
  GetPaletteSetting: () => {},
  SavePaletteSetting: () => {},
  GetHudOffsetSetting: () => {},
  SaveHudOffsetSetting: () => {},
  GetGamepadToggleSetting: () => {},
  SaveGamepadToggleSetting: () => {},
  GetMenuKeybindSetting: () => {},
  SaveMenuKeybindSetting: () => {},
  GetMenuHintSetting: () => {},
  SaveMenuHintSetting: () => {},
  GetMenuBuzzerSetting: () => {},
  SaveMenuBuzzerSetting: () => {},
  GetMenusNotified: () => {},
  SaveMenusNotified: () => {},
  GetMenusPoppedUp: () => {},
  SaveMenusPoppedUp: () => {},
};

export function initDeadSeaScrolls(): void {
  const DSSMod = DSSInitializerFunction(`${MOD_NAME}-DSS`, 1, menuProvider);

  const directory = {
    main: {
      title: "achievements",
      buttons: [
        /*
        {
          str: "arbitrary switch",
          choices: ["on", "off"],
          setting: 1,
          variable: "arbitraryChoiceOption",

          load: () => {},
          store: () => {},
          tooltip: {
            strset: ["which do you", "prefer?"],
          },
        },
        */

        /*
        DSSMod.gamepadToggleButton,
        DSSMod.menuKeybindButton,
        // DSSMod.paletteButton,
        DSSMod.menuHintButton,
        DSSMod.menuBuzzerButton,
        */

        // Resume Game

        // Menu Settings
        { str: "resume game", action: "resume" },
        { str: "menu settings", dest: "menusettings" },
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
  DeadSeaScrollsMenu.AddMenu("Achievement Randomizer", settings);
}
