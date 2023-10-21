import {
  Difficulty,
  ModCallback,
  SeedEffect,
} from "isaac-typescript-definitions";
import { CallbackPriority } from "isaac-typescript-definitions/dist/src/enums/CallbackPriority";
import {
  ModFeature,
  PriorityCallback,
  game,
  getHUDOffsetVector,
  isBethany,
  isJacobOrEsau,
  newSprite,
  onAnyChallenge,
  onSetSeed,
} from "isaacscript-common";
import { RandomizerMode } from "../../enums/RandomizerMode";
import { getRandomizerMode, isRandomizerEnabled } from "./achievementTracker/v";

enum IconSpriteLayer {
  NO_ACHIEVEMENTS_ICON = 0,
  RANDOMIZER_ICON_CASUAL = 1,
  RANDOMIZER_ICON_HARDCORE = 2,
  RANDOMIZER_ICON_NIGHTMARE = 3,
}

/** This is on top of where the "No Achievements" icon would be. */
const SPRITE_POSITION = Vector(4, 72);

const SPRITE_CHALLENGE_OFFSET = Vector(-3, 0);
const SPRITE_DIFFICULTY_OFFSET = Vector(13, 0);
const SPRITE_BETHANY_OFFSET = Vector(0, 10);
const SPRITE_JACOB_ESAU_OFFSET = Vector(0, 15);

const ICON_SPRITE = newSprite(
  "gfx/ui/no-achievements-icon/no-achievements-icon.anm2",
);

/**
 * In the "gfx/ui/hudpickups.png" file, we blank out the "No Achievements" icon. For every run, we
 * draw an icon on top of where the "No Achievements" icon would normally be.
 *
 * This does not extend from `RandomizerModFeature` because we want it to always apply.
 */
export class UIIcon extends ModFeature {
  /**
   * We specify a late callback priority since we want the icon to be drawn on top of everything
   * else.
   */
  // 2
  @PriorityCallback(ModCallback.POST_RENDER, CallbackPriority.LATE)
  postRenderLate(): void {
    const hud = game.GetHUD();
    if (!hud.IsVisible()) {
      return;
    }

    // The `HUD.IsVisible` method does not take into account `SeedEffect.NO_HUD`.
    const seeds = game.GetSeeds();
    if (seeds.HasSeedEffect(SeedEffect.NO_HUD)) {
      return;
    }

    const layerID = getIconSpriteLayer();
    if (layerID === undefined) {
      return;
    }

    const position = getIconPosition();
    ICON_SPRITE.RenderLayer(layerID, position);
  }
}

function getIconSpriteLayer(): IconSpriteLayer | undefined {
  if (isRandomizerEnabled()) {
    const randomizerMode = getRandomizerMode();
    switch (randomizerMode) {
      case RandomizerMode.CASUAL: {
        return IconSpriteLayer.RANDOMIZER_ICON_CASUAL;
      }

      case RandomizerMode.HARDCORE: {
        return IconSpriteLayer.RANDOMIZER_ICON_HARDCORE;
      }

      case RandomizerMode.NIGHTMARE: {
        return IconSpriteLayer.RANDOMIZER_ICON_NIGHTMARE;
      }
    }
  }

  if (onSetSeed() || onAnyChallenge()) {
    return IconSpriteLayer.NO_ACHIEVEMENTS_ICON;
  }

  return undefined;
}

function getIconPosition(): Vector {
  const HUDOffsetVector = getHUDOffsetVector();
  const player = Isaac.GetPlayer();

  let position = SPRITE_POSITION.add(HUDOffsetVector);

  // On vanilla, being in a challenge shifts the "No Achievements" icon to the left.
  if (onAnyChallenge()) {
    position = position.add(SPRITE_CHALLENGE_OFFSET);
  }

  // On vanilla, being in Hard Mode shifts the "No Achievements" icon to the right. Being in greed
  // mode shifts the "No Achievements" icon to the left.
  if (game.Difficulty === Difficulty.HARD) {
    position = position.add(SPRITE_DIFFICULTY_OFFSET);
  } else if (game.IsGreedMode()) {
    position = position.add(SPRITE_CHALLENGE_OFFSET);
  }

  // Certain characters have extra HUD elements, shifting the "No Achievements" icon down.
  if (isBethany(player)) {
    position = position.add(SPRITE_BETHANY_OFFSET);
  } else if (isJacobOrEsau(player)) {
    position = position.add(SPRITE_JACOB_ESAU_OFFSET);
  }

  return position;
}
