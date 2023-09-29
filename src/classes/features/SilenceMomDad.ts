import { SoundEffect } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
  sfxManager,
} from "isaacscript-common";

const MOM_AND_DAD_SOUND_EFFECTS = [
  SoundEffect.MOM_AND_DAD_1, // 598
  SoundEffect.MOM_AND_DAD_2, // 599
  SoundEffect.MOM_AND_DAD_3, // 600
  SoundEffect.MOM_AND_DAD_4, // 601
] as const;

/** This does not extend from `RandomizerModFeature` because we want it to always apply. */
export class SilenceMomDad extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_LEVEL_REORDERED)
  postNewLevelReordered(): void {
    for (const soundEffect of MOM_AND_DAD_SOUND_EFFECTS) {
      sfxManager.Stop(soundEffect);
    }
  }
}
