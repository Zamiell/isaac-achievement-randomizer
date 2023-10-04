import type { DamageFlag } from "isaac-typescript-definitions";
import {
  BossID,
  Challenge,
  CollectibleType,
  EntityType,
  LevelStage,
  ModCallback,
  NPCState,
  PickupVariant,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  GAME_FRAMES_PER_SECOND,
  ModCallbackCustom,
  ReadonlyMap,
  ReadonlySet,
  game,
  getBossID,
  getEntityTypeVariantFromBossID,
  getNPCs,
  getRoomSubType,
  inBeastRoom,
  inBigRoom,
  isFirstPlayer,
  isSelfDamage,
  onRepentanceStage,
} from "isaacscript-common";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import {
  getNumSecondsForBossObjective,
  getObjective,
} from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective, isBossObjectiveCompleted } from "./AchievementTracker";

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

const BOSSES_IN_BIG_ROOMS_SET = new ReadonlySet([
  BossID.MR_FRED, // 53
  BossID.MEGA_SATAN, // 55
  BossID.DELIRIUM, // 70
  BossID.TUFF_TWINS, // 80
  BossID.GREAT_GIDEON, // 83
  BossID.MOTHER, // 88
  BossID.SHELL, // 96
  BossID.DOGMA, // 99
]);

const v = {
  level: {
    tookHit: false,
  },

  room: {
    tookDamageRoomFrame: 0,
    usedPause: false,
    onFirstPhaseOfIsaac: true,
    onFirstPhaseOfHush: true,
  },
};

export class ObjectiveDetection extends RandomizerModFeature {
  v = v;

  // 0, 102
  @Callback(ModCallback.POST_NPC_UPDATE, EntityType.ISAAC)
  postNPCUpdateIsaac(npc: EntityNPC): void {
    // Isaac goes to `NPCState.SPECIAL` when transitioning from phase 1 to phase 2 and when
    // transitioning from phase 2 to phase 3.
    if (v.room.onFirstPhaseOfIsaac && npc.State === NPCState.SPECIAL) {
      v.room.onFirstPhaseOfIsaac = false;

      const room = game.GetRoom();
      v.room.tookDamageRoomFrame = room.GetFrameCount();
    }
  }

  // 0, 407
  @Callback(ModCallback.POST_NPC_UPDATE, EntityType.HUSH)
  postNPCUpdateHush(): void {
    if (v.room.onFirstPhaseOfHush) {
      v.room.onFirstPhaseOfHush = false;

      const room = game.GetRoom();
      v.room.tookDamageRoomFrame = room.GetFrameCount();
    }
  }

  // 1
  @Callback(ModCallback.POST_UPDATE)
  postUpdate(): void {
    this.checkBossNoHit();
  }

  checkBossNoHit(): void {
    const bossID = getBossID();
    if (bossID === 0) {
      return;
    }

    const seconds = getSecondsSinceLastDamage();
    if (seconds === undefined) {
      return;
    }

    const numSecondsForBossObjective = getNumSecondsForBossObjective(bossID);
    if (seconds >= numSecondsForBossObjective) {
      const objective = getObjective(ObjectiveType.BOSS, bossID);
      addObjective(objective);
    }
  }

  // 3, 478
  @Callback(ModCallback.POST_USE_ITEM, CollectibleType.PAUSE)
  postUseItemPause(): boolean | undefined {
    v.room.usedPause = true;
    return undefined;
  }

  // 34, 370
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.TROPHY)
  postPickupInitTrophy(): void {
    const challenge = Isaac.GetChallenge();
    const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
    addObjective(objective);
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
      const kindBoss = BOSS_ID_TO_CHARACTER_OBJECTIVE_KIND.get(bossID);
      if (kindBoss !== undefined) {
        const objective = getObjective(
          ObjectiveType.CHARACTER,
          character,
          kindBoss,
        );
        addObjective(objective);
      }

      if (!v.level.tookHit) {
        const kindNoHit = getCharacterObjectiveKindNoHit();
        if (kindNoHit !== undefined) {
          const objective = getObjective(
            ObjectiveType.CHARACTER,
            character,
            kindNoHit,
          );
          addObjective(objective);
        }
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

export function hasTakenHitOnFloor(): boolean {
  return v.level.tookHit;
}

/**
 * Returns undefined if the player does not need the corresponding boss objective for the current
 * room.
 */
export function getSecondsSinceLastDamage(): int | undefined {
  const room = game.GetRoom();
  const bossID = room.GetBossID();
  if (bossID === 0) {
    return undefined;
  }

  if (isBossObjectiveCompleted(bossID)) {
    return undefined;
  }

  const isClear = room.IsClear();
  if (isClear) {
    return undefined;
  }

  const challenge = Isaac.GetChallenge();
  if (challenge !== Challenge.NULL) {
    return;
  }

  if (inBigRoom() && !BOSSES_IN_BIG_ROOMS_SET.has(bossID)) {
    return undefined;
  }

  const [entityType, variant] = getEntityTypeVariantFromBossID(bossID);
  const bosses = getNPCs(entityType, variant, -1, true);
  const aliveBosses = bosses.filter((boss) => !boss.IsDead());
  if (aliveBosses.length === 0) {
    return;
  }

  if (
    v.room.usedPause ||
    onFirstPhaseOfIsaac(bossID) ||
    onFirstPhaseOfHush(bossID)
  ) {
    return undefined;
  }

  const roomFrameCount = room.GetFrameCount();
  const elapsedGameFrames = roomFrameCount - v.room.tookDamageRoomFrame;

  return elapsedGameFrames / GAME_FRAMES_PER_SECOND;
}

function onFirstPhaseOfIsaac(bossID: BossID): boolean {
  return (
    (bossID === BossID.ISAAC || bossID === BossID.BLUE_BABY) &&
    v.room.onFirstPhaseOfIsaac
  );
}

function onFirstPhaseOfHush(bossID: BossID): boolean {
  return bossID === BossID.HUSH && v.room.onFirstPhaseOfHush;
}

export function getCharacterObjectiveKindNoHit():
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
