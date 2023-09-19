interface DSSMod extends Mod {
  runMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;

  gamepadToggleButton: unknown;
  menuKeybindButton: unknown;
  paletteButton: unknown;
  menuHintButton: unknown;
  menuBuzzerButton: unknown;
}

export function DSSInitializerFunction(
  this: void,
  dssModName: string,
  dssCoreVersion: number,
  menuProvider: unknown,
): DSSMod;
