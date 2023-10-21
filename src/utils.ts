import {
  CollectibleType,
  ItemPoolType,
  PlayerType,
  SoundEffect,
} from "isaac-typescript-definitions";
import {
  game,
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

export function isItemPoolsDepleted(): boolean {
  const itemPool = game.GetItemPool();
  const collectibleType = itemPool.GetCollectible(
    ItemPoolType.TREASURE,
    false,
    undefined,
    CollectibleType.KEY_PIECE_1,
  );

  return collectibleType === CollectibleType.KEY_PIECE_1;
}
