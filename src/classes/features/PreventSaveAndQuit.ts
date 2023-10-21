import { CallbackCustom, ModCallbackCustom } from "isaacscript-common";
import { isPreventSaveAndQuitEnabled } from "../../config";
import { preventSaveAndQuit } from "../../utils";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class PreventSaveAndQuit extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    if (isPreventSaveAndQuitEnabled()) {
      preventSaveAndQuit();
    }
  }
}
