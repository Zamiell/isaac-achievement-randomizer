import { ModCallback, PickupVariant } from "isaac-typescript-definitions";
import { Callback } from "isaacscript-common";
import { preventSaveAndQuit } from "../../utils";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class PreventRerun extends RandomizerModFeature {
  @Callback(ModCallback.POST_PICKUP_INIT, PickupVariant.BIG_CHEST)
  postPickupInitBigChest(): void {
    preventSaveAndQuit();
    Isaac.DebugString("GETTING HERE");
  }
}
