import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  K_COLORS,
  capitalizeFirstLetter,
  fonts,
  game,
  inStartingRoom,
  newSprite,
  onFirstFloor,
} from "isaacscript-common";
import { version } from "../../../package.json";
import { ALL_OBJECTIVES } from "../../arrays/objectives";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getPlaythroughNumDeaths,
  getPlaythroughTimeElapsed,
} from "./StatsTracker";
import {
  getNumCompletedObjectives,
  getRandomizerMode,
  getRandomizerSeed,
} from "./achievementTracker/v";
import { hasErrors } from "./checkErrors/v";

const FONT = fonts.teamMeatFont10;

const MOD_ICON_SPRITE = newSprite(
  "gfx/misc/glowing-item.anm2",
  "gfx/misc/shuffle-icon.png",
);

export class StartingRoomInfo extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    const seed = getRandomizerSeed();
    if (seed === undefined) {
      return;
    }

    if (game.IsGreedMode()) {
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

    const randomizerMode = getRandomizerMode();
    const modeText = capitalizeFirstLetter(randomizerMode);
    this.drawCenteredText(`${modeText} seed:`, topLeftPosition);
    this.drawCenteredText(
      seed.toString(),
      topLeftPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    this.drawCenteredText("Objectives:", topRightPosition);
    this.drawCenteredText(
      `${getNumCompletedObjectives()} / ${ALL_OBJECTIVES.length}`,
      topRightPosition.add(Vector(0, 30)),
      K_COLORS.Green,
    );

    const position = Isaac.WorldToScreen(centerTopPosition).add(Vector(0, 10));
    MOD_ICON_SPRITE.Render(position);

    this.drawCenteredText("Mod version:", centerPosition);
    this.drawCenteredText(
      version,
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
