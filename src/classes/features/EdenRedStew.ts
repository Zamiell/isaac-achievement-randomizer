import { CollectibleType, ModCallback } from "isaac-typescript-definitions";
import { Callback, game, getDoors, isEden } from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { hasErrors } from "./checkErrors/v";

const RED_STEW_EFFECT_GAME_FRAMES_LENGTH = 5390;
const ERROR_TEXT =
  "You must wait for the Red Stew effect to end before you can start your run. (This is a bug fix for Eden naturally starting with Red Stew. Unfortunately, there is no way to remove the damage bonus with the Lua API.)";

const STARTING_X = 115;
const STARTING_Y = 70;
const MAX_CHARACTERS_PER_LINE = 50;

export class EdenRedStew extends RandomizerModFeature {
  @Callback(ModCallback.POST_RENDER)
  postUpdate(): void {
    if (this.shouldCloseDoorsBecauseOfRedStew()) {
      this.closeDoors();
      this.drawErrorText(ERROR_TEXT);
    }
  }

  shouldCloseDoorsBecauseOfRedStew(): boolean {
    const gameFrameCount = game.GetFrameCount();
    const player = Isaac.GetPlayer();
    const collectibleType = mod.getEdenStartingPassiveCollectible(player);

    return (
      !hasErrors() &&
      isEden(player) &&
      gameFrameCount <= RED_STEW_EFFECT_GAME_FRAMES_LENGTH &&
      collectibleType === CollectibleType.RED_STEW
    );
  }

  closeDoors(): void {
    const doors = getDoors();
    for (const door of doors) {
      door.Close(true);
    }
  }

  drawErrorText(text: string): void {
    const x = STARTING_X;
    let y = STARTING_Y;

    text = `Error: ${text}`;

    for (const line of text.split("\n")) {
      const splitLines = this.getSplitLines(line);
      for (const splitLine of splitLines) {
        Isaac.RenderText(splitLine, x, y, 2, 2, 2, 2);
        y += 10;
      }
    }
  }

  getSplitLines(line: string): string[] {
    let spaceLeft = MAX_CHARACTERS_PER_LINE;
    const words = line.split(" ");
    for (const [i, word] of words.entries()) {
      if (word.length + 1 > spaceLeft) {
        words[i] = `\n${word}`;
        spaceLeft = MAX_CHARACTERS_PER_LINE - word.length;
      } else {
        spaceLeft -= word.length + 1;
      }
    }

    return words.join(" ").split("\n");
  }
}
