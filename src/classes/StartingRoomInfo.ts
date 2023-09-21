import { ModCallback } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  K_COLORS,
  ModFeature,
  fonts,
  game,
  inStartingRoom,
  onFirstFloor,
} from "isaacscript-common";
import { getRandomizerSeed } from "./AchievementTracker";

const FONT = fonts.teamMeatFont10;

export class StartingRoomInfo extends ModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    const seed = getRandomizerSeed();
    if (seed === undefined) {
      return;
    }

    const hud = game.GetHUD();
    if (!hud.IsVisible()) {
      return;
    }

    // Don't draw on top of Mod Config Menu.
    if (ModConfigMenu !== undefined && ModConfigMenu.IsVisible) {
      return;
    }

    // Don't draw on top of Dead Sea Scrolls.
    if (DeadSeaScrollsMenu !== undefined && DeadSeaScrollsMenu.IsOpen()) {
      return;
    }

    if (!inStartingRoom() || !onFirstFloor()) {
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
      "1 / 300",
      topRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Deaths:", bottomLeftPosition);
    this.drawCenteredText(
      "0",
      bottomLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Total time:", bottomRightPosition);
    this.drawCenteredText(
      "01:01:01",
      bottomRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );
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
