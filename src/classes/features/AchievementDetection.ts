import type { DamageFlag } from "isaac-typescript-definitions";
import {
  BossID,
  LevelStage,
  ModCallback,
  PickupVariant,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  GAME_FRAMES_PER_SECOND,
  ModCallbackCustom,
  ReadonlyMap,
  game,
  getRoomSubType,
  inBeastRoom,
  isFirstPlayer,
  isSelfDamage,
  onRepentanceStage,
} from "isaacscript-common";
import { NUM_MINUTES_FOR_BOSS_OBJECTIVE } from "../../constants";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  addObjectiveBoss,
  addObjectiveChallenge,
  addObjectiveCharacter,
  isBossObjectiveCompleted,
} from "./AchievementTracker";

const BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND = new ReadonlyMap<
  BossID,
  CharacterObjectiveKind
>([
  [BossID.MOM, CharacterObjectiveKind.MOM],
  [BossID.IT_LIVES, CharacterObjectiveKind.IT_LIVES],
  [BossID.ISAAC, CharacterObjectiveKind.ISAAC],
  [BossID.BLUE_BABY, CharacterObjectiveKind.BLUE_BABY],
  [BossID.SATAN, CharacterObjectiveKind.SATAN],
  [BossID.LAMB, CharacterObjectiveKind.THE_LAMB],
  [BossID.MEGA_SATAN, CharacterObjectiveKind.MEGA_SATAN],
  // There is no boss ID for the Boss Rush (it has a separate room type).
  [BossID.HUSH, CharacterObjectiveKind.HUSH],
  [BossID.DELIRIUM, CharacterObjectiveKind.DELIRIUM],
  [BossID.MOTHER, CharacterObjectiveKind.MOTHER],
  // There is no boss ID for The Beast (it does not have its own boss room).
  [BossID.ULTRA_GREED, CharacterObjectiveKind.ULTRA_GREED],
]);

const STAGE_TO_CHARACTER_OBJECTIVE_KIND = new ReadonlyMap<
  LevelStage,
  CharacterObjectiveKind
>([
  [LevelStage.BASEMENT_1, CharacterObjectiveKind.NO_HIT_BASEMENT_1],
  [LevelStage.BASEMENT_2, CharacterObjectiveKind.NO_HIT_BASEMENT_2],
  [LevelStage.CAVES_1, CharacterObjectiveKind.NO_HIT_CAVES_1],
  [LevelStage.CAVES_2, CharacterObjectiveKind.NO_HIT_CAVES_2],
  [LevelStage.DEPTHS_1, CharacterObjectiveKind.NO_HIT_DEPTHS_1],
  [LevelStage.DEPTHS_2, CharacterObjectiveKind.NO_HIT_DEPTHS_2],
  [LevelStage.WOMB_1, CharacterObjectiveKind.NO_HIT_WOMB_1],
  [LevelStage.WOMB_2, CharacterObjectiveKind.NO_HIT_WOMB_2],
  [LevelStage.SHEOL_CATHEDRAL, CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL],
  [LevelStage.DARK_ROOM_CHEST, CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST],
]);

const STAGE_TO_CHARACTER_OBJECTIVE_KIND_REPENTANCE = new ReadonlyMap<
  LevelStage,
  CharacterObjectiveKind
>([
  [LevelStage.BASEMENT_1, CharacterObjectiveKind.NO_HIT_DOWNPOUR_1],
  [LevelStage.BASEMENT_2, CharacterObjectiveKind.NO_HIT_DOWNPOUR_2],
  [LevelStage.CAVES_1, CharacterObjectiveKind.NO_HIT_MINES_1],
  [LevelStage.CAVES_2, CharacterObjectiveKind.NO_HIT_MINES_2],
  [LevelStage.DEPTHS_1, CharacterObjectiveKind.NO_HIT_MAUSOLEUM_1],
  [LevelStage.DEPTHS_2, CharacterObjectiveKind.NO_HIT_MAUSOLEUM_2],
  [LevelStage.WOMB_1, CharacterObjectiveKind.NO_HIT_CORPSE_1],
  [LevelStage.WOMB_2, CharacterObjectiveKind.NO_HIT_CORPSE_2],
]);

const v = {
  level: {
    tookHit: false,
  },

  room: {
    tookDamageRoomFrame: 0,
  },
};

export class AchievementDetection extends RandomizerModFeature {
  v = v;

  @Callback(ModCallback.POST_UPDATE)
  postUpdate(): void {
    const room = game.GetRoom();
    const bossID = room.GetBossID();
    if (bossID === 0) {
      return;
    }

    if (isBossObjectiveCompleted(bossID)) {
      return;
    }

    const seconds = getSecondsSinceLastDamage();
    if (seconds >= NUM_MINUTES_FOR_BOSS_OBJECTIVE * 60) {
      addObjectiveBoss(bossID);
    }
  }

  // 34, 370
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.TROPHY)
  postPickupInitTrophy(): void {
    const challenge = Isaac.GetChallenge();
    addObjectiveChallenge(challenge);
  }

  // 70
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    achievementDetectionPostRoomCleared();
    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.ENTITY_TAKE_DMG_PLAYER)
  entityTakeDmgPlayer(
    player: EntityPlayer,
    _amount: float,
    damageFlags: BitFlags<DamageFlag>,
  ): boolean | undefined {
    if (!isFirstPlayer(player)) {
      return undefined;
    }

    if (isSelfDamage(damageFlags)) {
      return undefined;
    }

    const room = game.GetRoom();

    v.level.tookHit = true;
    v.room.tookDamageRoomFrame = room.GetFrameCount();

    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_HOLY_MANTLE_REMOVED)
  postHolyMantleRemoved(player: EntityPlayer): void {
    if (!isFirstPlayer(player)) {
      return;
    }

    const room = game.GetRoom();

    v.level.tookHit = true;
    v.room.tookDamageRoomFrame = room.GetFrameCount();
  }
}

export function achievementDetectionPostRoomCleared(): void {
  const room = game.GetRoom();
  const roomType = room.GetType();
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  switch (roomType) {
    // 5
    case RoomType.BOSS: {
      const bossID = getRoomSubType() as BossID;
      const characterObjectiveKindBoss =
        BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND.get(bossID);
      if (characterObjectiveKindBoss !== undefined) {
        addObjectiveCharacter(character, characterObjectiveKindBoss);
      }

      if (!v.level.tookHit) {
        const characterObjectiveKindNoDamage =
          getCharacterObjectiveKindNoDamage();
        if (characterObjectiveKindNoDamage !== undefined) {
          addObjectiveCharacter(character, characterObjectiveKindNoDamage);
        }
      }

      break;
    }

    // 16
    case RoomType.DUNGEON: {
      if (inBeastRoom()) {
        addObjectiveCharacter(character, CharacterObjectiveKind.THE_BEAST);
      }

      break;
    }

    // 17
    case RoomType.BOSS_RUSH: {
      addObjectiveCharacter(character, CharacterObjectiveKind.BOSS_RUSH);
      break;
    }

    default: {
      break;
    }
  }
}

export function hasTakenHitOnFloor(): boolean {
  return v.level.tookHit;
}

export function getSecondsSinceLastDamage(): int {
  const room = game.GetRoom();
  const roomFrameCount = room.GetFrameCount();
  const elapsedGameFrames = roomFrameCount - v.room.tookDamageRoomFrame;

  return elapsedGameFrames / GAME_FRAMES_PER_SECOND;
}

export function getCharacterObjectiveKindNoDamage():
  | CharacterObjectiveKind
  | undefined {
  const repentanceStage = onRepentanceStage();
  const stageToCharacterObjectiveKind = repentanceStage
    ? STAGE_TO_CHARACTER_OBJECTIVE_KIND_REPENTANCE
    : STAGE_TO_CHARACTER_OBJECTIVE_KIND;

  const level = game.GetLevel();
  const stage = level.GetStage();

  return stageToCharacterObjectiveKind.get(stage);
}
