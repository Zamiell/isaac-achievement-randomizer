interface DeadSeaScrollsMenu {
  AddMenu: (
    this: void,
    name: string,
    settings: DeadSeaScrollsMenuSettings,
  ) => void;

  AddPalettes: (palettes: DeadSeaScrollsPalette[]) => void;

  IsOpen: () => boolean;
}

interface DeadSeaScrollsMenuSettings {
  Run: () => void;
  Open: () => void;
  Close: () => void;

  UseSubMenu: boolean;
  Directory: unknown;
  DirectoryKey: unknown;
}

interface DeadSeaScrollsPalette {
  Name: string;
  [1]: [r: int, g: int, b: int];
  [2]: [r: int, g: int, b: int];
  [3]: [r: int, g: int, b: int];
}

interface DeadSeaScrollsButton {
  str: string;
}

declare const DeadSeaScrollsMenu: DeadSeaScrollsMenu | undefined;