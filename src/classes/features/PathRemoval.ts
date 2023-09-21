import {
  EffectVariant,
  LevelStage,
  ModCallback,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  DISTANCE_OF_GRID_TILE,
  ModCallbackCustom,
  getBlueWombDoor,
  getEffects,
  getRepentanceDoor,
  getVoidDoor,
  onRepentanceStage,
  onStage,
  removeDoor,
} from "isaacscript-common";
import { UnlockablePath } from "../../enums/UnlockablePath";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { isPathUnlocked } from "./AchievementTracker";

/** This feature handles removing all of the paths from the game that are not unlocked yet. */
export class PathRemoval extends RandomizerModFeature {
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    this.checkPathDoors();
    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    this.checkPathDoors();
  }

  checkPathDoors(): void {
    this.checkRepentanceDoor();
    this.checkBlueWombDoor();
    this.checkVoidDoor();
  }

  checkRepentanceDoor(): void {
    const repentanceDoor = getRepentanceDoor();
    if (repentanceDoor === undefined) {
      return;
    }

    // The only Repentance door on Depths 2 / Necropolis 2 / Dank Depths 2 is the Strange Door
    // leading to The Ascent.
    const unlockablePath =
      onStage(LevelStage.DEPTHS_2) && !onRepentanceStage()
        ? UnlockablePath.THE_ASCENT
        : UnlockablePath.REPENTANCE_FLOORS;

    if (!isPathUnlocked(unlockablePath)) {
      this.removeDoorAndSmoke(repentanceDoor);
    }
  }

  checkBlueWombDoor(): void {
    const blueWombDoor = getBlueWombDoor();
    if (blueWombDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.BLUE_WOMB)) {
      this.removeDoorAndSmoke(blueWombDoor);
    }
  }

  checkVoidDoor(): void {
    const voidDoor = getVoidDoor();
    if (voidDoor === undefined) {
      return;
    }

    if (!isPathUnlocked(UnlockablePath.THE_VOID)) {
      this.removeDoorAndSmoke(voidDoor);
    }
  }

  removeDoorAndSmoke(door: GridEntityDoor): void {
    removeDoor(door);

    // When the door is spawned, the game creates dust clouds.
    for (const effect of getEffects(EffectVariant.DUST_CLOUD)) {
      if (effect.Position.Distance(door.Position) < DISTANCE_OF_GRID_TILE) {
        effect.Visible = false;
      }
    }
  }
}
