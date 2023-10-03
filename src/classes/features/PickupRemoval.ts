import type {
  ActiveSlot,
  BatterySubType,
  PillEffect,
  SackSubType,
  UseFlag,
} from "isaac-typescript-definitions";
import {
  BombSubType,
  CardType,
  ChestSubType,
  CoinSubType,
  CollectibleType,
  EffectVariant,
  HeartSubType,
  KeySubType,
  ModCallback,
  PickupVariant,
  PillColor,
  PlayerItemAnimation,
  PlayerType,
  SoundEffect,
  TrinketType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  FIRST_PILL_COLOR,
  ModCallbackCustom,
  VANILLA_COLLECTIBLE_TYPES,
  game,
  getCollectibles,
  getGoldenTrinketType,
  getNormalPillColorFromHorse,
  getNormalTrinketType,
  getRandomArrayElement,
  getRandomSetElement,
  isChestVariant,
  isEden,
  isGoldPill,
  isGoldenTrinketType,
  isHorsePill,
  isRune,
  isSuitCard,
  itemConfig,
  log,
  newRNG,
  removeAllEffects,
  removeAllFamiliars,
  removeAllPickups,
  removeAllTears,
  removeCollectibleFromPools,
  removeTrinketFromPools,
  setCollectibleEmpty,
  setCollectibleSubType,
  setPlayerHealth,
  sfxManager,
} from "isaacscript-common";
import { POCKET_ITEM_SLOTS, TRINKET_SLOTS } from "../../cachedEnums";
import { MOD_NAME } from "../../constants";
import { OtherAchievementKind } from "../../enums/OtherAchievementKind";
import { mod } from "../../mod";
import {
  BANNED_COLLECTIBLE_TYPES,
  BANNED_COLLECTIBLE_TYPES_SET,
  NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS_SET,
  QUEST_COLLECTIBLE_TYPES_SET,
  UNLOCKABLE_COLLECTIBLE_TYPES,
} from "../../unlockableCollectibleTypes";
import {
  BANNED_TRINKET_TYPES,
  UNLOCKABLE_TRINKET_TYPES,
} from "../../unlockableTrinketTypes";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  anyCardTypesUnlocked,
  anyPillEffectsUnlocked,
  getUnlockedCardTypes,
  getUnlockedEdenActiveCollectibleTypes,
  getUnlockedEdenPassiveCollectibleTypes,
  getUnlockedPillEffects,
  getUnlockedTrinketTypes,
  isAllCharacterObjectivesCompleted,
  isBatterySubTypeUnlocked,
  isBombSubTypeUnlocked,
  isCardTypeUnlocked,
  isCharacterUnlocked,
  isChestPickupVariantUnlocked,
  isCoinSubTypeUnlocked,
  isCollectibleTypeUnlocked,
  isHeartSubTypeUnlocked,
  isKeySubTypeUnlocked,
  isOtherAchievementUnlocked,
  isPillEffectUnlocked,
  isSackSubTypeUnlocked,
  isTrinketTypeUnlocked,
} from "./AchievementTracker";

/** This feature handles removing all of the pickups from the game that are not unlocked yet. */
export class PickupRemoval extends RandomizerModFeature {
  // 20
  @Callback(ModCallback.GET_CARD)
  getCard(
    _rng: RNG,
    cardType: CardType,
    includePlayingCards: boolean,
    includeRunes: boolean,
    onlyRunes: boolean,
  ): CardType | undefined {
    if (isCardTypeUnlocked(cardType)) {
      return undefined;
    }

    const unlockedCardTypes = getUnlockedCardTypes();

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
        : getRandomArrayElement(runeCardTypes);
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

    return getRandomSetElement(cardTypesToUse);
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
          !isCollectibleTypeUnlocked(newCollectibleType) ||
          QUEST_COLLECTIBLE_TYPES_SET.has(newCollectibleType) ||
          NON_OBTAINABLE_COLLECTIBLE_TYPE_EXCEPTIONS_SET.has(
            newCollectibleType,
          ) ||
          BANNED_COLLECTIBLE_TYPES_SET.has(newCollectibleType)
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
      !isCollectibleTypeUnlocked(collectible.SubType) ||
      // Prevent e.g. Spindown Dice from producing banned collectibles.
      BANNED_COLLECTIBLE_TYPES_SET.has(collectible.SubType)
    ) {
      setCollectibleSubType(collectible, CollectibleType.BREAKFAST);
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

    return isChestPickupVariantUnlocked(pickupVariant)
      ? undefined
      : [PickupVariant.CHEST, ChestSubType.CLOSED];
  }

  // 65
  @Callback(ModCallback.GET_PILL_EFFECT)
  getPillEffect(
    pillEffect: PillEffect,
    _pillColor: PillColor,
  ): PillEffect | undefined {
    if (isPillEffectUnlocked(pillEffect)) {
      return undefined;
    }

    const unlockedPillEffects = getUnlockedPillEffects();

    // If there are no unlocked pill effects, the pill will be replaced with a coin in the
    // `POST_PICKUP_SELECTION_FILTER` callback.
    if (unlockedPillEffects.length === 0) {
      return undefined;
    }

    return getRandomArrayElement(unlockedPillEffects);
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const seeds = game.GetSeeds();
    const startSeedString = seeds.GetStartSeedString();

    log(`${MOD_NAME} started on seed: ${startSeedString}`);

    this.removeItemsFromPools();
    this.removeItemsFromInventory();
  }

  removeItemsFromPools(): void {
    const itemPool = game.GetItemPool();

    for (const collectibleType of UNLOCKABLE_COLLECTIBLE_TYPES) {
      if (!isCollectibleTypeUnlocked(collectibleType)) {
        itemPool.RemoveCollectible(collectibleType);
      }
    }

    removeCollectibleFromPools(...BANNED_COLLECTIBLE_TYPES);

    for (const trinketType of UNLOCKABLE_TRINKET_TYPES) {
      if (!isTrinketTypeUnlocked(trinketType)) {
        itemPool.RemoveTrinket(trinketType);
      }
    }

    removeTrinketFromPools(...BANNED_TRINKET_TYPES);

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

  removeItemsFromInventory(): void {
    const itemPool = game.GetItemPool();
    const player = Isaac.GetPlayer();
    const character = player.GetPlayerType();

    for (const collectibleType of VANILLA_COLLECTIBLE_TYPES) {
      if (
        player.HasCollectible(collectibleType) &&
        (!isCollectibleTypeUnlocked(collectibleType) || isEden(player))
      ) {
        player.RemoveCollectible(collectibleType);
      }
    }

    for (const trinketSlot of TRINKET_SLOTS) {
      const trinketType = player.GetTrinket(trinketSlot);
      if (
        trinketType !== TrinketType.NULL &&
        (!isTrinketTypeUnlocked(trinketType) ||
          (isGoldenTrinketType(trinketType) &&
            !isOtherAchievementUnlocked(OtherAchievementKind.GOLD_TRINKETS)) ||
          isEden(player))
      ) {
        player.TryRemoveTrinket(trinketType);
      }
    }

    for (const pocketItemSlot of POCKET_ITEM_SLOTS) {
      const pillColor = player.GetPill(pocketItemSlot);
      if (pillColor !== PillColor.NULL) {
        const pillEffect = itemPool.GetPillEffect(pillColor, player);
        if (
          pillEffect !== -1 &&
          (!isPillEffectUnlocked(pillEffect) || isEden(player))
        ) {
          player.SetPill(pocketItemSlot, PillColor.NULL);
        }
      }

      const cardType = player.GetCard(pocketItemSlot);
      if (
        cardType !== CardType.NULL &&
        (!isCardTypeUnlocked(cardType) || isEden(player))
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
    if (!isCharacterUnlocked(character)) {
      return;
    }

    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();
    const rng = newRNG(startSeed);

    const activeCollectibleTypes = getUnlockedEdenActiveCollectibleTypes();
    const passiveCollectibleTypes = getUnlockedEdenPassiveCollectibleTypes();

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

    return isHeartSubTypeUnlocked(heartSubType)
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

    return isCoinSubTypeUnlocked(coinSubType)
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

    return isKeySubTypeUnlocked(keySubType)
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

    return isBombSubTypeUnlocked(bombSubType)
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

    return isSackSubTypeUnlocked(sackSubType)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.PILL, // 70
  )
  postPickupSelectionPill(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyPillEffectsUnlocked()) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    const pillColor = subType as PillColor;

    if (
      isGoldPill(pillColor) &&
      !isOtherAchievementUnlocked(OtherAchievementKind.GOLD_PILLS)
    ) {
      return [PickupVariant.PILL, FIRST_PILL_COLOR];
    }

    if (
      isHorsePill(pillColor) &&
      !isOtherAchievementUnlocked(OtherAchievementKind.HORSE_PILLS)
    ) {
      const normalPillColor = getNormalPillColorFromHorse(pillColor);
      return [PickupVariant.PILL, normalPillColor];
    }

    return undefined;
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

    return isBatterySubTypeUnlocked(batterySubType)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.TAROT_CARD, // 300
  )
  postPickupSelectionTarotCard(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyCardTypesUnlocked()) {
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

    const unlockedTrinketTypes = getUnlockedTrinketTypes();
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
    const goldTrinketsUnlocked = isOtherAchievementUnlocked(
      OtherAchievementKind.GOLD_TRINKETS,
    );

    if (unlockedTrinketTypes.includes(normalizedTrinketType)) {
      return goldTrinketsUnlocked
        ? undefined
        : [PickupVariant.TRINKET, normalizedTrinketType];
    }

    const newTrinketType = getRandomArrayElement(unlockedTrinketTypes);
    const trinketTypeToUse = goldTrinketsUnlocked
      ? getGoldenTrinketType(newTrinketType)
      : newTrinketType;

    return [PickupVariant.TRINKET, trinketTypeToUse];
  }

  postPickupSelectionNormalTrinket(
    trinketType: TrinketType,
    unlockedTrinketTypes: TrinketType[],
  ): [PickupVariant, int] | undefined {
    if (unlockedTrinketTypes.includes(trinketType)) {
      return undefined;
    }

    const newTrinketType = getRandomArrayElement(unlockedTrinketTypes);
    return [PickupVariant.TRINKET, newTrinketType];
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.BED, // 380
  )
  postPickupSelectionBed(): [PickupVariant, int] | undefined {
    return isOtherAchievementUnlocked(OtherAchievementKind.BEDS)
      ? undefined
      : [PickupVariant.COIN, CoinSubType.PENNY];
  }
}
