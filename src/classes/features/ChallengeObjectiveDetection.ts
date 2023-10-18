import { ModCallback, PickupVariant } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { ObjectiveType } from "../../enums/ObjectiveType";
import { getObjective } from "../../types/Objective";
import { RandomizerModFeature } from "../RandomizerModFeature";
import { addObjective } from "./achievementTracker/addObjective";

export class ChallengeObjectiveDetection extends RandomizerModFeature {
  // 34, 370
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.TROPHY)
  postPickupInitTrophy(): void {
    const challenge = Isaac.GetChallenge();
    const objective = getObjective(ObjectiveType.CHALLENGE, challenge);
    addObjective(objective);
  }
}
