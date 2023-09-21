export function init(
  this: void,
  dssModName: string,
  dssCoreVersion: number,
  v: unknown,
): DSSMod;

// ts-prune-ignore-next
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
