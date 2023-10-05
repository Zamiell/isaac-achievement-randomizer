import {
  BackdropType,
  CarpetSubType,
  EffectVariant,
  EntityType,
  GenericPropVariant,
  LevelCurse,
  LevelStage,
  ModCallback,
  SeedEffect,
  StageType,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  ModFeature,
  game,
  goToStage,
  removeAllDoors,
  setBackdrop,
  spawnEffect,
  spawnNPC,
} from "isaacscript-common";
import { ChallengeCustom } from "../../enums/ChallengeCustom";
import { mod } from "../../mod";

/** This does not extend from `RandomizerModFeature` because we want it to always apply. */
export class ChillRoom extends ModFeature {
  @CallbackCustom(ModCallbackCustom.POST_GAME_STARTED_REORDERED, false)
  postGameStartedReorderedFalse(): void {
    const challenge = Isaac.GetChallenge();
    if (challenge !== ChallengeCustom.RANDOMIZER_CHILL_ROOM) {
      return;
    }

    const seeds = game.GetSeeds();
    seeds.AddSeedEffect(SeedEffect.NO_HUD);

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

    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 16);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 46);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 76);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 106);

    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 28);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 58);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 88);
    spawnEffect(EffectVariant.CARPET, CarpetSubType.ISAACS_CARPET, 118);

    spawnEffect(EffectVariant.CARPET, CarpetSubType.MOMS_CARPET_2, 67);

    spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.COUCH, 0, 108);
    spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.COUCH, 0, 116);

    spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.TV, 0, 18);
    spawnNPC(EntityType.GENERIC_PROP, GenericPropVariant.TV, 0, 26);
  }

  @Callback(ModCallback.POST_CURSE_EVAL)
  postCurseEval(): BitFlags<LevelCurse> | LevelCurse | undefined {
    return LevelCurse.NONE;
  }
}
