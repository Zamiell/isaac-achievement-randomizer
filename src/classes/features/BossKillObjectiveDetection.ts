import { BossID, ModCallback, RoomType } from "isaac-typescript-definitions";
import {
  Callback,
  ReadonlyMap,
  game,
  getRoomListIndex,
  inBeastRoom,
  inMegaSatanRoom,
} from "isaacscript-common";
import { getModifiedBossID } from "../../enums/BossIDCustom";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { getObjective } from "../../types/Objective";
import { getAdjustedCharacterForObjective } from "../../utils";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";

const BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND = new ReadonlyMap<
  BossID,
  CharacterObjectiveKind
>([
  [BossID.MOM, CharacterObjectiveKind.MOM],
  [BossID.IT_LIVES, CharacterObjectiveKind.IT_LIVES],
  [BossID.ISAAC, CharacterObjectiveKind.ISAAC],
  [BossID.BLUE_BABY, CharacterObjectiveKind.BLUE_BABY],
  [BossID.SATAN, CharacterObjectiveKind.SATAN],
  [BossID.LAMB, CharacterObjectiveKind.LAMB],
  [BossID.MEGA_SATAN, CharacterObjectiveKind.MEGA_SATAN],
  // There is no boss ID for the Boss Rush (it has a separate room type).
  [BossID.HUSH, CharacterObjectiveKind.HUSH],
  [BossID.DELIRIUM, CharacterObjectiveKind.DELIRIUM],
  [BossID.MOTHER, CharacterObjectiveKind.MOTHER],
  // There is no boss ID for The Beast (it does not have its own boss room).
  [BossID.ULTRA_GREED, CharacterObjectiveKind.ULTRA_GREED],
]);

/** This feature handles both the "killing boss" objectives and the "no hit floor" objectives. */
export class BossKillObjectiveDetection extends RandomizerModFeature {
  // 70
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    bossObjectiveDetectionPreSpawnClearAward();
    return undefined;
  }
}

export function bossObjectiveDetectionPreSpawnClearAward(): void {
  const room = game.GetRoom();
  const roomType = room.GetType();
  const player = Isaac.GetPlayer();
  const character = getAdjustedCharacterForObjective(player);

  // Mega Satan has to be handled outside of the switch statement since its boss room is outside of
  // the grid.
  if (inMegaSatanRoom()) {
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      character,
      CharacterObjectiveKind.MEGA_SATAN,
    );
    addObjective(objective);

    return;
  }

  switch (roomType) {
    // 5
    case RoomType.BOSS: {
      const bossID = getModifiedBossID();
      if (bossID === undefined) {
        return;
      }

      // Handle XL floors.
      if (bossID !== BossID.MOTHER) {
        const level = game.GetLevel();
        const lastBossRoomListIndex = level.GetLastBossRoomListIndex();
        const roomListIndex = getRoomListIndex();
        if (roomListIndex !== lastBossRoomListIndex) {
          return;
        }
      }

      const kindBoss = BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND.get(bossID);
      if (kindBoss === undefined) {
        return;
      }

      const objective = getObjective(
        ObjectiveType.CHARACTER,
        character,
        kindBoss,
      );
      addObjective(objective);

      break;
    }

    // 16
    case RoomType.DUNGEON: {
      if (inBeastRoom()) {
        const objective = getObjective(
          ObjectiveType.CHARACTER,
          character,
          CharacterObjectiveKind.BEAST,
        );
        addObjective(objective);
      }

      break;
    }

    // 17
    case RoomType.BOSS_RUSH: {
      const objective = getObjective(
        ObjectiveType.CHARACTER,
        character,
        CharacterObjectiveKind.BOSS_RUSH,
      );
      addObjective(objective);
      break;
    }

    default: {
      break;
    }
  }
}
