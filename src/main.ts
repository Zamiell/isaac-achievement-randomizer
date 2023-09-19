import { MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";

export function main(): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mod = RegisterMod(MOD_NAME, 1);

  Isaac.DebugString(`${MOD_NAME} initialized.`);

  initDeadSeaScrolls();
}
