import type { CollectibleType } from "isaac-typescript-definitions";

export function isRacingPlusEnabled(): boolean {
  const checkpoint = Isaac.GetItemIdByName("Checkpoint") as
    | CollectibleType
    | -1;
  return checkpoint !== -1;
}
