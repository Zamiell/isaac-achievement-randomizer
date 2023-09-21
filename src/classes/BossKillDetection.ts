import { BossID, ModCallback, RoomType } from "isaac-typescript-definitions";
import {
  Callback,
  ModFeature,
  ReadonlyMap,
  game,
  getRoomSubType,
  inBeastRoom,
} from "isaacscript-common";
import { CharacterObjective } from "../enums/CharacterObjective";
import { isRandomizerEnabled } from "./AchievementTracker";

const CHARACTER_OBJECTIVE_TO_BOSS_ID = new ReadonlyMap<
  BossID,
  CharacterObjective
>([
  [BossID.MOM, CharacterObjective.MOM],
  [BossID.IT_LIVES, CharacterObjective.IT_LIVES],
  [BossID.ISAAC, CharacterObjective.ISAAC],
  [BossID.BLUE_BABY, CharacterObjective.BLUE_BABY],
  [BossID.SATAN, CharacterObjective.SATAN],
  [BossID.THE_LAMB, CharacterObjective.THE_LAMB],
  [BossID.MEGA_SATAN, CharacterObjective.MEGA_SATAN],
  // There is no Boss ID for the Boss Rush.
  [BossID.HUSH, CharacterObjective.HUSH],
  [BossID.ULTRA_GREED, CharacterObjective.ULTRA_GREED],
  [BossID.DELIRIUM, CharacterObjective.DELIRIUM],
  [BossID.MOTHER, CharacterObjective.MOTHER],
  // The Beast does not have its own boss room.
]);

export class BossKillDetection extends ModFeature {
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    if (!isRandomizerEnabled()) {
      return;
    }

    const room = game.GetRoom();
    const roomType = room.GetType();

    switch (roomType) {
      // 5
      case RoomType.BOSS: {
        const bossID = getRoomSubType() as BossID;
        const characterObjective = CHARACTER_OBJECTIVE_TO_BOSS_ID.get(bossID);
        if (characterObjective !== undefined) {
          this.accomplishedObjective(characterObjective);
        }

        break;
      }

      // 16
      case RoomType.DUNGEON: {
        if (inBeastRoom()) {
          this.accomplishedObjective(CharacterObjective.THE_BEAST);
        }

        break;
      }

      // 17
      case RoomType.BOSS_RUSH: {
        this.accomplishedObjective(CharacterObjective.BOSS_RUSH);
        break;
      }

      default: {
        break;
      }
    }

    return undefined;
  }

  accomplishedObjective(_characterObjective: CharacterObjective): void {
    const player = Isaac.GetPlayer();
    const _character = player.GetPlayerType();
    // TODO
  }
}
