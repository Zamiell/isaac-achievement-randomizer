import type { DamageFlag } from "isaac-typescript-definitions";
import {
  CollectibleType,
  ModCallback,
  PickupVariant,
  SeedEffect,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  game,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isNightmareMode, isRandomizerEnabled } from "./achievementTracker/v";

const HALF_HEART_AMOUNT = 1;
const FULL_HEART_AMOUNT = 2;

export class NightmareMode extends RandomizerModFeature {
  override shouldCallbackMethodsFire = (): boolean =>
    isRandomizerEnabled() && isNightmareMode();

  // 34
  @Callback(ModCallback.POST_PICKUP_INIT)
  postPickupInit(pickup: EntityPickup): void {
    this.checkChampionPickup(pickup);
  }

  checkChampionPickup(pickup: EntityPickup): void {
    if (pickup.SpawnerEntity === undefined) {
      return;
    }

    const npc = pickup.SpawnerEntity.ToNPC();
    if (npc === undefined || !npc.IsChampion()) {
      return;
    }

    if (pickup.Variant === PickupVariant.COLLECTIBLE) {
      return;
    }

    pickup.Remove();
  }

  // 34, 100
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.COLLECTIBLE)
  postPickupInitCollectible(pickup: EntityPickup): void {
    const collectible = pickup as EntityPickupCollectible;

    if (collectible.SubType === CollectibleType.BREAKFAST) {
      collectible.Remove();
    }
  }

  @CallbackCustom(ModCallbackCustom.ENTITY_TAKE_DMG_PLAYER)
  entityTakeDmgPlayer(
    player: EntityPlayer,
    amount: float,
    damageFlags: BitFlags<DamageFlag>,
    source: EntityRef,
    countdownFrames: int,
  ): boolean | undefined {
    if (amount === HALF_HEART_AMOUNT) {
      player.TakeDamage(
        FULL_HEART_AMOUNT,
        damageFlags,
        source,
        countdownFrames,
      );
      return false;
    }

    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const seeds = game.GetSeeds();
    seeds.AddSeedEffect(SeedEffect.ALL_CHAMPIONS);
  }
}
