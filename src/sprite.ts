import type { CollectibleType } from "isaac-typescript-definitions";
import { newSprite } from "isaacscript-common";

/** From Racing+. */
export function newGlowingCollectibleSprite(
  collectibleType: CollectibleType,
): Sprite {
  return newGlowingItemSprite(collectibleType);
}

function newGlowingItemSprite(itemID: int): Sprite {
  const directory = "items-glowing";
  const filename = `collectibles_${itemID}.png`;

  return newSprite("gfx/glowing_item.anm2", `gfx/${directory}/${filename}`);
}
