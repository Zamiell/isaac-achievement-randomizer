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

interface DeadSeaScrollsSubMenu {
  title: string;
  buttons?: DeadSeaScrollsButton[];
  noCursor?: boolean;
  scroller?: boolean;
  fSize?: int;
  generate?: (this: void, menu: DeadSeaScrollsSubMenu) => void;
}

interface DeadSeaScrollsButton {
  str: string | (() => string);
  action?: "resume" | "back";
  dest?: string;
  noSel?: boolean;
  clr?: int;
  colorSelect?: boolean;
  fSize?: int;
  tooltip?: {
    strSet: string[];
  };
  choices?: readonly string[];
  setting?: 1 | 2;
  variable?: string;
  displayIf?: () => boolean;
  func?: () => void;
  load?: () => 1 | 2;

  store?: (
    this: void,
    choiceIndex: 1 | 2,
    button: DeadSeaScrollsButton,
    item: DeadSeaScrollsSubMenu,
    tbl: DeadSeaScrollsMenuSettings,
  ) => void;
}

declare const DeadSeaScrollsMenu: DeadSeaScrollsMenu | undefined;
