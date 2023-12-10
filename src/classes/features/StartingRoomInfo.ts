import { ModCallback, SeedEffect } from "isaac-typescript-definitions";
import {
  Callback,
  KColorDefault,
  K_COLORS,
  capitalizeFirstLetter,
  fonts,
  game,
  getDoors,
  inStartingRoom,
  newReadonlyVector,
  newSprite,
  onFirstFloor,
} from "isaacscript-common";
import { version } from "../../../package.json";
import { ALL_OBJECTIVES } from "../../arrays/allObjectives";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  getPlaythroughNumCompletedRuns,
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

const VERTICAL_TEXT_SPACING = newReadonlyVector(0, 30);

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

    const doors = getDoors();
    const door = doors[0];
    if (door !== undefined && !door.IsOpen()) {
      return;
    }

    const room = game.GetRoom();
    const topLeftPosition = room.GetGridPosition(18);
    const topRightPosition = room.GetGridPosition(26);
    const leftPosition = room.GetGridPosition(48);
    const rightPosition = room.GetGridPosition(56);
    const bottomLeftPosition = room.GetGridPosition(78);
    const bottomRightPosition = room.GetGridPosition(86);
    const centerTopPosition = room.GetGridPosition(22);

    const randomizerMode = getRandomizerMode();
    const modeText = capitalizeFirstLetter(randomizerMode);

    // Top left
    this.drawCenteredText("Run number:", topLeftPosition);
    this.drawCenteredText(
      `${getPlaythroughNumCompletedRuns() + 1}`,
      topLeftPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Top right
    this.drawCenteredText("Deaths/resets:", topRightPosition);
    this.drawCenteredText(
      getPlaythroughNumDeaths().toString(),
      topRightPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Left
    this.drawCenteredText("Run seed:", leftPosition);
    this.drawCenteredText(
      seeds.GetStartSeedString(),
      leftPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Right
    this.drawCenteredText("Playthrough seed:", rightPosition);
    this.drawCenteredText(
      seed.toString(),
      rightPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Bottom-left
    this.drawCenteredText("Objectives:", bottomLeftPosition);
    this.drawCenteredText(
      `${getNumCompletedObjectives()} / ${ALL_OBJECTIVES.length}`,
      bottomLeftPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Bottom-right
    this.drawCenteredText("Total time:", bottomRightPosition);
    this.drawCenteredText(
      getPlaythroughTimeElapsed(),
      bottomRightPosition.add(VERTICAL_TEXT_SPACING),
      K_COLORS.Green,
    );

    // Center-top
    const spritePosition = Isaac.WorldToScreen(centerTopPosition).add(
      Vector(0, 8),
    );
    MOD_ICON_SPRITE.Render(spritePosition);

    const modePosition = centerTopPosition.add(Vector(0, 40));
    this.drawCenteredText(modeText, modePosition, K_COLORS.Green);
    this.drawCenteredText(
      `v${version}`,
      modePosition.add(VERTICAL_TEXT_SPACING),
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
