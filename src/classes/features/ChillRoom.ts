import {
  BackdropType,
  CarpetSubType,
  EffectVariant,
  EntityType,
  GenericPropVariant,
  LevelCurse,
  LevelStage,
  ModCallback,
  StageType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  KColorDefault,
  ModCallbackCustom,
  ModFeature,
  fonts,
  game,
  getScreenBottomRightPos,
  goToStage,
  onChallenge,
  removeAllDoors,
  setBackdrop,
  spawnEffect,
  spawnNPC,
} from "isaacscript-common";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { mod } from "../../mod";
import { preventSaveAndQuit } from "../../utils";

const FONT = fonts.droid;

/** This does not extend from `RandomizerModFeature` because we want it to always apply. */
export class ChillRoom extends ModFeature {
  protected override shouldCallbackMethodsFire = (): boolean =>
    onChallenge(ChallengeCustom.RANDOMIZER_CHILL_ROOM);

  @Callback(ModCallback.POST_RENDER)
  postRender(): void {
    const text = "Randomizer Chill Room";
    const screenBottomRightPos = getScreenBottomRightPos();
    FONT.DrawString(text, 0, 33, KColorDefault, screenBottomRightPos.X, true);
  }

  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    preventSaveAndQuit();

    const hud = game.GetHUD();
    hud.SetVisible(false);

    const player = Isaac.GetPlayer();
    player.AddBombs(-1);

    const level = game.GetLevel();
    const stageType = level.GetStageType();
    if (stageType !== StageType.ORIGINAL) {
      goToStage(LevelStage.BASEMENT_1, StageType.ORIGINAL);
      mod.reorderedCallbacksSetStage(LevelStage.BASEMENT_1, StageType.ORIGINAL);
    }

    removeAllDoors();
    setBackdrop(BackdropType.ISAACS_BEDROOM);

    for (const gridIndex of [16, 46, 76, 106, 28, 58, 88, 118]) {
      spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, gridIndex);
    }

    spawnEffect(EffectVariant.CARPET, CarpetSubType.MOMS_CARPET_2, 67);

    for (const gridIndex of [108, 116]) {
      spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.COUCH, 0, gridIndex);
    }

    for (const gridIndex of [17, 27]) {
      spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.TV, 0, gridIndex);
    }
  }

  @Callback(ModCallback.POST_CURSE_EVAL)
  postCurseEval(): BitFlags<LevelCurse> | LevelCurse | undefined {
    return LevelCurse.NONE;
  }
}
