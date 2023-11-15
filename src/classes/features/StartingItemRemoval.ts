import {
  CardType,
  Challenge,
  CollectibleType,
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
  addCollectible,
  copyArray,
  game,
  getRandomArrayElement,
  getRandomArrayElementAndRemove,
  isCharacter,
  isEden,
  isGoldenTrinketType,
  newRNG,
  onChallenge,
  rebirthItemTrackerRemoveCollectible,
  removeAllEffects,
  removeAllFamiliars,
  removeAllPickups,
  removeAllTears,
  repeat,
  setPlayerHealth,
  sfxManager,
} from "isaacscript-common";
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

/**
 * This does not include Key Piece 1 and Key Piece 2, which you also always start with in this
 * challenge.
 */
const NUM_BACKASSWARDS_STARTING_COLLECTIBLES = 10;

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
          isEden(player) ||
          onChallenge(Challenge.BACKASSWARDS)) &&
        !(
          isCharacter(player, PlayerType.CAIN_B) &&
          collectibleType === CollectibleType.BAG_OF_CRAFTING
        )
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

    if (onChallenge(Challenge.BACKASSWARDS)) {
      this.addBackasswardsRandomCollectibles(player);
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

  addBackasswardsRandomCollectibles(player: EntityPlayer): void {
    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();
    const rng = newRNG(startSeed);

    const passiveCollectibleTypes = copyArray(
      getUnlockedEdenPassiveCollectibleTypes(true),
    );

    const randomStartingCollectibles: CollectibleType[] = [];
    repeat(NUM_BACKASSWARDS_STARTING_COLLECTIBLES, () => {
      // We might not have 10 passive collectibles unlocked.
      if (passiveCollectibleTypes.length === 0) {
        return;
      }

      const randomStartingCollectible = getRandomArrayElementAndRemove(
        passiveCollectibleTypes,
        rng,
      );
      randomStartingCollectibles.push(randomStartingCollectible);
    });

    addCollectible(player, ...randomStartingCollectibles);
  }
}
