import { BossID, ModCallback } from "isaac-typescript-definitions";
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
  getSlotName,
  getTrinketName,
  sfxManager,
} from "isaacscript-common";
import { NUM_MINUTES_FOR_BOSS_OBJECTIVE } from "../../constants";
import { AchievementType } from "../../enums/AchievementType";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { SoundEffectCustom } from "../../enums/SoundEffectCustom";
import { UnlockablePath } from "../../enums/UnlockablePath";
import type { Achievement } from "../../types/Achievement";
import type { Objective } from "../../types/Objective";

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

  sfxManager.Play(SoundEffectCustom.GOLDEN_WALNUT);
}

export function getObjectiveText(objective: Objective): string[] {
  switch (objective.type) {
    case ObjectiveType.CHARACTER: {
      const characterName = getCharacterName(objective.character);
      const characterObjectiveKindName = getCharacterObjectiveKindName(
        objective.kind,
      );

      return objective.kind < CharacterObjectiveKind.NO_DAMAGE_BASEMENT_1
        ? ["Defeated", characterObjectiveKindName, "on", characterName]
        : [
            "No damage on",
            `floor ${characterObjectiveKindName}`,
            "on",
            characterName,
          ];
    }

    case ObjectiveType.BOSS: {
      return [
        `Survive ${NUM_MINUTES_FOR_BOSS_OBJECTIVE}`,
        "minutes without",
        "getting hit",
        "on",
        BossID[objective.bossID],
      ];
    }

    case ObjectiveType.CHALLENGE: {
      const challengeName = getChallengeName(objective.challenge);
      return ["Completed challenge:", challengeName];
    }
  }
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

    case AchievementType.SLOT: {
      return ["slot", getSlotName(achievement.slotVariant)];
    }

    case AchievementType.OTHER: {
      return getOtherAchievementName(achievement.kind);
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

    case UnlockablePath.BOSS_RUSH: {
      return "Boss Rush";
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

    case UnlockablePath.GREED_MODE: {
      return "Greed Mode";
    }
  }
}

function getOtherAchievementName(
  otherAchievementKind: OtherAchievementKind,
): [string, string] {
  switch (otherAchievementKind) {
    case OtherAchievementKind.SHOPKEEPERS: {
      return ["entity", "shopkeepers"];
    }

    case OtherAchievementKind.BEDS: {
      return ["pickup", "beds"];
    }

    case OtherAchievementKind.BLUE_FIREPLACES: {
      return ["entity", "blue fireplaces"];
    }

    case OtherAchievementKind.GOLD_TRINKETS: {
      return ["trinket type", "gold trinkets"];
    }

    case OtherAchievementKind.GOLD_PILLS: {
      return ["pill type", "gold pills"];
    }

    case OtherAchievementKind.HORSE_PILLS: {
      return ["pill type", "horse pills"];
    }

    case OtherAchievementKind.TINTED_ROCKS: {
      return ["rock type", "tinted rocks"];
    }

    case OtherAchievementKind.SUPER_TINTED_ROCKS: {
      return ["rock type", "super tinted rocks"];
    }

    case OtherAchievementKind.FOOLS_GOLD: {
      return ["rock type", "fool's gold"];
    }
  }
}

export function getCharacterObjectiveKindName(
  characterObjectiveKind: CharacterObjectiveKind,
): string {
  switch (characterObjectiveKind) {
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

    case CharacterObjectiveKind.NO_DAMAGE_BASEMENT_1: {
      return "1";
    }

    case CharacterObjectiveKind.NO_DAMAGE_BASEMENT_2: {
      return "2";
    }

    case CharacterObjectiveKind.NO_DAMAGE_CAVES_1: {
      return "3";
    }

    case CharacterObjectiveKind.NO_DAMAGE_CAVES_2: {
      return "4";
    }

    case CharacterObjectiveKind.NO_DAMAGE_DEPTHS_1: {
      return "5";
    }

    case CharacterObjectiveKind.NO_DAMAGE_DEPTHS_2: {
      return "6";
    }

    case CharacterObjectiveKind.NO_DAMAGE_WOMB_1: {
      return "7";
    }

    case CharacterObjectiveKind.NO_DAMAGE_WOMB_2: {
      return "8";
    }

    case CharacterObjectiveKind.NO_DAMAGE_SHEOL_CATHEDRAL: {
      return "10";
    }

    case CharacterObjectiveKind.NO_DAMAGE_DARK_ROOM_CHEST: {
      return "11";
    }

    case CharacterObjectiveKind.NO_DAMAGE_DOWNPOUR_1: {
      return "1 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_DOWNPOUR_2: {
      return "2 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_MINES_1: {
      return "3 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_MINES_2: {
      return "4 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_MAUSOLEUM_1: {
      return "5 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_MAUSOLEUM_2: {
      return "6 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_CORPSE_1: {
      return "7 (alt)";
    }

    case CharacterObjectiveKind.NO_DAMAGE_CORPSE_2: {
      return "8 (alt)";
    }
  }
}
