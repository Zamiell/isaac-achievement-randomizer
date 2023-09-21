import {
  CallbackPriority,
  CollectibleType,
  ItemPoolType,
  ModCallback,
} from "isaac-typescript-definitions";
import {
  Callback,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  ModCallbackCustom,
  ModFeature,
  PriorityCallbackCustom,
  getCollectibleName,
  isRepentance,
  log,
} from "isaacscript-common";
import { MOD_NAME } from "../../constants";
import { mod } from "../../mod";

const INCOMPLETE_SAVE_COLLECTIBLE_TO_CHECK = CollectibleType.DEATH_CERTIFICATE;
const INCOMPLETE_SAVE_ITEM_POOL_TO_CHECK = ItemPoolType.SECRET;

const STARTING_X = 115;
const STARTING_Y = 70;
const MAX_CHARACTERS_PER_LINE = 50;

const v = {
  run: {
    afterbirthPlus: false,
    incompleteSave: false,
    otherModsEnabled: false,
  },
};

/** This does not extend from `RandomizerModFeature` because we need to always do the checks. */
export class CheckErrors extends ModFeature {
  v = v;

  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    // Don't draw on top of Mod Config Menu.
    if (ModConfigMenu !== undefined && ModConfigMenu.IsVisible) {
      return;
    }

    // Don't draw on top of Dead Sea Scrolls.
    if (DeadSeaScrollsMenu !== undefined && DeadSeaScrollsMenu.IsOpen()) {
      return;
    }

    if (v.run.afterbirthPlus) {
      this.drawErrorText(
        `You must have the Repentance DLC installed in order to use ${MOD_NAME}.`,
      );
    } else if (v.run.incompleteSave) {
      this.drawErrorText(
        `You must use a fully unlocked save file to play ${MOD_NAME}.\n\nYou can download a fully unlocked save file from:\nhttps://www.speedrun.com/repentance/resources`,
      );
    } else if (v.run.otherModsEnabled) {
      this.drawErrorText(
        `You have illegal mods enabled.\n\nMake sure that ${MOD_NAME} is the only mod enabled in your mod list and then completely close and re-open the game.`,
      );
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

  @PriorityCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    CallbackPriority.EARLY,
    false,
  )
  postGameStartedReorderedFalseEarly(): void {
    checkAfterbirthPlus();
    checkIncompleteSave();
    checkOtherModsEnabled();
  }
}

function checkAfterbirthPlus() {
  if (!isRepentance()) {
    log("Error: Afterbirth+ detected.");
    v.run.afterbirthPlus = true;
  }
}

function checkIncompleteSave() {
  const isCollectibleUnlocked = mod.isCollectibleUnlocked(
    INCOMPLETE_SAVE_COLLECTIBLE_TO_CHECK,
    INCOMPLETE_SAVE_ITEM_POOL_TO_CHECK,
  );

  v.run.incompleteSave = !isCollectibleUnlocked;

  if (v.run.incompleteSave) {
    log(
      `Error: Incomplete save file detected. Failed to get collectible ${getCollectibleName(
        INCOMPLETE_SAVE_COLLECTIBLE_TO_CHECK,
      )} (${INCOMPLETE_SAVE_COLLECTIBLE_TO_CHECK}) from pool ${
        ItemPoolType[INCOMPLETE_SAVE_ITEM_POOL_TO_CHECK]
      } (${INCOMPLETE_SAVE_ITEM_POOL_TO_CHECK}).`,
    );
  }
}

/**
 * Check to see if there are any mods enabled that have added custom items. (It is difficult to
 * detect other mods in other ways.)
 *
 * We hardcode a check for External Item Descriptions, since it is a popular mod.
 */
function checkOtherModsEnabled() {
  const lastCollectibleType = mod.getLastCollectibleType();
  if (lastCollectibleType !== LAST_VANILLA_COLLECTIBLE_TYPE) {
    log(
      `Error: Other mods detected. (The highest collectible ID is ${lastCollectibleType}, but it should be ${LAST_VANILLA_COLLECTIBLE_TYPE}.)`,
    );
    v.run.otherModsEnabled = true;
  }

  if (StageAPI !== undefined) {
    log("Error: StageAPI detected.");
    v.run.otherModsEnabled = true;
  }
}
