import { log } from "isaacscript-common";
import { MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";

export function main(): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mod = RegisterMod(MOD_NAME, 1);

  log(`${MOD_NAME} initialized.`);

  initDeadSeaScrolls();
}
