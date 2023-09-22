import type { DamageFlag } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  isFirstPlayer,
  isSelfDamage,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";

const v = {
  level: {
    tookDamage: false,
  },
};

export class NoDamageDetection extends RandomizerModFeature {
  v = v;

  @CallbackCustom(ModCallbackCustom.ENTITY_TAKE_DMG_PLAYER)
  entityTakeDmgPlayer(
    player: EntityPlayer,
    _amount: float,
    damageFlags: BitFlags<DamageFlag>,
  ): boolean | undefined {
    if (!isFirstPlayer(player)) {
      return undefined;
    }

    if (isSelfDamage(damageFlags)) {
      return undefined;
    }

    v.level.tookDamage = true;
    return undefined;
  }
}
