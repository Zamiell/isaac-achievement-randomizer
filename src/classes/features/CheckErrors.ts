import {
  CallbackPriority,
  CollectibleType,
  Difficulty,
  ItemPoolType,
  ModCallback,
  PlayerType,
} from "isaac-typescript-definitions";
import {
  Callback,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  ModCallbackCustom,
  ModFeature,
  PriorityCallbackCustom,
  anyEasterEggEnabled,
  emptyRoomGridEntities,
  game,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  isRepentance,
  log,
  onAnyChallenge,
  onSetSeed,
  onVictoryLap,
  removeAllDoors,
} from "isaacscript-common";
import { IS_DEV, MOD_NAME } from "../../constants";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { mod } from "../../mod";
import {
  isChallengeUnlocked,
  isCharacterUnlocked,
  isPathUnlocked,
} from "./achievementTracker/completedUnlocks";
import { isRandomizerEnabled } from "./achievementTracker/v";
import { hasErrors, v } from "./checkErrors/v";

const INCOMPLETE_SAVE_COLLECTIBLE_TO_CHECK = CollectibleType.DEATH_CERTIFICATE;
const INCOMPLETE_SAVE_ITEM_POOL_TO_CHECK = ItemPoolType.SECRET;

const STARTING_X = 115;
const STARTING_Y = 70;
const MAX_CHARACTERS_PER_LINE = 50;

/** This does not extend from `RandomizerModFeature` because we need to always do the checks. */
export class CheckErrors extends ModFeature {
  v = v;

  // 2
  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    if (ModConfigMenu !== undefined && ModConfigMenu.IsVisible) {
      return;
    }

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
    } else if (v.run.normalMode) {
      this.drawErrorText(
        `You are playing on normal mode, but you are only allowed to play ${MOD_NAME} on hard mode.`,
      );
    } else if (v.run.normalGreedMode) {
      this.drawErrorText(
        `You are playing on Greed Mode, but you are only allowed to play ${MOD_NAME} on Greedier mode.`,
      );
    } else if (v.run.onSetSeed) {
      this.drawErrorText(
        `You are only allowed to play ${MOD_NAME} on random seeds.`,
      );
    } else if (v.run.hasEasterEggs) {
      this.drawErrorText(
        `You are only allowed to play ${MOD_NAME} with all Easter Eggs disabled.`,
      );
    } else if (v.run.onVictoryLap) {
      this.drawErrorText(
        `You are not allowed to play ${MOD_NAME} on a Victory Lap.`,
      );
    } else if (v.run.lockedCharacter) {
      const player = Isaac.GetPlayer();
      const character = player.GetPlayerType();
      const characterName = getCharacterName(character);
      this.drawErrorText(`You have not unlocked ${characterName} yet.`);
    } else if (v.run.lockedChallenge) {
      this.drawErrorText("You have not unlocked this challenge yet.");
    } else if (v.run.lockedMode) {
      this.drawErrorText("You have not unlocked Greed Mode yet.");
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

    if (isRandomizerEnabled()) {
      checkNormalMode();
      checkNormalGreedMode();
      checkSetSeed();
      checkEasterEggs();
      checkVictoryLap();
      checkCharacterUnlocked();
      checkChallengeUnlocked();
      checkModeUnlocked();
    }

    if (hasErrors()) {
      removeAllDoors();
      emptyRoomGridEntities(); // For Greed Mode.
    }
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

function checkNormalMode() {
  // Some challenges are on normal mode.
  if (onAnyChallenge()) {
    return;
  }

  if (game.Difficulty === Difficulty.NORMAL) {
    log("Error: Normal mode (non-hard mode) detected.");
    v.run.normalMode = true;
  }
}

function checkNormalGreedMode() {
  if (game.Difficulty === Difficulty.GREED) {
    log("Error: Normal Greed Mode (non-Greedier mode) detected.");
    v.run.normalGreedMode = true;
  }
}

function checkSetSeed() {
  if (onSetSeed() && !IS_DEV) {
    const seeds = game.GetSeeds();
    const startSeedString = seeds.GetStartSeedString();
    log(`Error: Set seed detected: ${startSeedString}`);
    v.run.onSetSeed = true;
  }
}

function checkEasterEggs() {
  if (anyEasterEggEnabled()) {
    log("Error: Easter Egg detected.");
    v.run.hasEasterEggs = true;
  }
}

function checkVictoryLap() {
  if (onVictoryLap()) {
    log("Error: Victory Lap detected.");
    v.run.onVictoryLap = true;
  }
}

function checkCharacterUnlocked() {
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  if (!isCharacterUnlocked(character, false)) {
    log(
      `Error: Locked character detected: ${PlayerType[character]} (${character})`,
    );
    v.run.lockedCharacter = true;
  }
}

function checkChallengeUnlocked() {
  const challenge = Isaac.GetChallenge();

  if (!isChallengeUnlocked(challenge, false)) {
    const challengeName = getChallengeName(challenge);
    log(`Error: Locked challenge detected: ${challengeName} (${challenge})`);
    v.run.lockedChallenge = true;
  }
}

function checkModeUnlocked() {
  if (
    game.Difficulty === Difficulty.GREEDIER &&
    !isPathUnlocked(UnlockablePath.GREED_MODE, false)
  ) {
    log("Error: Locked Greed Mode detected.");
    v.run.lockedMode = true;
  }
}
