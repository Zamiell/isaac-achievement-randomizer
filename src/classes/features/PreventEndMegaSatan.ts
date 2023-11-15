import {
  EntityFlag,
  EntityType,
  ModCallback,
  PickupVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  addRoomClearCharges,
  game,
  log,
  onAnyChallenge,
  spawnPickup,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { bossObjectiveDetectionPreSpawnClearAward } from "./BossKillObjectiveDetection";

/**
 * There is a 50% chance after defeating Mega Satan that the game will trigger a cutscene and force
 * the player to leave the run. By simply setting the room to be cleared when Mega Satan 2 dies, the
 * game will never go on to make the 50% roll.
 */
export class PreventEndMegaSatan extends RandomizerModFeature {
  // 68, 275
  @Callback(ModCallback.POST_ENTITY_KILL, EntityType.MEGA_SATAN_2)
  postEntityKillMegaSatan2(entity: Entity): void {
    if (!entity.HasEntityFlags(EntityFlag.FRIENDLY) && !onAnyChallenge()) {
      this.emulateRoomClear();
    }
  }

  emulateRoomClear(): void {
    const room = game.GetRoom();
    room.SetClear(true);
    addRoomClearCharges();
    log("Manually set the room to be clear after Mega Satan 2 died.");

    const centerPos = room.GetCenterPos();
    spawnPickup(PickupVariant.BIG_CHEST, 0, centerPos);

    bossObjectiveDetectionPreSpawnClearAward();
  }
}
