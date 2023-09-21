import { ModFeature } from "isaacscript-common";
import { isRandomizerEnabled } from "./features/AchievementTracker";

/**
 * The base class that most of the feature classes in this mod extends from.
 *
 * This sets up the callback class methods to only be fired if the randomizer is active.
 */
export abstract class RandomizerModFeature extends ModFeature {
  override shouldCallbackMethodsFire = isRandomizerEnabled;
}
