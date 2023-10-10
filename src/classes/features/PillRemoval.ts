import type { PillColor, PillEffect } from "isaac-typescript-definitions";
import {
  CoinSubType,
  ModCallback,
  PickupVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  FIRST_PILL_COLOR,
  ModCallbackCustom,
  game,
  getNormalPillColorFromHorse,
  getRandomArrayElement,
  isGoldPill,
  isHorsePill,
  shuffleArray,
} from "isaacscript-common";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  anyPillEffectsUnlocked,
  getUnlockedPillEffects,
  isOtherUnlockKindUnlocked,
} from "./achievementTracker/completedUnlocks";

const v = {
  run: {
    pillPool: new Map<PillColor, PillEffect>(),
  },
};

/** We lazy-init a custom pill pool for every run (unless every pill effect is already unlocked.) */
export class PillRemoval extends RandomizerModFeature {
  v = v;

  // 64
  @Callback(ModCallback.GET_PILL_COLOR)
  getPillColor(seed: Seed): PillColor | undefined {
    if (!anyPillEffectsUnlocked(true)) {
      return undefined;
    }

    if (v.run.pillPool.size === 0) {
      this.initPillPool();
    }

    const pillColors = [...v.run.pillPool.keys()];
    return getRandomArrayElement(pillColors, seed);
  }

  initPillPool(): void {
    const unlockedPillEffects = getUnlockedPillEffects();
    const seeds = game.GetSeeds();
    const startSeed = seeds.GetStartSeed();
    const pillEffectsForRun = shuffleArray(unlockedPillEffects, startSeed);

    let pillColor = FIRST_PILL_COLOR;
    for (const pillEffect of pillEffectsForRun) {
      v.run.pillPool.set(pillColor, pillEffect);
      pillColor++; // eslint-disable-line isaacscript/strict-enums
    }
  }

  // 65
  @Callback(ModCallback.GET_PILL_EFFECT)
  getPillEffect(
    _pillEffect: PillEffect,
    pillColor: PillColor,
  ): PillEffect | undefined {
    return v.run.pillPool.get(pillColor);
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.PILL, // 70
  )
  postPickupSelectionPill(
    _pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [PickupVariant, int] | undefined {
    if (!anyPillEffectsUnlocked(true)) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    const pillColor = subType as PillColor;

    if (
      isGoldPill(pillColor) &&
      !isOtherUnlockKindUnlocked(OtherUnlockKind.GOLD_PILLS, true)
    ) {
      return [PickupVariant.PILL, FIRST_PILL_COLOR];
    }

    if (
      isHorsePill(pillColor) &&
      !isOtherUnlockKindUnlocked(OtherUnlockKind.HORSE_PILLS, true)
    ) {
      const normalPillColor = getNormalPillColorFromHorse(pillColor);
      return [PickupVariant.PILL, normalPillColor];
    }

    return undefined;
  }
}
