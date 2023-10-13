import { BossID } from "isaac-typescript-definitions";
import { getHighestEnumValue, validateCustomEnum } from "isaacscript-common";

export const BossIDCustom = {
  KRAMPUS: (getHighestEnumValue(BossID) + 1) as BossID,
} as const;

validateCustomEnum("BossIDCustom", BossIDCustom);
