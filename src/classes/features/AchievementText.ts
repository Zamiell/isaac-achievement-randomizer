import { ModCallback } from "isaac-typescript-definitions";
import {
  Callback,
  ModFeature,
  RENDER_FRAMES_PER_SECOND,
  fonts,
  game,
  getBatteryName,
  getBombName,
  getCardName,
  getChallengeName,
  getCharacterName,
  getChestName,
  getCoinName,
  getCollectibleName,
  getHeartName,
  getKeyName,
  getPillEffectName,
  getSackName,
  getScreenBottomRightPos,
  getTrinketName,
} from "isaacscript-common";
import { AchievementType } from "../../enums/AchievementType";
import { UnlockablePath } from "../../enums/UnlockablePath";
import type { Achievement, PillAchievement } from "../../types/Achievement";
import { PillAchievementKind } from "../../types/Achievement";

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
}

export function getAchievementText(achievement: Achievement): [string, string] {
  switch (achievement.type) {
    case AchievementType.CHARACTER: {
      return ["character", getCharacterName(achievement.character)];
    }

    case AchievementType.PATH: {
      return ["area", getPathName(achievement.unlockablePath)];
    }

    case AchievementType.CHALLENGE: {
      return ["challenge", getChallengeName(achievement.challenge)];
    }

    case AchievementType.COLLECTIBLE: {
      return ["collectible", getCollectibleName(achievement.collectibleType)];
    }

    case AchievementType.TRINKET: {
      return ["trinket", getTrinketName(achievement.trinketType)];
    }

    case AchievementType.CARD: {
      return ["card", getCardName(achievement.cardType)];
    }

    case AchievementType.PILL_EFFECT: {
      return ["pill effect", getPillEffectName(achievement.pillEffect)];
    }

    case AchievementType.PILL: {
      return getPillAchievementName(achievement);
    }

    case AchievementType.HEART: {
      return ["heart", getHeartName(achievement.heartSubType)];
    }

    case AchievementType.COIN: {
      return ["coin", getCoinName(achievement.coinSubType)];
    }

    case AchievementType.BOMB: {
      return ["bomb", getBombName(achievement.bombSubType)];
    }

    case AchievementType.KEY: {
      return ["key", getKeyName(achievement.keySubType)];
    }

    case AchievementType.BATTERY: {
      return ["battery", getBatteryName(achievement.batterySubType)];
    }

    case AchievementType.SACK: {
      return ["sack", getSackName(achievement.sackSubType)];
    }

    case AchievementType.CHEST: {
      return ["chest", getChestName(achievement.pickupVariant)];
    }
  }
}

function getPathName(unlockablePath: UnlockablePath): string {
  switch (unlockablePath) {
    case UnlockablePath.THE_CHEST: {
      return "The Chest";
    }

    case UnlockablePath.DARK_ROOM: {
      return "Dark Room";
    }

    case UnlockablePath.MEGA_SATAN: {
      return "Mega Satan";
    }

    case UnlockablePath.BLUE_WOMB: {
      return "Blue Womb";
    }

    case UnlockablePath.THE_VOID: {
      return "The Void";
    }

    case UnlockablePath.REPENTANCE_FLOORS: {
      return "Repentance floors";
    }

    case UnlockablePath.THE_ASCENT: {
      return "The Ascent";
    }
  }
}

function getPillAchievementName(
  achievement: PillAchievement,
): [string, string] {
  switch (achievement.kind) {
    case PillAchievementKind.GOLD: {
      return ["pill type", "gold pills"];
    }

    case PillAchievementKind.HORSE: {
      return ["pill type", "horse pills"];
    }
  }
}
