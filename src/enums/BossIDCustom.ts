import { BossID } from "isaac-typescript-definitions";
import { getHighestEnumValue, validateCustomEnum } from "isaacscript-common";

const HIGHEST_BOSS_ID = getHighestEnumValue(BossID);

export const BossIDCustom = {
  KRAMPUS: (HIGHEST_BOSS_ID + 1) as BossID,
} as const;

validateCustomEnum("BossIDCustom", BossIDCustom);
