import type {
  ActiveSlot,
  BatterySubType,
  SackSubType,
  UseFlag,
} from "isaac-typescript-definitions";
import {
  BombSubType,
  CardType,
  CoinSubType,
  CollectibleType,
  HeartSubType,
  KeySubType,
  ModCallback,
  PickupVariant,
  PlayerItemAnimation,
  PlayerType,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  game,
  getCollectibles,
  getGoldenTrinketType,
  getNormalTrinketType,
  getRandomArrayElement,
  getRandomSetElement,
  inStartingRoom,
  includes,
  isChestVariant,
  isGoldenTrinketType,
  isQuestCollectible,
  isRune,
  isSuitCard,
  itemConfig,
  log,
  onChest,
  onDarkRoom,
  removeAllPickups,
  setCollectibleEmpty,
  setCollectibleSubType,
  spawnCoinWithSeed,
} from "isaacscript-common";
import { BANNED_CARD_TYPES } from "../../arrays/unlockableCardTypes";
import {
  BANNED_COLLECTIBLE_TYPES,
  NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
  QUEST_COLLECTIBLE_TYPES,
  UNLOCKABLE_COLLECTIBLE_TYPES,
} from "../../arrays/unlockableCollectibleTypes";
import { UNLOCKABLE_TRINKET_TYPES } from "../../arrays/unlockableTrinketTypes";
import { MOD_NAME } from "../../constants";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { isItemPoolsDepleted } from "../../utils";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isAllCharacterObjectivesCompleted } from "./achievementTracker/completedObjectives";
import {
  anyCardTypesUnlocked,
  getUnlockedCardTypes,
  getUnlockedTrinketTypes,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isHeartSubTypeUnlocked,
  isKeySubTypeUnlocked,
  isOtherUnlockKindUnlocked,
  isSackSubTypeUnlocked,
  isTrinketTypeUnlocked,
} from "./achievementTracker/completedUnlocks";
import { getRandomizerSeed } from "./achievementTracker/v";

/** This feature handles removing all of the pickups from the game that are not unlocked yet. */
export class PickupRemoval extends RandomizerModFeature {
  // 20
  @Callback(ModCallback.GET_CARD)
  getCard(
    rng: RNG,
    cardType: CardType,
    includePlayingCards: boolean,
    includeRunes: boolean,
    onlyRunes: boolean,
  ): CardType | undefined {
    if (isCardTypeUnlocked(cardType, true)) {
      return undefined;
    }

    const unlockedCardTypes = getUnlockedCardTypes(true);

    // If there are no unlocked card types, the card will be replaced with a coin in the
    // `POST_PICKUP_SELECTION_FILTER` callback.
    if (unlockedCardTypes.length === 0) {
      return undefined;
    }

    const runeCardTypes = unlockedCardTypes.filter((unlockedCardType) =>
      isRune(unlockedCardType),
    );

    if (onlyRunes) {
      return runeCardTypes.length === 0
        ? CardType.RUNE_SHARD
        : getRandomArrayElement(runeCardTypes, rng);
    }

    const playingCardTypes = unlockedCardTypes.filter((unlockedCardType) =>
      isSuitCard(unlockedCardType),
    );

    const cardTypesToUse = new Set(unlockedCardTypes);

    if (!includePlayingCards) {
      for (const playingCardType of playingCardTypes) {
        cardTypesToUse.delete(playingCardType);
      }
    }

    if (!includeRunes) {
      for (const runeCardType of runeCardTypes) {
        cardTypesToUse.delete(runeCardType);
      }
    }

    // If there are no unlocked card types that match the criteria for the callback, we explicitly
    // replace it with a Rune Shard, which will be replaced in the `POST_PICKUP_SELECTION_FILTER`
    // callback.
    if (cardTypesToUse.size === 0) {
      return CardType.RUNE_SHARD;
    }

    return getRandomSetElement(cardTypesToUse, rng);
  }

  /**
   * We have to code Spindown Dice from scratch so that it will skip over locked collectible types.
   */
  // 23, 723
  @Callback(ModCallback.PRE_USE_ITEM, CollectibleType.SPINDOWN_DICE)
  preUseItemSpindownDice(
    _collectibleType: CollectibleType,
    _rng: RNG,
    player: EntityPlayer,
    _useFlags: BitFlags<UseFlag>,
    _activeSlot: ActiveSlot,
    _customVarData: int,
  ): boolean | undefined {
    for (const collectible of getCollectibles()) {
      // In vanilla, Spindown Dice is hardcoded to affect Dad's Note.
      if (collectible.SubType === CollectibleType.DADS_NOTE) {
        continue;
      }

      let newCollectibleType = collectible.SubType;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
      while (true) {
        newCollectibleType--; // eslint-disable-line isaacscript/strict-enums

        if (newCollectibleType <= CollectibleType.NULL) {
          break;
        }

        const itemConfigItem = itemConfig.GetCollectible(newCollectibleType);
        if (itemConfigItem === undefined) {
          continue;
        }

        if (
          !isCollectibleTypeUnlocked(newCollectibleType, true) ||
          includes(QUEST_COLLECTIBLE_TYPES, newCollectibleType) ||
          includes(
            NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS,
            newCollectibleType,
          ) ||
          includes(BANNED_COLLECTIBLE_TYPES, newCollectibleType)
        ) {
          continue;
        }

        break;
      }

      if (newCollectibleType <= CollectibleType.NULL) {
        setCollectibleEmpty(collectible);
      } else {
        setCollectibleSubType(collectible, newCollectibleType);
      }
    }

    player.AnimateCollectible(
      CollectibleType.SPINDOWN_DICE,
      PlayerItemAnimation.USE_ITEM,
    );

    return true;
  }

  /**
   * Set items are unlockable, but they will show up even if they are removed from pools. Replace
   * them with Breakfast.
   */
  // 34, 100
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.COLLECTIBLE)
  postPickupInitCollectible(pickup: EntityPickup): void {
    const collectible = pickup as EntityPickupCollectible;

    if (
      collectible.SubType === CollectibleType.BREAKFAST &&
      isItemPoolsDepleted()
    ) {
      return;
    }

    if (
      !isCollectibleTypeUnlocked(collectible.SubType, true) ||
      // Prevent e.g. Spindown Dice from producing banned collectibles.
      includes(BANNED_COLLECTIBLE_TYPES, collectible.SubType)
    ) {
      if (isQuestCollectible(collectible.SubType)) {
        collectible.Remove();
      } else {
        setCollectibleSubType(collectible, CollectibleType.BREAKFAST);
      }
    }
  }

  /** Some rooms have set cards, so we need to check for that case. */
  // 34, 300
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.CARD)
  postPickupInitCard(pickup: EntityPickup): void {
    const card = pickup as EntityPickupCard;

    if (
      !isCardTypeUnlocked(card.SubType, true) ||
      BANNED_CARD_TYPES.has(card.SubType)
    ) {
      const cardTypes = getUnlockedCardTypes(true);
      if (cardTypes.length === 0) {
        card.Remove();
        spawnCoinWithSeed(CoinSubType.PENNY, card.Position, card.InitSeed);
      } else {
        const newCardType = getRandomArrayElement(cardTypes, card.InitSeed);
        card.Morph(card.Type, card.Variant, newCardType, true, true, true);
      }
    }
  }

  /**
   * Unlike other trinkets, we want to remove Perfection entirely instead of replace it with another
   * random unlocked trinket (in order to prevent bosses from awarding the player random trinkets).
   */
  // 34, 350, 145
  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_INIT_FILTER,
    PickupVariant.TRINKET,
    TrinketType.PERFECTION,
  )
  postPickupInitPerfection(pickup: EntityPickup): void {
    if (!isTrinketTypeUnlocked(TrinketType.PERFECTION, true)) {
      pickup.Remove();
    }
  }

  // 37
  @Callback(ModCallback.POST_PICKUP_SELECTION)
  postPickupSelection(
    _pickup: EntityPickup,
    pickupVariant: PickupVariant,
    _subType: int,
  ): [PickupVariant, int] | undefined {
    if (!isChestVariant(pickupVariant)) {
      return undefined;
    }

    return isChestPickupVariantUnlocked(pickupVariant, true)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const seeds = game.GetSeeds();
    const startSeedString = seeds.GetStartSeedString();

    log(`${MOD_NAME} started on seed: ${startSeedString}`);

    this.removeItemsFromPools();
  }

  removeItemsFromPools(): void {
    const itemPool = game.GetItemPool();

    for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
      if (!isCollectibleTypeUnlocked(collectibleType, true)) {
        itemPool.RemoveCollectible(collectibleType);
      }
    }

    for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
      if (!isTrinketTypeUnlocked(trinketType, true)) {
        itemPool.RemoveTrinket(trinketType);
      }
    }

    this.conditionallyRemoveRevivalCollectible(
      itemPool,
      CollectibleType.ANKH, // 161
      PlayerType.BLUE_BABY,
    );
    this.conditionallyRemoveRevivalCollectible(
      itemPool,
      CollectibleType.JUDAS_SHADOW, // 311
      PlayerType.JUDAS,
    );
    this.conditionallyRemoveRevivalCollectible(
      itemPool,
      CollectibleType.LAZARUS_RAGS, // 332
      PlayerType.JUDAS,
    );
    this.conditionallyRemoveRevivalTrinket(
      itemPool,
      TrinketType.MYSTERIOUS_PAPER, // 21
      PlayerType.LOST,
    );
    this.conditionallyRemoveRevivalTrinket(
      itemPool,
      TrinketType.MISSING_POSTER, // 23
      PlayerType.LOST,
    );
    this.conditionallyRemoveRevivalTrinket(
      itemPool,
      TrinketType.BROKEN_ANKH, // 28
      PlayerType.BLUE_BABY,
    );
  }

  conditionallyRemoveRevivalCollectible(
    itemPool: ItemPool,
    collectibleType: CollectibleType,
    character: PlayerType,
  ): void {
    if (!isAllCharacterObjectivesCompleted(character)) {
      itemPool.RemoveCollectible(collectibleType);
    }
  }

  conditionallyRemoveRevivalTrinket(
    itemPool: ItemPool,
    trinketType: TrinketType,
    character: PlayerType,
  ): void {
    if (!isAllCharacterObjectivesCompleted(character)) {
      itemPool.RemoveTrinket(trinketType);
    }
  }

  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    const room = game.GetRoom();
    const isFirstVisit = room.IsFirstVisit();
    if (!isFirstVisit) {
      return;
    }

    if (!inStartingRoom()) {
      return;
    }

    if (
      onChest() &&
      !isChestPickupVariantUnlocked(PickupVariant.LOCKED_CHEST, true)
    ) {
      removeAllPickups(PickupVariant.CHEST);
    }

    if (
      onDarkRoom() &&
      !isChestPickupVariantUnlocked(PickupVariant.RED_CHEST, true)
    ) {
      removeAllPickups(PickupVariant.CHEST);
    }
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.HEART, // 10
  )
  postPickupSelectionHeart(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const heartSubType = subType as HeartSubType;

    return isHeartSubTypeUnlocked(heartSubType, true)
      ? undefined
      : [PickupVariant.HEART, HeartSubType.HALF];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.COIN, // 20
  )
  postPickupSelectionCoin(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const coinSubType = subType as CoinSubType;

    return isCoinSubTypeUnlocked(coinSubType, true)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.KEY, // 30
  )
  postPickupSelectionKey(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const keySubType = subType as KeySubType;

    return isKeySubTypeUnlocked(keySubType, true)
      ? undefined
      : [PickupVariant.KEY, KeySubType.NORMAL];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.BOMB, // 40
  )
  postPickupSelectionBomb(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const bombSubType = subType as BombSubType;

    return isBombSubTypeUnlocked(bombSubType, true)
      ? undefined
      : [PickupVariant.BOMB, BombSubType.NORMAL];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.SACK, // 69
  )
  postPickupSelectionSack(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const sackSubType = subType as SackSubType;

    return isSackSubTypeUnlocked(sackSubType, true)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.LIL_BATTERY, // 90
  )
  postPickupSelectionLilBattery(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const batterySubType = subType as BatterySubType;

    return isBatterySubTypeUnlocked(batterySubType, true)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.CARD, // 300
  )
  postPickupSelectionCard(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyCardTypesUnlocked(true)) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    // We make Rune Shards elsewhere in this feature to signify that the card should be replaced
    // with a penny.
    const cardType = subType as CardType;
    if (cardType === CardType.RUNE_SHARD) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    return undefined;
  }

  /**
   * If the trinket pool is depleted, it will automatically refill the pool with every trinket. In
   * other words, this is no analogous "Breakfast" mechanic for trinkets. Thus, we must manually
   * replace locked trinket types with a random unlocked trinket type. (If no trinket types are
   * unlocked, we replace all trinkets with pennies.)
   */
  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.TRINKET, // 350
  )
  postPickupSelectionTrinket(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    const trinketType = subType as TrinketType;

    const unlockedTrinketTypes = getUnlockedTrinketTypes(true);
    if (unlockedTrinketTypes.length === 0) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    return isGoldenTrinketType(trinketType)
      ? this.postPickupSelectionGoldTrinket(trinketType, unlockedTrinketTypes)
      : this.postPickupSelectionNormalTrinket(
          trinketType,
          unlockedTrinketTypes,
        );
  }

  /** Convert gold trinkets to the corresponding non-gold version. */
  postPickupSelectionGoldTrinket(
    trinketType: TrinketType,
    unlockedTrinketTypes: TrinketType[],
  ): [PickupVariant, int] | undefined {
    const normalizedTrinketType = getNormalTrinketType(trinketType);
    const goldTrinketsUnlocked = isOtherUnlockKindUnlocked(
      OtherUnlockKind.GOLD_TRINKETS,
      true,
    );

    // Perfection should always be selected but will be conditionally removed after spawning.
    if (
      unlockedTrinketTypes.includes(normalizedTrinketType) ||
      normalizedTrinketType === TrinketType.PERFECTION
    ) {
      return goldTrinketsUnlocked
        ? undefined
        : [PickupVariant.TRINKET, normalizedTrinketType];
    }

    const newTrinketType = getRandomArrayElement(
      unlockedTrinketTypes,
      getRandomizerSeed(),
    );
    const trinketTypeToUse = goldTrinketsUnlocked
      ? getGoldenTrinketType(newTrinketType)
      : newTrinketType;

    return [PickupVariant.TRINKET, trinketTypeToUse];
  }

  postPickupSelectionNormalTrinket(
    trinketType: TrinketType,
    unlockedTrinketTypes: TrinketType[],
  ): [PickupVariant, int] | undefined {
    // Perfection should always be selected but will be conditionally removed after spawning.
    if (
      unlockedTrinketTypes.includes(trinketType) ||
      trinketType === TrinketType.PERFECTION
    ) {
      return undefined;
    }

    const newTrinketType = getRandomArrayElement(
      unlockedTrinketTypes,
      getRandomizerSeed(),
    );
    return [PickupVariant.TRINKET, newTrinketType];
  }
}
