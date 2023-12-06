import type { DamageFlag } from "isaac-typescript-definitions";
import {
  Difficulty,
  Dimension,
  LevelCurse,
  LevelStage,
  ModCallback,
  RoomType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  ReadonlyMap,
  asLevelStage,
  game,
  hasCurse,
  inDimension,
  inGrid,
  isAllRoomsClear,
  isFirstPlayer,
  isSelfDamage,
  onAnyChallenge,
  onRepentanceStage,
} from "isaacscript-common";
import { CharacterObjectiveKind } from "../../enums/CharacterObjectiveKind";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { getObjective } from "../../types/Objective";
import { getAdjustedCharacterForObjective } from "../../utils";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";

const ROOM_TYPES_FOR_FULL_CLEAR = [
  RoomType.DEFAULT, // 1
  RoomType.BOSS, // 5
  RoomType.MINI_BOSS, // 6
] as const;

const STAGE_TO_CHARACTER_OBJECTIVE_KIND = new ReadonlyMap([
  [LevelStage.BASEMENT_1, CharacterObjectiveKind.NO_HIT_BASEMENT],
  [LevelStage.BASEMENT_2, CharacterObjectiveKind.NO_HIT_BASEMENT],
  [LevelStage.CAVES_1, CharacterObjectiveKind.NO_HIT_CAVES],
  [LevelStage.CAVES_2, CharacterObjectiveKind.NO_HIT_CAVES],
  [LevelStage.DEPTHS_1, CharacterObjectiveKind.NO_HIT_DEPTHS],
  [LevelStage.DEPTHS_2, CharacterObjectiveKind.NO_HIT_DEPTHS],
  [LevelStage.WOMB_1, CharacterObjectiveKind.NO_HIT_WOMB],
  [LevelStage.WOMB_2, CharacterObjectiveKind.NO_HIT_WOMB],
]);

const v = {
  run: {
    tookHitStages: new Set<LevelStage>(),
    fullClearedStages: new Set<LevelStage>(),
  },
};

export class ChapterObjectiveDetection extends RandomizerModFeature {
  v = v;

  // 70
  @Callback(ModCallback.PRE_SPAWN_CLEAR_AWARD)
  preSpawnClearAward(): boolean | undefined {
    chapterObjectiveDetectionPreSpawnClearAward();
    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.ENTITY_TAKE_DMG_PLAYER)
  entityTakeDmgPlayer(
    player: EntityPlayer,
    _amount: float,
    damageFlags: BitFlags<DamageFlag>,
  ): boolean | undefined {
    if (onRepentanceStage()) {
      return undefined;
    }

    if (!isFirstPlayer(player) || isSelfDamage(damageFlags)) {
      return undefined;
    }

    const level = game.GetLevel();
    const stage = level.GetStage();
    v.run.tookHitStages.add(stage);

    return undefined;
  }

  @CallbackCustom(ModCallbackCustom.POST_HOLY_MANTLE_REMOVED)
  postHolyMantleRemoved(player: EntityPlayer): void {
    if (onRepentanceStage()) {
      return;
    }

    if (!isFirstPlayer(player)) {
      return;
    }

    const level = game.GetLevel();
    const stage = level.GetStage();
    v.run.tookHitStages.add(stage);
  }

  /**
   * If the final room explored on a floor is empty, then it will not get set to being cleared until
   * the player enters it, and then the `PRE_SPAWN_CLEAR_AWARD` callback will never be fired. Thus,
   * we have to also check on every room enter.
   */
  @CallbackCustom(ModCallbackCustom.POST_NEW_ROOM_REORDERED)
  postNewRoomReordered(): void {
    chapterObjectiveDetectionPreSpawnClearAward();
  }
}

export function chapterObjectiveDetectionPreSpawnClearAward(): void {
  checkAllRoomsClear();
  checkAllChapterCompleted();
}

function checkAllRoomsClear() {
  const level = game.GetLevel();
  const stage = level.GetStage();

  if (
    !v.run.fullClearedStages.has(stage) &&
    isAllRoomsClear(ROOM_TYPES_FOR_FULL_CLEAR) &&
    inGrid() &&
    inDimension(Dimension.MAIN) &&
    !onRepentanceStage()
  ) {
    v.run.fullClearedStages.add(stage);

    if (hasCurse(LevelCurse.LABYRINTH)) {
      const nextStage = asLevelStage(stage + 1);
      v.run.fullClearedStages.add(nextStage);
    }
  }
}

function checkAllChapterCompleted() {
  checkChapterCompleted(
    LevelStage.BASEMENT_1,
    LevelStage.BASEMENT_2,
    CharacterObjectiveKind.NO_HIT_BASEMENT,
  );
  checkChapterCompleted(
    LevelStage.CAVES_1,
    LevelStage.CAVES_2,
    CharacterObjectiveKind.NO_HIT_CAVES,
  );
  checkChapterCompleted(
    LevelStage.DEPTHS_1,
    LevelStage.DEPTHS_2,
    CharacterObjectiveKind.NO_HIT_DEPTHS,
  );
  checkChapterCompleted(
    LevelStage.WOMB_1,
    LevelStage.WOMB_2,
    CharacterObjectiveKind.NO_HIT_WOMB,
  );
}

function checkChapterCompleted(
  stage1: LevelStage,
  stage2: LevelStage,
  kind: CharacterObjectiveKind,
) {
  const player = Isaac.GetPlayer();
  const character = getAdjustedCharacterForObjective(player);

  if (
    !v.run.tookHitStages.has(stage1) &&
    !v.run.tookHitStages.has(stage2) &&
    v.run.fullClearedStages.has(stage1) &&
    v.run.fullClearedStages.has(stage2) &&
    (game.Difficulty === Difficulty.NORMAL ||
      game.Difficulty === Difficulty.HARD) &&
    !onAnyChallenge()
  ) {
    const objective = getObjective(
      ObjectiveType.CHARACTER,
      character,
      kind,
      game.Difficulty,
    );
    addObjective(objective);
  }
}

export function getCharacterObjectiveKindNoHit():
  | CharacterObjectiveKind
  | undefined {
  if (onRepentanceStage() || onAnyChallenge()) {
    return undefined;
  }

  const level = game.GetLevel();
  const stage = level.GetStage();

  return STAGE_TO_CHARACTER_OBJECTIVE_KIND.get(stage);
}

export function hasTakenHitOnChapter(): boolean {
  const kind = getCharacterObjectiveKindNoHit();
  if (kind === undefined) {
    return false;
  }

  const level = game.GetLevel();
  const stage = level.GetStage();

  switch (stage) {
    case LevelStage.BASEMENT_1:
    case LevelStage.BASEMENT_2: {
      return (
        v.run.tookHitStages.has(LevelStage.BASEMENT_1) ||
        v.run.tookHitStages.has(LevelStage.BASEMENT_2)
      );
    }

    case LevelStage.CAVES_1:
    case LevelStage.CAVES_2: {
      return (
        v.run.tookHitStages.has(LevelStage.CAVES_1) ||
        v.run.tookHitStages.has(LevelStage.CAVES_2)
      );
    }

    case LevelStage.DEPTHS_1:
    case LevelStage.DEPTHS_2: {
      return (
        v.run.tookHitStages.has(LevelStage.DEPTHS_1) ||
        v.run.tookHitStages.has(LevelStage.DEPTHS_2)
      );
    }

    case LevelStage.WOMB_1:
    case LevelStage.WOMB_2: {
      return (
        v.run.tookHitStages.has(LevelStage.WOMB_1) ||
        v.run.tookHitStages.has(LevelStage.WOMB_2)
      );
    }

    default: {
      return false;
    }
  }
}
