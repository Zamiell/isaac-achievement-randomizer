import { BossID } from "isaac-typescript-definitions";

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

export function getUnlockablePathFromStoryBoss(
  bossID: BossID,
): UnlockablePath | undefined {
  switch (bossID) {
    // 6, 8, 24, 25, 39
    case BossID.MOM:
    case BossID.MOMS_HEART:
    case BossID.SATAN:
    case BossID.IT_LIVES:
    case BossID.ISAAC: {
      return undefined;
    }

    // 40
    case BossID.BLUE_BABY: {
      return UnlockablePath.CHEST;
    }

    // 54
    case BossID.LAMB: {
      return UnlockablePath.DARK_ROOM;
    }

    // 55
    case BossID.MEGA_SATAN: {
      return UnlockablePath.MEGA_SATAN;
    }

    // 62, 71
    case BossID.ULTRA_GREED:
    case BossID.ULTRA_GREEDIER: {
      return UnlockablePath.GREED_MODE;
    }

    // 63
    case BossID.HUSH: {
      return UnlockablePath.BLUE_WOMB;
    }

    // 70
    case BossID.DELIRIUM: {
      return UnlockablePath.VOID;
    }

    // 88, 89, 90
    case BossID.MOTHER:
    case BossID.MAUSOLEUM_MOM:
    case BossID.MAUSOLEUM_MOMS_HEART: {
      return UnlockablePath.REPENTANCE_FLOORS;
    }

    // 99, 100
    case BossID.DOGMA:
    case BossID.BEAST: {
      return UnlockablePath.ASCENT;
    }

    default: {
      return undefined;
    }
  }
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
