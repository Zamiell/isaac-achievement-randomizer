import { BossID } from "isaac-typescript-definitions";
import { isStoryBossID } from "isaacscript-common";
import { BOSS_ID_VALUES } from "../cachedEnumValues";

/** This has a length of 84 in Repentance. */
export const NON_STORY_BOSSES: readonly BossID[] = BOSS_ID_VALUES.filter(
  (bossID) => !isStoryBossID(bossID) && bossID !== BossID.RAGLICH,
);
