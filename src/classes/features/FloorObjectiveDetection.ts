import type { DamageFlag } from "isaac-typescript-definitions";
import {
  LevelStage,
  ModCallback,
  NullItemID,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  ReadonlyMap,
  anyPlayerHasNullEffect,
  game,
  inRoomType,
  isFirstPlayer,
  isSelfDamage,
  onAnyChallenge,
  onRepentanceStage,
} from "isaacscript-common";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { getObjective } from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";

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
};

export class FloorObjectiveDetection extends RandomizerModFeature {
  v = v;

  // 1
  @Callback(ModCallback.POST_UPDATE)
  postUpdate(): void {
    if (anyPlayerHasNullEffect(NullItemID.LOST_CURSE)) {
      v.level.tookHit = true;
    }
  }

  // 70
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    floorObjectiveDetectionPreSpawnClearAward();
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

    v.level.tookHit = true;
    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_HOLY_MANTLE_REMOVED)
  postHolyMantleRemoved(player: EntityPlayer): void {
    if (!isFirstPlayer(player)) {
      return;
    }

    v.level.tookHit = true;
  }
}

export function floorObjectiveDetectionPreSpawnClearAward(): void {
  const player = Isaac.GetPlayer();
  const character = player.GetPlayerType();

  if (inRoomType(RoomType.BOSS) && !v.level.tookHit) {
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

export function hasTakenHitOnFloor(): boolean {
  return v.level.tookHit;
}
