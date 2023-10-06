import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  RENDER_FRAMES_PER_SECOND,
  fonts,
  game,
  getScreenBottomRightPos,
  sfxManager,
} from "isaacscript-common";
import { SoundEffectCustom } from "../../enums/SoundEffectCustom";
import type { Achievement } from "../../types/Achievement";
import { getAchievementText } from "../../types/Achievement";
import { RandomizerModFeature } from "../RandomizerModFeature";

const FONT = fonts.droid;
const RENDER_FRAMES_BEFORE_FADE = RENDER_FRAMES_PER_SECOND * 2;

const v = {
  run: {
    text: null as string | null,
    renderFrameSet: null as int | null,
    queuedTexts: [] as string[],
  },
};

export class AchievementNotification extends RandomizerModFeature {
  v = v;

  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    this.checkDequeueText();
    this.checkDraw();
  }

  checkDequeueText(): void {
    if (v.run.text !== null) {
      return;
    }

    const text = v.run.queuedTexts.shift();
    if (text === undefined) {
      return;
    }

    v.run.text = text;
    v.run.renderFrameSet = Isaac.GetFrameCount();
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

    if (v.run.text === null || v.run.renderFrameSet === null) {
      return;
    }

    // The streak text will slowly fade out.
    const fade = this.getFade(v.run.renderFrameSet);
    if (fade > 0) {
      this.draw(v.run.text, fade);
    } else {
      v.run.text = null;
      v.run.renderFrameSet = null;
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
    const screenBottomRightPos = getScreenBottomRightPos();
    let y = screenBottomRightPos.Y * 0.25;

    const lines = text.split("\n");
    for (const line of lines) {
      const color = KColor(1, 1, 1, fade);
      FONT.DrawString(line, 0, y, color, screenBottomRightPos.X, true);

      y += 20;
    }
  }
}

export function showNewAchievement(achievement: Achievement): void {
  const achievementText = getAchievementText(achievement);
  v.run.queuedTexts.push(
    `You have unlocked a new ${achievementText[0]}:\n${achievementText[1]}`,
  );

  sfxManager.Play(SoundEffectCustom.GOLDEN_WALNUT);
}
