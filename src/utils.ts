import { SoundEffect } from "isaac-typescript-definitions";
import {
  getPlayerHealth,
  setPlayerHealth,
  sfxManager,
} from "isaacscript-common";
import { mod } from "./mod";

/** By killing the player, the game will delete the save file for the current run. */
export function preventSaveAndQuit(): void {
  mod.runNextGameFrame(() => {
    const player = Isaac.GetPlayer();

    player.Kill();
    sfxManager.Stop(SoundEffect.DEATH_BURST_SMALL);

    mod.runNextGameFrame(() => {
      const futurePlayer = Isaac.GetPlayer();
      const playerHealth = getPlayerHealth(futurePlayer);
      futurePlayer.Revive();
      setPlayerHealth(futurePlayer, playerHealth);
      futurePlayer.StopExtraAnimation();
    });
  });
}
