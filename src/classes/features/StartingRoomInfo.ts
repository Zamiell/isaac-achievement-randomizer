import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  K_COLORS,
  fonts,
  game,
  inStartingRoom,
  isGreedMode,
  newSprite,
  onFirstFloor,
} from "isaacscript-common";
import { VERSION } from "../../constants";
import { ALL_UNLOCKS } from "../../unlocks";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { getNumCompletedUnlocks } from "./AchievementTracker";
import {
  getPlaythroughNumDeaths,
  getPlaythroughTimeElapsed,
} from "./StatsTracker";
import { getRandomizerSeed } from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

const FONT = fonts.teamMeatFont10;

const MOD_ICON_SPRITE = newSprite(
  "gfx/glowing_item.anm2",
  "gfx/misc/shuffle_icon.png",
);

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

    if (!inStartingRoom() || !onFirstFloor()) {
      return;
    }

    if (hasErrors()) {
      return;
    }

    const room = game.GetRoom();
    const topLeftPosition = room.GetGridPosition(18);
    const topRightPosition = room.GetGridPosition(26);
    const centerTopPosition = room.GetGridPosition(37);
    const centerPosition = room.GetGridPosition(52);
    const bottomLeftPosition = room.GetGridPosition(78);
    const bottomRightPosition = room.GetGridPosition(86);

    this.drawCenteredText("Randomizer seed:", topLeftPosition);
    this.drawCenteredText(
      seed.toString(),
      topLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Unlocks:", topRightPosition);
    this.drawCenteredText(
      `${getNumCompletedUnlocks()} / ${ALL_UNLOCKS.length}`,
      topRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    const position = Isaac.WorldToScreen(centerTopPosition).add(Vector(0, 10));
    MOD_ICON_SPRITE.Render(position);

    this.drawCenteredText("Mod version:", centerPosition);
    this.drawCenteredText(
      VERSION,
      centerPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Deaths/resets:", bottomLeftPosition);
    this.drawCenteredText(
      getPlaythroughNumDeaths().toString(),
      bottomLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Total time:", bottomRightPosition);
    this.drawCenteredText(
      getPlaythroughTimeElapsed(),
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
