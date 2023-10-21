import {
  CardType,
  EffectVariant,
  PillColor,
  PillEffect,
  PlayerType,
  SoundEffect,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  VANILLA_COLLECTIBLE_TYPES,
  game,
  getRandomArrayElement,
  includes,
  isEden,
  isGoldenTrinketType,
  newRNG,
  rebirthItemTrackerRemoveCollectible,
  removeAllEffects,
  removeAllFamiliars,
  removeAllPickups,
  removeAllTears,
  setPlayerHealth,
  sfxManager,
} from "isaacscript-common";
import { BANNED_COLLECTIBLE_TYPES } from "../../arrays/unlockableCollectibleTypes";
import { BANNED_TRINKET_TYPES_SET } from "../../arrays/unlockableTrinketTypes";
import { POCKET_ITEM_SLOTS, TRINKET_SLOTS } from "../../cachedEnums";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  anyPillEffectsUnlocked,
  getUnlockedEdenActiveCollectibleTypes,
  getUnlockedEdenPassiveCollectibleTypes,
  isCardTypeUnlocked,
  isCharacterUnlocked,
  isCollectibleTypeUnlocked,
  isOtherUnlockKindUnlocked,
  isPillEffectUnlocked,
  isTrinketTypeUnlocked,
} from "./achievementTracker/completedUnlocks";

/** This feature handles removing the starting items of a player that are not unlocked yet. */
export class StartingItemRemoval extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_PLAYER_INIT_FIRST)
  postPlayerInitFirst(): void {
    this.removeItemsFromInventory();
  }

  removeItemsFromInventory(): void {
    const player = Isaac.GetPlayer();
    const character = player.GetPlayerType();

    for (const collectibleType of VANILLA_COLLECTIBLE_TYPES) {
      if (
        player.HasCollectible(collectibleType) &&
        (!isCollectibleTypeUnlocked(collectibleType, true) ||
          includes(BANNED_COLLECTIBLE_TYPES, collectibleType) ||
          isEden(player))
      ) {
        player.RemoveCollectible(collectibleType);
        rebirthItemTrackerRemoveCollectible(collectibleType);
      }
    }

    for (const trinketSlot of TRINKET_SLOTS) {
      const trinketType = player.GetTrinket(trinketSlot);
      if (
        trinketType !== TrinketType.NULL &&
        (!isTrinketTypeUnlocked(trinketType, true) ||
          (isGoldenTrinketType(trinketType) &&
            !isOtherUnlockKindUnlocked(OtherUnlockKind.GOLD_TRINKETS, true)) ||
          BANNED_TRINKET_TYPES_SET.has(trinketType) ||
          isEden(player))
      ) {
        player.TryRemoveTrinket(trinketType);
      }
    }

    for (const pocketItemSlot of POCKET_ITEM_SLOTS) {
      const pillColor = player.GetPill(pocketItemSlot);
      if (
        pillColor !== PillColor.NULL &&
        (!anyPillEffectsUnlocked(true) ||
          isEden(player) ||
          (character === PlayerType.MAGDALENE &&
            !isPillEffectUnlocked(PillEffect.SPEED_UP, true)))
      ) {
        player.SetPill(pocketItemSlot, PillColor.NULL);
      }

      const cardType = player.GetCard(pocketItemSlot);
      if (
        cardType !== CardType.NULL &&
        (!isCardTypeUnlocked(cardType, true) || isEden(player))
      ) {
        player.SetCard(pocketItemSlot, CardType.NULL);
      }
    }

    switch (character) {
      // 9, 30
      case PlayerType.EDEN:
      case PlayerType.EDEN_B: {
        // Eden may be randomly given collectibles that are not yet unlocked, so we remove all
        // collectibles and then explicitly add two new ones.
        this.emptyEdenInventory(player);
        this.addEdenRandomCollectibles(player);
        break;
      }

      default: {
        break;
      }
    }
  }

  /** Collectibles, trinkets, cards, and pills were removed earlier on. */
  emptyEdenInventory(player: EntityPlayer): void {
    // Some collectibles will spawn things in the room.
    removeAllPickups();
    removeAllTears();
    removeAllFamiliars();
    removeAllEffects(EffectVariant.BLOOD_EXPLOSION); // 2
    removeAllEffects(EffectVariant.POOF_1); // 15
    sfxManager.Stop(SoundEffect.MEAT_JUMPS); // 72
    sfxManager.Stop(SoundEffect.TEARS_FIRE); // 153

    // Some collectibles will add health.
    const startingHealth = mod.getEdenStartingHealth(player);
    if (startingHealth !== undefined) {
      setPlayerHealth(player, startingHealth);
    }
  }

  addEdenRandomCollectibles(player: EntityPlayer): void {
    const character = player.GetPlayerType();
    if (!isCharacterUnlocked(character, true)) {
      return;
    }

    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();
    const rng = newRNG(startSeed);

    const activeCollectibleTypes = getUnlockedEdenActiveCollectibleTypes(true);
    const passiveCollectibleTypes =
      getUnlockedEdenPassiveCollectibleTypes(true);

    const passiveCollectibleType = getRandomArrayElement(
      passiveCollectibleTypes,
      rng,
    );

    // If we do not have any active collectibles unlocked, default to giving Eden a second passive
    // collectible.
    const activeCollectibleType =
      activeCollectibleTypes.length === 0
        ? getRandomArrayElement(passiveCollectibleTypes, rng, [
            passiveCollectibleType,
          ])
        : getRandomArrayElement(activeCollectibleTypes, rng);

    player.AddCollectible(activeCollectibleType);
    player.AddCollectible(passiveCollectibleType);
  }
}
