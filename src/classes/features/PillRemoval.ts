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
  LAST_NORMAL_PILL_COLOR,
  ModCallbackCustom,
  game,
  getNormalPillColorFromHorse,
  getRandomArrayElement,
  getRandomSeed,
  isGoldPill,
  isHorsePill,
  shuffleArray,
} from "isaacscript-common";
import { OtherUnlockKind } from "../../enums/OtherUnlockKind";
import { RandomizerModFeature } from "../RandomizerModFeature";
import {
  anyPillEffectsUnlocked,
  getUnlockedPillEffects,
  isAllPillEffectsUnlocked,
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
    if (!anyPillEffectsUnlocked(true) || isAllPillEffectsUnlocked(true)) {
      return undefined;
    }

    // We lazy init the pill color to pill effect map.
    initPillPool();

    const pillColors = [...v.run.pillPool.keys()];
    return getRandomArrayElement(pillColors, seed);
  }

  // 65
  @Callback(ModCallback.GET_PILL_EFFECT)
  getPillEffect(
    _pillEffect: PillEffect,
    pillColor: PillColor,
  ): PillEffect | undefined {
    if (!anyPillEffectsUnlocked(true) || isAllPillEffectsUnlocked(true)) {
      return undefined;
    }

    // The pill color to pill effect map should already be initialized at this point, but we check
    // and initialize it just in case.
    initPillPool();

    return v.run.pillPool.get(pillColor);
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_SELECTION_FILTER,
    PickupVariant.PILL, // 70
  )
  postPickupSelectionPill(
    pickup: EntityPickup,
    _pickupVariant: PickupVariant,
    subType: int,
  ): [pickupVariant: PickupVariant, subType: int] | undefined {
    if (!anyPillEffectsUnlocked(true)) {
      return [PickupVariant.COIN, CoinSubType.PENNY];
    }

    if (isAllPillEffectsUnlocked(true)) {
      return undefined;
    }

    const pillColor = subType as PillColor;

    // In some situations (like when champions drop pills), the `GET_PILL_COLOR` callback will not
    // be called.
    initPillPool();

    const normalizedPillColor = getNormalPillColorFromHorse(pillColor);
    if (!v.run.pillPool.has(normalizedPillColor)) {
      const pillColors = [...v.run.pillPool.keys()];
      // The `InitSeed` is 0 when giant/small champions drop pills.
      const initSeed = pickup.InitSeed === 0 ? undefined : pickup.InitSeed;
      const dropSeed = pickup.DropSeed === 0 ? undefined : pickup.DropSeed;
      const seed = initSeed ?? dropSeed ?? getRandomSeed();
      const randomPillColor = getRandomArrayElement(pillColors, seed);

      return [PickupVariant.PILL, randomPillColor];
    }

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

function initPillPool() {
  if (v.run.pillPool.size > 0) {
    return;
  }

  const unlockedPillEffects = getUnlockedPillEffects(true);
  const seeds = game.GetSeeds();
  const startSeed = seeds.GetStartSeed();
  const pillEffectsForRun = shuffleArray(unlockedPillEffects, startSeed);

  let pillColor = FIRST_PILL_COLOR;
  for (const pillEffect of pillEffectsForRun) {
    v.run.pillPool.set(pillColor, pillEffect);
    pillColor++; // eslint-disable-line isaacscript/strict-enums

    if (pillColor > LAST_NORMAL_PILL_COLOR) {
      break;
    }
  }
}
