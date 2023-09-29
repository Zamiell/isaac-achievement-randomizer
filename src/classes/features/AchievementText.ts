import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  ModFeature,
  RENDER_FRAMES_PER_SECOND,
  fonts,
  game,
  getScreenBottomRightPos,
  sfxManager,
} from "isaacscript-common";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { SoundEffectCustom } from "../../enums/SoundEffectCustom";
import type { Achievement } from "../../types/Achievement";
import { getAchievementText } from "../../types/Achievement";

const FONT = fonts.droid;
const RENDER_FRAMES_BEFORE_FADE = RENDER_FRAMES_PER_SECOND * 2;

const v = {
  run: {
    text: null as string | null,
    renderFrameSet: null as int | null,
  },
};

/** This does not extend from `RandomizerModFeature` to avoid a dependency cycle. */
export class AchievementText extends ModFeature {
  v = v;

  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.checkDraw();
  }

  checkDraw(): void {
    const hud = game.GetHUD();
    if (!hud.IsVisible()) {
      return;
    }

    // The `HUD.IsVisible` method does not take into account `SeedEffect.NO_HUD`.
    const seeds = game.GetSeeds();
    if (seeds.HasSeedEffect(SeedEffect.NO_HUD)) {
      return;
    }

    if (ModConfigMenu !== undefined && ModConfigMenu.IsVisible) {
      return;
    }

    if (DeadSeaScrollsMenu !== undefined && DeadSeaScrollsMenu.IsOpen()) {
      return;
    }

    if (v.run.renderFrameSet === null) {
      return;
    }

    // The streak text will slowly fade out.
    const fade = this.getFade(v.run.renderFrameSet);
    if (fade <= 0) {
      v.run.renderFrameSet = null;
      return;
    }

    if (v.run.text !== null) {
      this.draw(v.run.text, fade);
    }
  }

  getFade(renderFrame: int): float {
    const renderFrameCount = Isaac.GetFrameCount();
    const elapsedFrames = renderFrameCount - renderFrame;

    if (elapsedFrames <= RENDER_FRAMES_BEFORE_FADE) {
      return 1;
    }

    const fadeFrames = elapsedFrames - RENDER_FRAMES_BEFORE_FADE;
    return 1 - 0.02 * fadeFrames;
  }

  draw(text: string, fade: float): void {
    const bottomRightPos = getScreenBottomRightPos();
    const x = bottomRightPos.X * 0.5;
    let y = bottomRightPos.Y * 0.25;

    const lines = text.split("\n");
    for (const line of lines) {
      const length = FONT.GetStringWidthUTF8(line);
      const color = KColor(1, 1, 1, fade);
      FONT.DrawString(line, x - length / 2, y, color);

      y += 20;
    }
  }
}

export function showNewAchievement(achievement: Achievement): void {
  const achievementText = getAchievementText(achievement);
  v.run.text = `You have unlocked a new ${achievementText[0]}:\n${achievementText[1]}`;
  v.run.renderFrameSet = Isaac.GetFrameCount();

  sfxManager.Play(SoundEffectCustom.GOLDEN_WALNUT);
}

export function getCharacterObjectiveKindName(
  kind: CharacterObjectiveKind,
): string {
  switch (kind) {
    case CharacterObjectiveKind.MOM: {
      return "Mom";
    }

    case CharacterObjectiveKind.IT_LIVES: {
      return "It Lives";
    }

    case CharacterObjectiveKind.ISAAC: {
      return "Isaac";
    }

    case CharacterObjectiveKind.BLUE_BABY: {
      return "Blue Baby";
    }

    case CharacterObjectiveKind.SATAN: {
      return "Satan";
    }

    case CharacterObjectiveKind.THE_LAMB: {
      return "The Lamb";
    }

    case CharacterObjectiveKind.MEGA_SATAN: {
      return "Mega Satan";
    }

    case CharacterObjectiveKind.BOSS_RUSH: {
      return "Boss Rush";
    }

    case CharacterObjectiveKind.HUSH: {
      return "Hush";
    }

    case CharacterObjectiveKind.DELIRIUM: {
      return "Delirium";
    }

    case CharacterObjectiveKind.MOTHER: {
      return "Mother";
    }

    case CharacterObjectiveKind.THE_BEAST: {
      return "The Beast";
    }

    case CharacterObjectiveKind.ULTRA_GREED: {
      return "Ultra Greed";
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_1: {
      return "1";
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_2: {
      return "2";
    }

    case CharacterObjectiveKind.NO_HIT_CAVES_1: {
      return "3";
    }

    case CharacterObjectiveKind.NO_HIT_CAVES_2: {
      return "4";
    }

    case CharacterObjectiveKind.NO_HIT_DEPTHS_1: {
      return "5";
    }

    case CharacterObjectiveKind.NO_HIT_DEPTHS_2: {
      return "6";
    }

    case CharacterObjectiveKind.NO_HIT_WOMB_1: {
      return "7";
    }

    case CharacterObjectiveKind.NO_HIT_WOMB_2: {
      return "8";
    }

    case CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL: {
      return "10";
    }

    case CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST: {
      return "11";
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_1: {
      return "1 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_2: {
      return "2 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MINES_1: {
      return "3 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MINES_2: {
      return "4 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_1: {
      return "5 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_2: {
      return "6 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_CORPSE_1: {
      return "7 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_CORPSE_2: {
      return "8 (alt)";
    }
  }
}
