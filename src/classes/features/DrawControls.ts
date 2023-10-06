import { EffectVariant, StageType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ColorDefault,
  ModCallbackCustom,
  ModFeature,
  game,
  inStartingRoom,
  newSprite,
  onFirstFloor,
  onStageType,
  spawnEffect,
} from "isaacscript-common";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { CreepRedSubTypeCustom } from "../../enums/CreepRedSubTypeCustom";
import { isRandomizerEnabled } from "./achievementTracker/v";

const BURNING_BASEMENT_COLOR = Color(0.5, 0.5, 0.5);

const TEST_SPRITE = newSprite("gfx/backdrop/controls_custom.anm2");
TEST_SPRITE.SetFrame(2);

/**
 * We reimplement the controls graphic in the starting room so that it will not interfere with the
 * starting room text.
 *
 * This is copied from Racing+.
 *
 * This does not extend from `RandomizerModFeature` because we want to draw the controls when the
 * randomizer is turned off.
 */
export class DrawControls extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    if (this.shouldDrawControlsGraphic()) {
      this.drawControlsGraphic();
    }
  }

  /**
   * Only draw the graphic in the starting room of the first floor. We ignore Greed Mode to simplify
   * things, even though on vanilla, the sprite will display in Greed Mode.
   */
  shouldDrawControlsGraphic(): boolean {
    const isGreedMode = game.IsGreedMode();
    const challenge = Isaac.GetChallenge();

    return (
      !isGreedMode &&
      onFirstFloor() &&
      inStartingRoom() &&
      !isRandomizerEnabled() &&
      challenge !== ChallengeCustom.RANDOMIZER_CHILL_ROOM
    );
  }

  drawControlsGraphic(): void {
    const room = game.GetRoom();
    const centerPos = room.GetCenterPos();

    // Spawn the custom "Floor Effect Creep" entity.
    const controlsEffect = spawnEffect(
      EffectVariant.PLAYER_CREEP_RED,
      CreepRedSubTypeCustom.FLOOR_EFFECT_CREEP,
      centerPos,
    );

    controlsEffect.CollisionDamage = 0;
    controlsEffect.Timeout = 1_000_000;

    // Always set the scale to 1 in case the player has an item like Lost Cork. (Otherwise, it will
    // have a scale of 1.75.)
    controlsEffect.Scale = 1;

    const controlsSprite = controlsEffect.GetSprite();
    controlsSprite.Load("gfx/backdrop/controls_custom.anm2", true);
    const defaultAnimation = controlsSprite.GetDefaultAnimation();
    controlsSprite.Play(defaultAnimation, true);

    const player = Isaac.GetPlayer();
    const character = player.GetPlayerType();

    // Setting the frame here does not work properly for some reason; only the first frame will
    // display. (It does work properly if we create a sprite and just render it without being
    // attached to an entity.) We ignore this, since most of the time people will be playing this
    // mod with the randomizer enabled.
    controlsSprite.SetFrame(character);

    // On vanilla, the sprite is a slightly different color on the Burning Basement.
    controlsSprite.Color = onStageType(StageType.AFTERBIRTH)
      ? BURNING_BASEMENT_COLOR
      : ColorDefault;
  }
}
