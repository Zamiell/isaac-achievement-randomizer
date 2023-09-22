import {
  ButtonAction,
  EntityFlag,
  InputHook,
  ProjectileFlag,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  game,
  getEntities,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class PreventPause extends RandomizerModFeature {
  @CallbackCustom(
    ModCallbackCustom.INPUT_ACTION_FILTER,
    InputHook.IS_ACTION_TRIGGERED,
    ButtonAction.PAUSE,
  )
  inputActionPause(): boolean | undefined {
    return this.isRoomDangerous() ? false : undefined;
  }

  isRoomDangerous(): boolean {
    const room = game.GetRoom();
    const isClear = room.IsClear();
    if (!isClear) {
      return true;
    }

    const entities = getEntities();

    if (
      entities.some(
        (entity) =>
          entity.IsActiveEnemy(false) &&
          !entity.HasEntityFlags(EntityFlag.FRIENDLY),
      )
    ) {
      return true;
    }

    if (
      entities.some((entity) => {
        const projectile = entity.ToProjectile();
        if (projectile === undefined) {
          return false;
        }

        return !projectile.HasProjectileFlags(ProjectileFlag.CANT_HIT_PLAYER);
      })
    ) {
      return true;
    }

    return false;
  }
}
