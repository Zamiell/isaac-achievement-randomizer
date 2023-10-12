import {
  CoinSubType,
  CollectibleType,
  EffectVariant,
  EntityType,
  ModCallback,
  PickupVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  anyPlayerHasCollectibleEffect,
  getCoins,
  getRoomData,
  logError,
  restart,
} from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { preForcedRestart } from "./StatsTracker";

/**
 * In addition to preventing saving and quitting, this feature also fixes crashes & softlocks in the
 * vanilla game.
 */
export class PreventSaveAndQuit extends RandomizerModFeature {
  // 1
  @Callback(ModCallback.POST_UPDATE)
  postUpdate(): void {
    this.fixMegaMushLuckyPennySoftlock();
  }

  /** @see https://github.com/UnderscoreKilburn/repentance-issues/issues/1881 */
  fixMegaMushLuckyPennySoftlock(): void {
    if (!anyPlayerHasCollectibleEffect(CollectibleType.MEGA_MUSH)) {
      return;
    }

    const luckyPennies = getCoins(CoinSubType.LUCKY_PENNY);
    for (const luckyPenny of luckyPennies) {
      luckyPenny.Morph(
        EntityType.PICKUP,
        PickupVariant.COIN,
        CoinSubType.PENNY,
      );
    }
  }

  /**
   * Prevent portals from Lil Portal crashing the game.
   *
   * @see https://bindingofisaacrebirth.fandom.com/wiki/Lil_Portal
   */
  @Callback(ModCallback.POST_EFFECT_INIT, EffectVariant.PORTAL_TELEPORT)
  postEffectInitPortalTeleport(effect: EntityEffect): void {
    // Only consider portals that lead to specific rooms.
    if (effect.SubType < 1000) {
      return;
    }

    const roomGridIndex = effect.SubType - 1000;
    const roomData = getRoomData(roomGridIndex);
    if (roomData === undefined) {
      // The destination room does not have data, so delete the portal.
      effect.Remove();
    }
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, true)
  postGameStartedReorderedTrue(): void {
    mod.runNextRenderFrame(() => {
      logError("Illegal save and quit detected. Restarting the run.");

      // The number of runs was incremented after the transition to the menu happened, so we must
      // prevent a second increment.
      preForcedRestart();

      restart();
    });
  }
}
