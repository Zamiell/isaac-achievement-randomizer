import {
  CardType,
  ModCallback,
  PickupVariant,
} from "isaac-typescript-definitions";
import {
  Callback,
  CallbackCustom,
  ModCallbackCustom,
  getRandomArrayElement,
} from "isaacscript-common";
import { CardTypeCustom } from "../../enums/CardTypeCustom";
import type { Achievement } from "../../types/Achievement";
import { getObjectiveFromID } from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { showNewAchievement } from "./AchievementNotification";
import { OBJECTIVE_ACCESS_FUNCTIONS } from "./AchievementRandomizer";
import { isObjectiveCompleted } from "./achievementTracker/completedObjectives";
import { getObjectiveIDToUnlockIDMap } from "./achievementTracker/v";

export class RulesCard extends RandomizerModFeature {
  // 5
  @Callback(ModCallback.POST_USE_CARD, CardTypeCustom.RULES_CUSTOM)
  postUseCardRulesCustom(): void {
    showRandomAchievement();
  }

  @CallbackCustom(
    ModCallbackCustom.POST_PICKUP_INIT_FILTER,
    PickupVariant.CARD,
    CardType.RULES,
  )
  postPickupInitRules(pickup: EntityPickup): void {
    pickup.Morph(pickup.Type, pickup.Variant, CardTypeCustom.RULES_CUSTOM);
  }
}

export function showRandomAchievement(): void {
  const reachableUncompletedAchievements =
    getReachableUncompletedAchievements();
  const achievement = getRandomArrayElement(
    reachableUncompletedAchievements,
    undefined,
  );
  showNewAchievement(achievement);
}

function getReachableUncompletedAchievements(): readonly Achievement[] {
  const objectiveIDToUnlockIDMap = getObjectiveIDToUnlockIDMap();

  const reachableUncompletedAchievement: Achievement[] = [];

  for (const [objectiveID, unlockID] of objectiveIDToUnlockIDMap) {
    const objective = getObjectiveFromID(objectiveID);
    const canAccessObjectiveFunc = OBJECTIVE_ACCESS_FUNCTIONS[objective.type];
    if (!isObjectiveCompleted(objective) && canAccessObjectiveFunc(objective)) {
      const achievement: Achievement = {
        objectiveID,
        unlockID,
      };
      reachableUncompletedAchievement.push(achievement);
    }
  }

  return reachableUncompletedAchievement;
}
