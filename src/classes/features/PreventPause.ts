import { ButtonAction, InputHook } from "isaac-typescript-definitions";
import { CallbackCustom, ModCallbackCustom, game } from "isaacscript-common";
import { isPreventPauseEnabled } from "../../config";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isRandomizerEnabled } from "./achievementTracker/v";

export class PreventPause extends RandomizerModFeature {
  override shouldCallbackMethodsFire = (): boolean =>
    isRandomizerEnabled() && isPreventPauseEnabled();

  @CallbackCustom(
    ModCallbackCustom.INPUT_ACTION_FILTER,
    InputHook.IS_ACTION_TRIGGERED,
    ButtonAction.PAUSE, // 12
  )
  inputActionPause(): boolean | undefined {
    return isRoomClear() ? false : undefined;
  }

  @CallbackCustom(
    ModCallbackCustom.INPUT_ACTION_FILTER,
    InputHook.IS_ACTION_TRIGGERED,
    ButtonAction.CONSOLE, // 28
  )
  inputActionConsole(): boolean | undefined {
    return isRoomClear() ? false : undefined;
  }
}

export function isRoomClear(): boolean {
  const room = game.GetRoom();
  return room.IsClear();
}
