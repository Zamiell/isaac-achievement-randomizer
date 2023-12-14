import {
  Difficulty,
  ModCallback,
  PlayerType,
  SeedEffect,
} from "isaac-typescript-definitions";
import {
  Callback,
  VectorZero,
  anyPlayerIs,
  game,
  getHUDOffsetVector,
  getMainCharacter,
  newSprite,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getCharacterObjectiveKindNoHit,
  hasTakenHitOnChapter,
} from "./ChapterObjectiveDetection";
import { isCharacterObjectiveCompleted } from "./achievementTracker/completedObjectives";

const TOP_LEFT_UI_POSITION = Vector(42, 77); // To the right of the coin count.
const TAINTED_CHARACTER_UI_OFFSET = Vector(4, 24);

const iconSprite = newSprite("gfx/crownoflight.anm2");

export class ChapterHitIcon extends RandomizerModFeature {
  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    const player = Isaac.GetPlayer();
    const character = player.GetPlayerType();
    const mainCharacter = getMainCharacter(character);

    const kindNoHit = getCharacterObjectiveKindNoHit();
    if (kindNoHit === undefined) {
      return;
    }

    if (
      game.Difficulty !== Difficulty.NORMAL &&
      game.Difficulty !== Difficulty.HARD
    ) {
      return;
    }

    if (
      isCharacterObjectiveCompleted(mainCharacter, kindNoHit, game.Difficulty)
    ) {
      return;
    }

    const animationName = hasTakenHitOnChapter() ? "FloatNoGlow" : "FloatGlow";
    iconSprite.Play(animationName, true);

    this.drawIconSprite();
  }

  drawIconSprite(): void {
    const hud = game.GetHUD();
    if (!hud.IsVisible()) {
      return;
    }

    // The `HUD.IsVisible` method does not take into account `SeedEffect.NO_HUD`.
    const seeds = game.GetSeeds();
    if (seeds.HasSeedEffect(SeedEffect.NO_HUD)) {
      return;
    }

    const position = this.getTopLeftUIPosition();
    iconSprite.Render(position);
  }

  getTopLeftUIPosition(): Vector {
    const hudOffsetVector = getHUDOffsetVector();

    const hasTaintedCharacterUI = anyPlayerIs(
      PlayerType.ISAAC_B, // 21
      PlayerType.BLUE_BABY_B, // 25
    );
    const taintedCharacterUIOffset = hasTaintedCharacterUI
      ? TAINTED_CHARACTER_UI_OFFSET
      : VectorZero;

    return TOP_LEFT_UI_POSITION.add(hudOffsetVector).add(
      taintedCharacterUIOffset,
    );
  }
}
