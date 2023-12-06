import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  GAME_FRAMES_PER_SECOND,
  fonts,
  game,
  getScreenBottomRightPos,
  sfxManager,
  uncapitalizeFirstLetter,
} from "isaacscript-common";
import { isDelayAchievementTextEnabled } from "../../config";
import { SoundEffectCustom } from "../../enums/SoundEffectCustom";
import type { Achievement } from "../../types/Achievement";
import { getObjectiveFromID, getObjectiveText } from "../../types/Objective";
import type { Unlock } from "../../types/Unlock";
import { getUnlockFromID, getUnlockText } from "../../types/Unlock";
import { RandomizerModFeature } from "../RandomizerModFeature";

const FONT = fonts.droid;
const GAME_FRAMES_BEFORE_FADE = GAME_FRAMES_PER_SECOND * 2;

const v = {
  run: {
    text: null as string | null,
    gameFrameSet: null as int | null,
    queuedTexts: [] as string[],
  },
};

export class AchievementNotification extends RandomizerModFeature {
  v = v;

  // 1
  @Callback(ModCallback.POST_UPDATE)
  postUpdate(): void {
    this.checkDequeueText();
  }

  checkDequeueText(): void {
    if (v.run.text !== null) {
      return;
    }

    const room = game.GetRoom();
    const isClear = room.IsClear();
    if (!isClear && isDelayAchievementTextEnabled()) {
      return;
    }

    const text = v.run.queuedTexts.shift();
    if (text === undefined) {
      return;
    }

    v.run.text = text;
    v.run.gameFrameSet = game.GetFrameCount();
  }

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

    if (v.run.text === null || v.run.gameFrameSet === null) {
      return;
    }

    // The text will slowly fade out.
    const fade = this.getFade(v.run.gameFrameSet);
    if (fade > 0) {
      this.draw(v.run.text, fade);
    } else {
      v.run.text = null;
      v.run.gameFrameSet = null;
    }
  }

  getFade(gameFrame: int): float {
    const gameFrameCount = game.GetFrameCount();
    const elapsedFrames = gameFrameCount - gameFrame;

    if (elapsedFrames <= GAME_FRAMES_BEFORE_FADE) {
      return 1;
    }

    const fadeFrames = elapsedFrames - GAME_FRAMES_BEFORE_FADE;
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

export function showNewUnlock(unlock: Unlock): void {
  const unlockText = getUnlockText(unlock);
  v.run.queuedTexts.push(
    `You have unlocked a new ${unlockText[0]}:\n${unlockText[1]}`,
  );
  sfxManager.Play(SoundEffectCustom.GOLDEN_WALNUT);
}

export function showNewAchievement(achievement: Achievement): void {
  const { objectiveID, unlockID } = achievement;
  const objective = getObjectiveFromID(objectiveID);
  const objectiveText = getObjectiveText(objective).join(" ");
  const unlock = getUnlockFromID(unlockID);
  const unlockText = getUnlockText(unlock);

  const lines = [
    "It is said that if you",
    `${uncapitalizeFirstLetter(objectiveText)},`,
    `you will unlock a new ${unlockText[0]}:`,
    `${unlockText[1]}`,
  ];
  const text = lines.join("\n");
  v.run.queuedTexts.push(text);
}
