interface DeadSeaScrollsMenu {
  AddMenu: (
    this: void,
    name: string,
    settings: DeadSeaScrollsMenuSettings,
  ) => void;

  Close: (fullClose: boolean, noAnimate: boolean) => void;
  IsOpen: () => boolean;
}

interface DeadSeaScrollsMenuSettings {
  Run: () => void;
  Open: () => void;
  Close: (fullClose: boolean, noAnimate: boolean) => void;

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

interface DeadSeaScrollsMenu {
  title: string;
  buttons: DeadSeaScrollsButton[];
  noCursor?: boolean;
  fSize?: int;
}

interface DeadSeaScrollsButton {
  str: string;
  dest?: string;
  noSel?: boolean;
  clr?: int;
  colorSelect?: boolean;
  fSize?: int;
  displayIf?: () => boolean;
  func?: () => void;
}

declare const DeadSeaScrollsMenu: DeadSeaScrollsMenu | undefined;
