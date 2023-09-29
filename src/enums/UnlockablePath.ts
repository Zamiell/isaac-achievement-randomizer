export enum UnlockablePath {
  CHEST,
  DARK_ROOM,
  MEGA_SATAN,
  BOSS_RUSH,
  BLUE_WOMB,
  VOID,
  REPENTANCE_FLOORS,
  ASCENT,
  GREED_MODE,
  BLACK_MARKETS,
}

export function getPathName(unlockablePath: UnlockablePath): string {
  switch (unlockablePath) {
    case UnlockablePath.CHEST: {
      return "The Chest";
    }

    case UnlockablePath.DARK_ROOM: {
      return "Dark Room";
    }

    case UnlockablePath.MEGA_SATAN: {
      return "Mega Satan";
    }

    case UnlockablePath.BOSS_RUSH: {
      return "Boss Rush";
    }

    case UnlockablePath.BLUE_WOMB: {
      return "Blue Womb";
    }

    case UnlockablePath.VOID: {
      return "The Void";
    }

    case UnlockablePath.REPENTANCE_FLOORS: {
      return "Repentance floors";
    }

    case UnlockablePath.ASCENT: {
      return "The Ascent";
    }

    case UnlockablePath.GREED_MODE: {
      return "Greed Mode";
    }

    case UnlockablePath.BLACK_MARKETS: {
      return "Black Markets";
    }
  }
}
