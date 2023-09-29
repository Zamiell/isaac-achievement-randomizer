import { GridEntityType, TrapdoorVariant } from "isaac-typescript-definitions";
import {
  CallbackCustom,
  ModCallbackCustom,
  inMegaSatanRoom,
  isPostBossVoidPortal,
  removeGridEntity,
} from "isaacscript-common";
import { RandomizerModFeature } from "../RandomizerModFeature";

export class VoidPortalRemoval extends RandomizerModFeature {
  @CallbackCustom(
    ModCallbackCustom.POST_GRID_ENTITY_UPDATE,
    GridEntityType.TRAPDOOR,
    TrapdoorVariant.VOID_PORTAL,
  )
  postGridEntityUpdateVoidPortal(gridEntity: GridEntity): void {
    if (isPostBossVoidPortal(gridEntity) || inMegaSatanRoom()) {
      removeGridEntity(gridEntity, false);
    }
  }
}
