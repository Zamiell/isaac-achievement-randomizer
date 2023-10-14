import { BossID, MinibossID } from "isaac-typescript-definitions";
import { getHighestEnumValue, validateCustomEnum } from "isaacscript-common";

const HIGHEST_BOSS_ID = getHighestEnumValue(BossID);

export const BossIDCustom = {
  KRAMPUS: (HIGHEST_BOSS_ID + MinibossID.KRAMPUS) as BossID,
} as const;

validateCustomEnum("BossIDCustom", BossIDCustom);
