import {
  BeastVariant,
  BossID,
  EntityType,
  FallenVariant,
  MinibossID,
  RoomType,
} from "isaac-typescript-definitions";
import {
  doesEntityExist,
  game,
  getBossID,
  getBossName,
  getHighestEnumValue,
  getRoomSubType,
  validateCustomEnum,
} from "isaacscript-common";

const HIGHEST_BOSS_ID = getHighestEnumValue(BossID);

export const BossIDCustom = {
  ULTRA_PRIDE: (HIGHEST_BOSS_ID + 1) as BossID, // 46.2 / MinibossID.ULTRA_PRIDE (14)
  KRAMPUS: (HIGHEST_BOSS_ID + 2) as BossID, // 81.1 / MinibossID.KRAMPUS (15)
  URIEL: (HIGHEST_BOSS_ID + 3) as BossID, // 271
  GABRIEL: (HIGHEST_BOSS_ID + 4) as BossID, // 272
  ULTRA_FAMINE: (HIGHEST_BOSS_ID + 5) as BossID, // 951.10
  ULTRA_PESTILENCE: (HIGHEST_BOSS_ID + 6) as BossID, // 951.20
  ULTRA_WAR: (HIGHEST_BOSS_ID + 7) as BossID, // 951.30
  ULTRA_DEATH: (HIGHEST_BOSS_ID + 8) as BossID, // 951.40
} as const;

validateCustomEnum("BossIDCustom", BossIDCustom);

export function getBossNameCustom(bossID: BossID): string {
  switch (bossID) {
    case BossIDCustom.ULTRA_PRIDE: {
      return "Ultra Pride";
    }

    case BossIDCustom.KRAMPUS: {
      return "Krampus";
    }

    case BossIDCustom.URIEL: {
      return "Uriel";
    }

    case BossIDCustom.GABRIEL: {
      return "Gabriel";
    }

    case BossIDCustom.ULTRA_FAMINE: {
      return "Ultra Famine";
    }

    case BossIDCustom.ULTRA_PESTILENCE: {
      return "Ultra Pestilence";
    }

    case BossIDCustom.ULTRA_WAR: {
      return "Ultra War";
    }

    case BossIDCustom.ULTRA_DEATH: {
      return "Ultra Death";
    }

    default: {
      return getBossName(bossID);
    }
  }
}

/**
 * Similar to the `getBossID` helper function from `isaacscript-common`, but works with custom boss
 * IDs for the randomizer.
 */
export function getModifiedBossID(): BossID | undefined {
  const room = game.GetRoom();
  const roomType = room.GetType();

  switch (roomType) {
    // 6
    case RoomType.MINI_BOSS: {
      const roomSubType = getRoomSubType();

      switch (roomSubType) {
        case MinibossID.ULTRA_PRIDE: {
          return BossIDCustom.ULTRA_PRIDE;
        }

        case MinibossID.KRAMPUS: {
          return BossIDCustom.KRAMPUS;
        }

        default: {
          return undefined;
        }
      }
    }

    // 14
    case RoomType.DEVIL: {
      if (doesEntityExist(EntityType.FALLEN, FallenVariant.KRAMPUS)) {
        return BossIDCustom.KRAMPUS;
      }

      return undefined;
    }

    // 15
    case RoomType.ANGEL: {
      if (doesEntityExist(EntityType.URIEL)) {
        return BossIDCustom.URIEL;
      }

      if (doesEntityExist(EntityType.GABRIEL)) {
        return BossIDCustom.GABRIEL;
      }

      break;
    }

    // 16
    case RoomType.DUNGEON: {
      if (doesEntityExist(EntityType.BEAST, BeastVariant.ULTRA_FAMINE)) {
        return BossIDCustom.ULTRA_FAMINE;
      }

      if (doesEntityExist(EntityType.BEAST, BeastVariant.ULTRA_PESTILENCE)) {
        return BossIDCustom.ULTRA_PESTILENCE;
      }

      if (doesEntityExist(EntityType.BEAST, BeastVariant.ULTRA_WAR)) {
        return BossIDCustom.ULTRA_WAR;
      }

      if (doesEntityExist(EntityType.BEAST, BeastVariant.ULTRA_DEATH)) {
        return BossIDCustom.ULTRA_DEATH;
      }

      break;
    }

    default: {
      break;
    }
  }

  return getBossID();
}
