import { ModCallback } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  K_COLORS,
  fonts,
  game,
  inStartingRoom,
  isGreedMode,
  onFirstFloor,
} from "isaacscript-common";
import { convertSecondsToTimerValues } from "../../timer";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  NUM_TOTAL_ACHIEVEMENTS,
  getNumAchievements,
  getNumDeaths,
  getRandomizerSeed,
  getSecondsElapsed,
} from "./AchievementTracker";
import { hasErrors } from "./CheckErrors";

const FONT = fonts.teamMeatFont10;

export class StartingRoomInfo extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    const seed = getRandomizerSeed();
    if (seed === undefined) {
      return;
    }

    if (isGreedMode()) {
      return;
    }

    const isPaused = game.IsPaused();
    if (isPaused) {
      return;
    }

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

    if (!inStartingRoom() || !onFirstFloor()) {
      return;
    }

    if (hasErrors()) {
      return;
    }

    const room = game.GetRoom();
    const topLeftPosition = room.GetGridPosition(18);
    const topRightPosition = room.GetGridPosition(26);
    const bottomLeftPosition = room.GetGridPosition(78);
    const bottomRightPosition = room.GetGridPosition(86);

    this.drawCenteredText("Randomizer seed:", topLeftPosition);
    this.drawCenteredText(
      seed.toString(),
      topLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Achievements:", topRightPosition);
    this.drawCenteredText(
      `${getNumAchievements()} / ${NUM_TOTAL_ACHIEVEMENTS}`,
      topRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Deaths:", bottomLeftPosition);
    this.drawCenteredText(
      getNumDeaths().toString(),
      bottomLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Total time:", bottomRightPosition);
    const seconds = getSecondsElapsed();
    this.drawCenteredText(
      this.gameFramesToTimeString(seconds),
      bottomRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );
  }

  gameFramesToTimeString(seconds: int): string {
    const { hours, minute1, minute2, second1, second2 } =
      convertSecondsToTimerValues(seconds);
    const paddedHours = hours < 10 ? `0${hours}` : hours.toString();

    return `${paddedHours}:${minute1}${minute2}:${second1}${second2}`;
  }

  drawCenteredText(
    text: string,
    position: Vector,
    kColor = KColorDefault,
  ): void {
    const { X, Y } = Isaac.WorldToRenderPosition(position);
    const length = FONT.GetStringWidthUTF8(text);
    FONT.DrawString(text, X - length / 2, Y, kColor);
  }
}
