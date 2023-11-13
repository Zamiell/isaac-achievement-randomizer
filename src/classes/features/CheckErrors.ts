import {
  CallbackPriority,
  CollectibleType,
  ItemPoolType,
  ModCallback,
  PlayerType,
  SeedEffect,
} from "isaac-typescript-definitions";
import {
  Callback,
  LAST_VANILLA_CARD_TYPE,
  LAST_VANILLA_COLLECTIBLE_TYPE,
  LAST_VANILLA_PILL_EFFECT,
  LAST_VANILLA_TRINKET_TYPE,
  ModCallbackCustom,
  ModFeature,
  PriorityCallback,
  PriorityCallbackCustom,
  VectorZero,
  anyEasterEggEnabled,
  emptyRoomGridEntities,
  game,
  getChallengeName,
  getCharacterName,
  getCollectibleName,
  isRepentance,
  log,
  newSprite,
  onVictoryLap,
  parseSemanticVersion,
  removeAllDoors,
} from "isaacscript-common";
import { version } from "../../../package.json";
import { BANNED_CHALLENGES } from "../../arrays/unlockableChallenges";
import { BANNED_CHARACTERS } from "../../arrays/unlockableCharacters";
import {
  IS_DEV,
  LAST_VERSION_WITH_ACHIEVEMENT_CHANGES,
  MOD_NAME,
} from "../../constants";
import { UnlockableArea } from "../../enums/UnlockableArea";
import { mod } from "../../mod";
import {
  isAreaUnlocked,
  isChallengeUnlocked,
  isCharacterUnlocked,
} from "./achievementTracker/completedUnlocks";
import {
  getAchievementsVersion,
  isAcceptedVersionMismatch,
  isRandomizerEnabled,
} from "./achievementTracker/v";
import { hasErrors, v } from "./checkErrors/v";

const BLACK_SPRITE = newSprite("gfx/misc/black.anm2");

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
    this.checkDrawErrorText();
  }

  /**
   * We want the black sprite to be drawn behind the Dead Sea Scrolls menu, so it has to be in a
   * separate priority callback.
   */
  // 2
  @PriorityCallback(ModCallback.POST_RENDER, CallbackPriority.EARLY)
  postRenderEarly(): void {
    if (hasErrors()) {
      BLACK_SPRITE.Render(VectorZero);
    }
  }

  checkDrawErrorText(): void {
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
    } else if (v.run.bannedCharacter) {
      this.drawErrorText(
        "This character is not part of Achievement Randomizer, so you cannot play it while in a randomizer playthrough.",
      );
    } else if (v.run.lockedChallenge) {
      this.drawErrorText("You have not unlocked this challenge yet.");
    } else if (v.run.bannedChallenge) {
      this.drawErrorText(
        "This challenge is not part of Achievement Randomizer, so you cannot play it while in a randomizer playthrough.",
      );
    } else if (v.run.lockedMode) {
      this.drawErrorText("You have not unlocked Greed Mode yet.");
    } else if (v.run.versionMismatch) {
      const achievementsVersion = getAchievementsVersion();
      const achievementsVersionString =
        achievementsVersion === "" ? "[unknown]" : achievementsVersion;
      this.drawErrorText(
        `The achievements that were created at the beginning of your current playthrough are now out of date with the latest version of the Achievement Randomizer mod. (The current version is ${version}, the last version with achievement changes was ${LAST_VERSION_WITH_ACHIEVEMENT_CHANGES}, and the version that you started the playthrough on was ${achievementsVersionString}.\n\nIt is recommended that you start over with a fresh playthrough by typing the console command of "endRandomizer". Otherwise, you can proceed and potentially finish the playthrough by typing the console command of "forceWrongVersion". (However, if you do this, there may be bugs.)`,
      );
    } else if (v.run.rerun) {
      this.drawErrorText(
        `You are not allowed to play ${MOD_NAME} using reruns.`,
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

    if (isRandomizerEnabled()) {
      checkEasterEggs();
      checkVictoryLap();
      checkCharacterUnlocked();
      checkCharacterBanned();
      checkChallengeUnlocked();
      checkChallengeBanned();
      checkModeUnlocked();
      checkVersionMismatch();
    }

    if (hasErrors()) {
      removeAllDoors();
      emptyRoomGridEntities(); // For Greed Mode.

      const hud = game.GetHUD();
      hud.SetVisible(false);

      const player = Isaac.GetPlayer();
      player.AddControlsCooldown(1_000_000_000);
    }
  }

  @PriorityCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    CallbackPriority.EARLY,
    true,
  )
  postGameStartedReorderedTrueEarly(): void {
    checkRerun();
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

  const lastTrinketType = mod.getLastTrinketType();
  if (lastTrinketType !== LAST_VANILLA_TRINKET_TYPE) {
    log(
      `Error: Other mods detected. (The highest trinket ID is ${lastTrinketType}, but it should be ${LAST_VANILLA_TRINKET_TYPE}.)`,
    );
    v.run.otherModsEnabled = true;
  }

  const lastCardType = mod.getLastCardType();
  if (lastCardType !== LAST_VANILLA_CARD_TYPE) {
    log(
      `Error: Other mods detected. (The highest card ID is ${lastCardType}, but it should be ${LAST_VANILLA_CARD_TYPE}.)`,
    );
    v.run.otherModsEnabled = true;
  }

  const lastPillEffect = mod.getLastPillEffect();
  if (lastPillEffect !== LAST_VANILLA_PILL_EFFECT) {
    log(
      `Error: Other mods detected. (The highest pill effect ID is ${lastPillEffect}, but it should be ${LAST_VANILLA_PILL_EFFECT}.)`,
    );
    v.run.otherModsEnabled = true;
  }

  if (StageAPI !== undefined) {
    log("Error: StageAPI detected.");
    v.run.otherModsEnabled = true;
  }
}

function checkEasterEggs() {
  if (anyEasterEggEnabled([SeedEffect.ALL_CHAMPIONS])) {
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

function checkCharacterBanned() {
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  if (BANNED_CHARACTERS.has(character)) {
    const characterName = getCharacterName(character);
    log(`Error: Banned character detected: ${characterName} (${character})`);
    v.run.bannedCharacter = true;
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

function checkChallengeBanned() {
  const challenge = Isaac.GetChallenge();

  if (BANNED_CHALLENGES.has(challenge)) {
    const challengeName = getChallengeName(challenge);
    log(`Error: Banned challenge detected: ${challengeName} (${challenge})`);
    v.run.bannedChallenge = true;
  }
}

function checkModeUnlocked() {
  if (game.IsGreedMode() && !isAreaUnlocked(UnlockableArea.GREED_MODE, false)) {
    log("Error: Locked Greed Mode detected.");
    v.run.lockedMode = true;
  }
}

function checkVersionMismatch() {
  if (IS_DEV || isAcceptedVersionMismatch()) {
    return;
  }

  const versionsMatch = doVersionsMatch();
  if (!versionsMatch) {
    log("Error: Version mismatch detected.");
    log(
      `Last version with achievement changes: ${LAST_VERSION_WITH_ACHIEVEMENT_CHANGES}`,
    );
    log(`Current achievements version: ${getAchievementsVersion()}`);
    v.run.versionMismatch = true;
  }
}

function doVersionsMatch(): boolean {
  const achievementsVersion = getAchievementsVersion();

  // The achievements version will be a blank string if the achievements were created before the
  // achievement version tracking feature existed.
  if (achievementsVersion === "") {
    return false;
  }

  const correctSemanticVersion = parseSemanticVersion(
    LAST_VERSION_WITH_ACHIEVEMENT_CHANGES,
  );
  if (correctSemanticVersion === undefined) {
    error(
      `Failed to parse the last version with achievement changes: ${LAST_VERSION_WITH_ACHIEVEMENT_CHANGES}`,
    );
  }

  const correctMajorVersion = correctSemanticVersion.majorVersion;
  const correctMinorVersion = correctSemanticVersion.minorVersion;

  const achievementsSemanticVersion = parseSemanticVersion(achievementsVersion);
  if (achievementsSemanticVersion === undefined) {
    error(`Failed to parse the achievements version: ${achievementsVersion}`);
  }

  const achievementsMajorVersion = achievementsSemanticVersion.majorVersion;
  const achievementsMinorVersion = achievementsSemanticVersion.minorVersion;

  if (correctMajorVersion > achievementsMajorVersion) {
    return false;
  }

  if (correctMinorVersion > achievementsMinorVersion) {
    return false;
  }

  return true;
}

function checkRerun() {
  if (mod.onRerun()) {
    log("Error: Rerun detected.");
    v.run.rerun = true;
  }
}
