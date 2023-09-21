interface DeadSeaScrollsMenuSettings {
  Run: () => void;
  Open: () => void;
  Close: () => void;

  UseSubMenu: boolean;
  Directory: unknown;
  DirectoryKey: unknown;
}

interface DeadSeaScrollsMenu {
  AddMenu: (
    this: void,
    name: string,
    settings: DeadSeaScrollsMenuSettings,
  ) => void;

  IsOpen: () => boolean;
}

declare const DeadSeaScrollsMenu: DeadSeaScrollsMenu | undefined;
