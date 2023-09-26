import { validateCustomEnum } from "isaacscript-common";

export const SoundEffectCustom = {
  GOLDEN_WALNUT: Isaac.GetSoundIdByName("Golden Walnut"),
} as const;

validateCustomEnum("SoundEffectCustom", SoundEffectCustom);
