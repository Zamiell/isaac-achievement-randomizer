import type { PlayerType } from "isaac-typescript-definitions";
import {
  BossID,
  Difficulty,
  LevelStage,
  ModCallback,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  ReadonlyMap,
  game,
  getBossID,
  getMainCharacter,
  getRoomListIndex,
  inBeastRoom,
  inMegaSatanRoom,
  inRoomType,
  isStoryBossID,
  onStage,
} from "isaacscript-common";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { getObjective } from "../../types/Objective";
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
  [BossID.MOTHER, CharacterObjectiveKind.MOTHER],
  // There is no boss ID for The Beast (it does not have its own boss room).
  [BossID.ULTRA_GREED, CharacterObjectiveKind.ULTRA_GREED],
  [BossID.ULTRA_GREEDIER, CharacterObjectiveKind.ULTRA_GREED],
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
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();
  const mainCharacter = getMainCharacter(character);

  switch (game.Difficulty) {
    case Difficulty.NORMAL:
    case Difficulty.HARD: {
      preSpawnClearAwardNonGreedMode(mainCharacter, game.Difficulty);
      break;
    }

    case Difficulty.GREED:
    case Difficulty.GREEDIER: {
      preSpawnClearAwardGreedMode(mainCharacter, game.Difficulty);
      break;
    }
  }
}

function preSpawnClearAwardNonGreedMode(
  character: PlayerType,
  difficulty: Difficulty.NORMAL | Difficulty.HARD,
) {
  const room = game.GetRoom();
  const roomType = room.GetType();

  // Mega Satan has to be handled outside of the switch statement since its boss room is outside of
  // the grid.
  if (inMegaSatanRoom()) {
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      character,
      CharacterObjectiveKind.MEGA_SATAN,
      difficulty,
    );
    addObjective(objective);

    return;
  }

  switch (roomType) {
    // 5
    case RoomType.BOSS: {
      const bossID = getBossID();
      if (bossID === undefined) {
        return;
      }

      // Handle XL floors.
      if (
        // Mother is in a separate Boss Room from the one reported by the
        // `Level.GetLastBossRoomListIndex` method.
        bossID !== BossID.MOTHER &&
        // The Delirium Boss Room does not correspond to the value returned by the
        // `Level.GetLastBossRoomListIndex` method.
        bossID !== BossID.DELIRIUM
      ) {
        const level = game.GetLevel();
        const lastBossRoomListIndex = level.GetLastBossRoomListIndex();
        const roomListIndex = getRoomListIndex();
        if (roomListIndex !== lastBossRoomListIndex) {
          return;
        }
      }

      if (isStoryBossID(bossID)) {
        const kindBoss = BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND.get(bossID);
        if (kindBoss === undefined) {
          return;
        }

        const objective = getObjective(
          ObjectiveType.CHARACTER,
          character,
          kindBoss,
          difficulty,
        );
        addObjective(objective);
      } else {
        const objective = getObjective(ObjectiveType.BOSS, bossID);
        addObjective(objective);
      }

      break;
    }

    // 16
    case RoomType.DUNGEON: {
      if (inBeastRoom()) {
        const objective = getObjective(
          ObjectiveType.CHARACTER,
          character,
          CharacterObjectiveKind.BEAST,
          difficulty,
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
        difficulty,
      );
      addObjective(objective);
      break;
    }

    default: {
      break;
    }
  }
}

const ADJUSTED_GREED_MODE_DIFFICULTY = {
  [Difficulty.GREED]: Difficulty.NORMAL,
  [Difficulty.GREEDIER]: Difficulty.HARD,
} as const;

function preSpawnClearAwardGreedMode(
  character: PlayerType,
  difficulty: Difficulty.GREED | Difficulty.GREEDIER,
) {
  if (onStage(LevelStage.ULTRA_GREED_GREED_MODE) && inRoomType(RoomType.BOSS)) {
    const adjustedDifficulty = ADJUSTED_GREED_MODE_DIFFICULTY[difficulty];
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      character,
      CharacterObjectiveKind.ULTRA_GREED,
      adjustedDifficulty,
    );
    addObjective(objective);
  }
}
