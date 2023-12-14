import { PlayerType, SoundEffect } from "isaac-typescript-definitions";
import {
  getPlayerHealth,
  setPlayerHealth,
  sfxManager,
} from "isaacscript-common";
import { mod } from "./mod";

export function getAdjustedCharacterForObjective(
  player: EntityPlayer,
): PlayerType {
  const character = player.GetPlayerType();

  switch (character) {
    // 11
    case PlayerType.LAZARUS_2: {
      return PlayerType.LAZARUS;
    }

    // 12
    case PlayerType.DARK_JUDAS: {
      return PlayerType.JUDAS;
    }

    // 17
    case PlayerType.SOUL: {
      return PlayerType.FORGOTTEN;
    }

    // 38
    case PlayerType.LAZARUS_2_B: {
      return PlayerType.LAZARUS_2;
    }

    // 39
    case PlayerType.JACOB_2_B: {
      return PlayerType.JACOB_B;
    }

    // 40
    case PlayerType.SOUL_B: {
      return PlayerType.FORGOTTEN_B;
    }

    default: {
      return character;
    }
  }
}

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
