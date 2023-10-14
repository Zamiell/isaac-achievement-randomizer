import { BossID } from "isaac-typescript-definitions";
import {
  getBossName,
  getHighestEnumValue,
  validateCustomEnum,
} from "isaacscript-common";

const HIGHEST_BOSS_ID = getHighestEnumValue(BossID);

export const BossIDCustom = {
  KRAMPUS: (HIGHEST_BOSS_ID + 1) as BossID, // 81.1 / MinibossID.KRAMPUS (15)
  URIEL: (HIGHEST_BOSS_ID + 2) as BossID, // 271
  GABRIEL: (HIGHEST_BOSS_ID + 3) as BossID, // 272
} as const;

validateCustomEnum("BossIDCustom", BossIDCustom);

export function getBossNameCustom(bossID: BossID): string {
  switch (bossID) {
    case BossIDCustom.KRAMPUS: {
      return "Krampus";
    }

    case BossIDCustom.URIEL: {
      return "Uriel";
    }

    case BossIDCustom.GABRIEL: {
      return "Gabriel";
    }

    default: {
      return getBossName(bossID);
    }
  }
}
