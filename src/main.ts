import { ModCallback } from "isaac-typescript-definitions";

const MOD_NAME = "isaac-achievement-randomizer";

main();

function main() {
  const mod = RegisterMod(MOD_NAME, 1);

  mod.AddCallback(ModCallback.POST_PLAYER_INIT, postPlayerInit);

  Isaac.DebugString(`${MOD_NAME} initialized.`);
}

function postPlayerInit() {
  Isaac.DebugString("Callback fired: POST_PLAYER_INIT");
}
