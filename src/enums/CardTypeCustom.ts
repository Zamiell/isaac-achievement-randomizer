import { validateCustomEnum } from "isaacscript-common";

export const CardTypeCustom = {
  RULES_CUSTOM: Isaac.GetCardIdByName("Rules Card"),
} as const;

validateCustomEnum("CardTypeCustom", CardTypeCustom);
