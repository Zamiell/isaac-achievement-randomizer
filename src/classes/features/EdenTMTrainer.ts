import { CollectibleType, PlayerType } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  game,
  getCollectibleName,
  getRandomSetElement,
  isCharacter,
  log,
} from "isaacscript-common";
import { mod } from "../../mod";
import { RandomizerModFeature } from "../RandomizerModFeature";

/**
 * For testing purposes, "HK1T 68P3" is a seed where Eden starts with TMTrainer (on both normal mode
 * and hard mode).
 */
export class EdenTMTrainer extends RandomizerModFeature {
  @CallbackCustom(ModCallbackCustom.POST_PLAYER_INIT_FIRST)
  postPlayerInit(player: EntityPlayer): void {
    if (
      !isCharacter(player, PlayerType.EDEN) ||
      !player.HasCollectible(CollectibleType.TMTRAINER)
    ) {
      return;
    }

    // When Eden starts with TMTrainer, it does not replace the active item, because that is given
    // first. Thus, we only have to worry about getting a new passive item.
    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();
    const edenPassiveCollectibles = mod.getEdenPassiveCollectibles();
    const randomPassiveCollectibleType = getRandomSetElement(
      edenPassiveCollectibles,
      startSeed,
      [CollectibleType.TMTRAINER],
    );

    player.RemoveCollectible(CollectibleType.TMTRAINER);
    player.AddCollectible(randomPassiveCollectibleType);

    const collectibleName = getCollectibleName(randomPassiveCollectibleType);
    log(
      `Eden started with TMTrainer, so it was replaced with: ${collectibleName} (${randomPassiveCollectibleType})`,
    );
  }
}
