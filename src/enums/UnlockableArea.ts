import { BossID } from "isaac-typescript-definitions";
import { CharacterObjectiveKind } from "./CharacterObjectiveKind";

/** We want core areas to be static, but hard areas to be randomized. */
export enum UnlockableArea {
  WOMB, // By defeating Mom.
  CATHEDRAL, // By defeating It Lives.
  SHEOL, // By defeating Isaac.
  CHEST, // By defeating Satan.
  DARK_ROOM, // By defeating Blue Baby.
  MEGA_SATAN,
  BOSS_RUSH,
  BLUE_WOMB,
  VOID,
  REPENTANCE_FLOORS, // By defeating The Lamb.
  ASCENT,
  GREED_MODE,
}

export const STATIC_UNLOCKABLE_AREAS = [
  UnlockableArea.WOMB,
  UnlockableArea.CATHEDRAL,
  UnlockableArea.SHEOL,
  UnlockableArea.CHEST,
  UnlockableArea.DARK_ROOM,
  UnlockableArea.REPENTANCE_FLOORS,
] as const;

export function getUnlockableAreaFromStoryBoss(
  bossID: BossID,
): UnlockableArea | undefined {
  switch (bossID) {
    // 6, 8, 24, 25, 39
    case BossID.MOM: {
      return undefined;
    }

    // 8, 25
    case BossID.MOMS_HEART:
    case BossID.IT_LIVES: {
      return UnlockableArea.WOMB;
    }

    // 24
    case BossID.SATAN: {
      return UnlockableArea.SHEOL;
    }

    // 39
    case BossID.ISAAC: {
      return UnlockableArea.CATHEDRAL;
    }

    // 40
    case BossID.BLUE_BABY: {
      return UnlockableArea.CHEST;
    }

    // 54
    case BossID.LAMB: {
      return UnlockableArea.DARK_ROOM;
    }

    // 55
    case BossID.MEGA_SATAN: {
      return UnlockableArea.MEGA_SATAN;
    }

    // 62, 71
    case BossID.ULTRA_GREED:
    case BossID.ULTRA_GREEDIER: {
      return UnlockableArea.GREED_MODE;
    }

    // 63
    case BossID.HUSH: {
      return UnlockableArea.BLUE_WOMB;
    }

    // 70
    case BossID.DELIRIUM: {
      // Note that Delirium actually requires both Blue Womb and The Void, so this value is
      // misleading.
      return UnlockableArea.VOID;
    }

    // 88, 89, 90
    case BossID.MOTHER:
    case BossID.MAUSOLEUM_MOM:
    case BossID.MAUSOLEUM_MOMS_HEART: {
      return UnlockableArea.REPENTANCE_FLOORS;
    }

    // 99, 100
    case BossID.DOGMA:
    case BossID.BEAST: {
      return UnlockableArea.ASCENT;
    }

    default: {
      return undefined;
    }
  }
}

export function getUnlockableAreaFromCharacterObjectiveKind(
  kind: CharacterObjectiveKind,
): UnlockableArea | undefined {
  switch (kind) {
    case CharacterObjectiveKind.MOM: {
      return undefined;
    }

    case CharacterObjectiveKind.IT_LIVES: {
      return UnlockableArea.WOMB;
    }

    case CharacterObjectiveKind.ISAAC: {
      return UnlockableArea.CATHEDRAL;
    }

    case CharacterObjectiveKind.SATAN: {
      return UnlockableArea.SHEOL;
    }

    case CharacterObjectiveKind.BLUE_BABY: {
      return UnlockableArea.CHEST;
    }

    case CharacterObjectiveKind.LAMB: {
      return UnlockableArea.DARK_ROOM;
    }

    case CharacterObjectiveKind.MEGA_SATAN: {
      return UnlockableArea.MEGA_SATAN;
    }

    case CharacterObjectiveKind.BOSS_RUSH: {
      return UnlockableArea.BOSS_RUSH;
    }

    case CharacterObjectiveKind.HUSH: {
      return UnlockableArea.BLUE_WOMB;
    }

    case CharacterObjectiveKind.DELIRIUM: {
      // Note that Delirium actually requires both Blue Womb and The Void, so this value is
      // misleading.
      return UnlockableArea.VOID;
    }

    case CharacterObjectiveKind.MOTHER: {
      return UnlockableArea.REPENTANCE_FLOORS;
    }

    case CharacterObjectiveKind.BEAST: {
      return UnlockableArea.ASCENT;
    }

    case CharacterObjectiveKind.ULTRA_GREED: {
      return UnlockableArea.GREED_MODE;
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_1:
    case CharacterObjectiveKind.NO_HIT_BASEMENT_2:
    case CharacterObjectiveKind.NO_HIT_CAVES_1:
    case CharacterObjectiveKind.NO_HIT_CAVES_2:
    case CharacterObjectiveKind.NO_HIT_DEPTHS_1:
    case CharacterObjectiveKind.NO_HIT_DEPTHS_2:
    case CharacterObjectiveKind.NO_HIT_WOMB_1:
    case CharacterObjectiveKind.NO_HIT_WOMB_2:
    case CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL: {
      return undefined;
    }

    case CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST: {
      // Note that this can unlock from either Dark Room or The Chest, so this value is misleading.
      return UnlockableArea.CHEST;
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_1:
    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_2:
    case CharacterObjectiveKind.NO_HIT_MINES_1:
    case CharacterObjectiveKind.NO_HIT_MINES_2:
    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_1:
    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_2:
    case CharacterObjectiveKind.NO_HIT_CORPSE_1:
    case CharacterObjectiveKind.NO_HIT_CORPSE_2: {
      return UnlockableArea.REPENTANCE_FLOORS;
    }
  }
}

export function getAreaName(unlockableArea: UnlockableArea): string {
  switch (unlockableArea) {
    case UnlockableArea.WOMB: {
      return "The Womb";
    }

    case UnlockableArea.CATHEDRAL: {
      return "Cathedral";
    }

    case UnlockableArea.SHEOL: {
      return "Sheol";
    }

    case UnlockableArea.CHEST: {
      return "The Chest";
    }

    case UnlockableArea.DARK_ROOM: {
      return "Dark Room";
    }

    case UnlockableArea.MEGA_SATAN: {
      return "Mega Satan";
    }

    case UnlockableArea.BOSS_RUSH: {
      return "Boss Rush";
    }

    case UnlockableArea.BLUE_WOMB: {
      return "Blue Womb";
    }

    case UnlockableArea.VOID: {
      return "The Void";
    }

    case UnlockableArea.REPENTANCE_FLOORS: {
      return "Repentance Floors";
    }

    case UnlockableArea.ASCENT: {
      return "The Ascent";
    }

    case UnlockableArea.GREED_MODE: {
      return "Greed Mode";
    }
  }
}
