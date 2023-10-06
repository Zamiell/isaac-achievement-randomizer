import {
  CoinSubType,
  CollectibleType,
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
  logError,
  restart,
} from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";

/**
 * In addition to preventing saving and quitting, this feature also fixes softlocks in the vanilla
 * game.
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

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, true)
  postGameStartedReorderedTrue(): void {
    mod.runNextRenderFrame(() => {
      logError("Illegal save and quit detected. Restarting the run.");
      /// preForcedRestart(); // TODO
      restart();
    });
  }
}
