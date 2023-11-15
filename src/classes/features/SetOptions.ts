import {
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
} from "isaacscript-common";

/**
 * - Forces the "faded console display" feature to be turned on, so that end-users can report bugs
 *   easier.
 * - Forces the "pause on focus lost" feature to be turned off, so that players cannot illegally
 *   pause.
 *
 * This does not extend from `RandomizerModFeature` because we want it to always apply.
 */
export class SetOptions extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, undefined)
  postGameStartedReordered(): void {
    Options.FadedConsoleDisplay = true;
    Options.PauseOnFocusLost = false;
  }
}
