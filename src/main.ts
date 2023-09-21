import { initModFeatures, log } from "isaacscript-common";
import { BossKillDetection } from "./classes/BossKillDetection";
import { MOD_NAME } from "./constants";
import { initDeadSeaScrolls } from "./deadSeaScrolls";
import { debugFunction } from "./debugCode";
import { mod } from "./mod";

const MOD_FEATURES = [BossKillDetection] as const;

export function main(): void {
  log(`${MOD_NAME} initialized.`);

  initDeadSeaScrolls();
  mod.addConsoleCommand("d", debugFunction);

  initModFeatures(mod, MOD_FEATURES);
}
