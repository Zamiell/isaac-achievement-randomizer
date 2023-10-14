import type { DamageFlag } from "isaac-typescript-definitions";
import {
  BossID,
  CollectibleType,
  EntityType,
  FallenVariant,
  LevelStage,
  LokiVariant,
  MinibossID,
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
  doesEntityExist,
  game,
  getBossID,
  getEntityTypeVariantFromBossID,
  getNPCs,
  getRoomListIndex,
  getRoomSubType,
  inBeastRoom,
  inBigRoom,
  isFirstPlayer,
  isSelfDamage,
  onAnyChallenge,
  onRepentanceStage,
} from "isaacscript-common";
import { BossIDCustom } from "../../enums/BossIDCustom";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import {
  getNumSecondsForBossObjective,
  getObjective,
} from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";
import { isBossObjectiveCompleted } from "./achievementTracker/completedObjectives";

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
  BossID.ULTRA_GREED, // 62
  BossID.HUSH, // 63
  BossID.DELIRIUM, // 70
  BossID.ULTRA_GREEDIER, // 71
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
    const bossID = getModifiedBossID();
    if (bossID === undefined) {
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

  // 27, 271
  @Callback(ModCallback.POST_NPC_INIT, EntityType.URIEL)
  postNPCInitUriel(): void {
    const room = game.GetRoom();
    v.room.tookDamageRoomFrame = room.GetFrameCount();
  }

  // 27, 272
  @Callback(ModCallback.POST_NPC_INIT, EntityType.GABRIEL)
  postNPCInitGabriel(): void {
    const room = game.GetRoom();
    v.room.tookDamageRoomFrame = room.GetFrameCount();
  }

  // 34, 370
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.TROPHY)
  postPickupInitTrophy(): void {
    const challenge = Isaac.GetChallenge();
    const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
    addObjective(objective);
  }

  // 68, 71
  @Callback(ModCallback.POST_ENTITY_KILL, EntityType.FISTULA_BIG)
  postEntityKillFistulaBig(): void {
    const room = game.GetRoom();
    v.room.tookDamageRoomFrame = room.GetFrameCount();
  }

  // 70
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    objectiveDetectionPreSpawnClearAward();
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

export function objectiveDetectionPreSpawnClearAward(): void {
  const room = game.GetRoom();
  const roomType = room.GetType();
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  switch (roomType) {
    // 5
    case RoomType.BOSS: {
      // Handle XL floors.
      const level = game.GetLevel();
      const lastBossRoomListIndex = level.GetLastBossRoomListIndex();
      const roomListIndex = getRoomListIndex();
      if (roomListIndex !== lastBossRoomListIndex) {
        return;
      }

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
 * Returns undefined if the player does not need the corresponding boss objective or if the current
 * situation is invalid for the objective.
 */
export function getSecondsSinceLastDamage(): int | undefined {
  const bossID = getModifiedBossID();
  if (bossID === undefined) {
    return undefined;
  }

  if (isBossObjectiveCompleted(bossID)) {
    return undefined;
  }

  const room = game.GetRoom();
  const isClear = room.IsClear();
  if (isClear) {
    return undefined;
  }

  if (onAnyChallenge()) {
    return undefined;
  }

  if (inBigRoom() && !BOSSES_IN_BIG_ROOMS_SET.has(bossID)) {
    return undefined;
  }

  if (v.room.usedPause) {
    return undefined;
  }

  // Boss-specific checks.
  switch (bossID) {
    // 24
    case BossID.SATAN: {
      if (onFirstPhaseOfSatan()) {
        return undefined;
      }

      break;
    }

    // 39, 40
    case BossID.ISAAC:
    case BossID.BLUE_BABY: {
      if (v.room.onFirstPhaseOfIsaac) {
        return undefined;
      }

      break;
    }

    // 63
    case BossID.HUSH: {
      if (v.room.onFirstPhaseOfHush) {
        return undefined;
      }

      break;
    }

    default: {
      break;
    }
  }

  // Verify the boss is alive.
  switch (bossID) {
    // 18, 33
    case BossID.FISTULA:
    case BossID.TERATOMA: {
      const bigPieces = getNPCs(EntityType.FISTULA_BIG, -1, -1, true);
      const mediumPieces = getNPCs(EntityType.FISTULA_MEDIUM, -1, -1, true);
      const smallPieces = getNPCs(EntityType.FISTULA_SMALL, -1, -1, true);
      const pieces = [...bigPieces, ...mediumPieces, ...smallPieces];
      const aliveBosses = pieces.filter((boss) => !boss.IsDead());

      if (aliveBosses.length < 4) {
        return;
      }

      break;
    }

    // 31
    case BossID.LOKII: {
      const lokiis = getNPCs(EntityType.LOKI, LokiVariant.LOKII, -1, true);
      const aliveBosses = lokiis.filter((boss) => !boss.IsDead());

      if (aliveBosses.length < 2) {
        return;
      }

      break;
    }

    // 68
    case BossID.SISTERS_VIS: {
      const sistersVis = getNPCs(EntityType.SISTERS_VIS, -1, -1, true);
      const aliveBosses = sistersVis.filter((boss) => !boss.IsDead());

      if (aliveBosses.length < 2) {
        return;
      }

      break;
    }

    case BossIDCustom.KRAMPUS: {
      const krampuses = getNPCs(
        EntityType.FALLEN,
        FallenVariant.KRAMPUS,
        -1,
        true,
      );
      const aliveBosses = krampuses.filter((boss) => !boss.IsDead());

      if (aliveBosses.length === 0) {
        return;
      }

      break;
    }

    case BossIDCustom.URIEL: {
      const uriels = getNPCs(EntityType.URIEL, -1, -1, true);
      const aliveBosses = uriels.filter((boss) => !boss.IsDead());

      if (aliveBosses.length === 0) {
        return;
      }

      break;
    }

    case BossIDCustom.GABRIEL: {
      const gabriels = getNPCs(EntityType.GABRIEL, -1, -1, true);
      const aliveBosses = gabriels.filter((boss) => !boss.IsDead());

      if (aliveBosses.length === 0) {
        return;
      }

      break;
    }

    default: {
      const [entityType, variant] = getEntityTypeVariantFromBossID(bossID);
      const bosses = getNPCs(entityType, variant, -1, true);
      const aliveBosses = bosses.filter((boss) => !boss.IsDead());

      if (aliveBosses.length === 0) {
        return;
      }

      break;
    }
  }

  const roomFrameCount = room.GetFrameCount();
  const elapsedGameFrames = roomFrameCount - v.room.tookDamageRoomFrame;

  return elapsedGameFrames / GAME_FRAMES_PER_SECOND;
}

function onFirstPhaseOfSatan(): boolean {
  const satans = getNPCs(EntityType.SATAN);
  if (satans.length === 0) {
    return false;
  }

  return satans.every((satan) => satan.State === NPCState.IDLE);
}

export function getCharacterObjectiveKindNoHit():
  | CharacterObjectiveKind
  | undefined {
  if (onAnyChallenge()) {
    return undefined;
  }

  const repentanceStage = onRepentanceStage();
  const stageToCharacterObjectiveKind = repentanceStage
    ? STAGE_TO_CHARACTER_OBJECTIVE_KIND_REPENTANCE
    : STAGE_TO_CHARACTER_OBJECTIVE_KIND;

  const level = game.GetLevel();
  const stage = level.GetStage();

  return stageToCharacterObjectiveKind.get(stage);
}

export function getModifiedBossID(): BossID | undefined {
  const room = game.GetRoom();
  const roomType = room.GetType();

  switch (roomType) {
    // 6
    case RoomType.MINI_BOSS: {
      const roomSubType = getRoomSubType();

      switch (roomSubType) {
        case MinibossID.KRAMPUS: {
          return BossIDCustom.KRAMPUS;
        }

        default: {
          return undefined;
        }
      }
    }

    // 15
    case RoomType.ANGEL: {
      if (doesEntityExist(EntityType.URIEL)) {
        return BossIDCustom.URIEL;
      }

      if (doesEntityExist(EntityType.GABRIEL)) {
        return BossIDCustom.GABRIEL;
      }

      break;
    }

    default: {
      break;
    }
  }

  return getBossID();
}
