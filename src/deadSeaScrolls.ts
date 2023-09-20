import { MOD_NAME } from "./constants";
import { init } from "./lib/dssmenucore";

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

// eslint-disable-next-line isaacscript/require-v-registration
const v = {};

export function initDeadSeaScrolls(): void {
  const DSSMod = init(`${MOD_NAME}-DSS`, 1, v);

  const directory = {
    main: {
      title: "randomizer", // Must be lowercase. "achievement randomizer" is too long.
      buttons: [
        // Menu Settings
        { str: "resume game", action: "resume" },
        { str: "menu settings", dest: "settings" },
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
