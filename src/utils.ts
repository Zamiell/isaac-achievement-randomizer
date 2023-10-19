import { PlayerType } from "isaac-typescript-definitions";

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
