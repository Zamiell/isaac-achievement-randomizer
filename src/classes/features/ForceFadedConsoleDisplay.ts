import {
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
} from "isaacscript-common";

/**
 * Force the "faded console display" feature to be turned on, so that end-users can report bugs
 * easier.
 *
 * This does not extend from `RandomizerModFeature` because we want it to always apply.
 */
export class ForceFadedConsoleDisplay extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    Options.FadedConsoleDisplay = true;
  }
}
