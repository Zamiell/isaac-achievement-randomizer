import { CallbackCustom, ModCallbackCustom, restart } from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class PreventSaveAndQuit extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, true)
  postGameStartedReorderedTrue(): void {
    mod.runNextRenderFrame(() => {
      restart();
    });
  }
}
