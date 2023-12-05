import { BossID, StageID } from "isaac-typescript-definitions";
import { ReadonlySet, isStoryBossID } from "isaacscript-common";
import { BOSS_ID_VALUES } from "../cachedEnumValues";

/**
 * Kilburn wanted the easter egg bosses from other games to be rarer in Repentance because they are
 * re-skins of other bosses. Specifically, Gish is a re-skinned Monstro, CHAD is a re-skinned Chub,
 * and Triachnid is a re-skinned Daddy Long Legs. (Larry Jr. is an exception.)
 */
const RARE_BOSSES = new ReadonlySet([
  BossID.GISH, // 19
  BossID.CHAD, // 21
  BossID.TRIACHNID, // 42
]);

/** There are 102 vanilla boss IDs and 17 story boss IDs. */
export const BOSS_OBJECTIVE_BOSS_IDS: readonly BossID[] = BOSS_ID_VALUES.filter(
  (bossID) =>
    !isStoryBossID(bossID) &&
    !RARE_BOSSES.has(bossID) &&
    bossID !== BossID.RAGLICH,
);

export const BOSS_OBJECTIVE_BOSS_IDS_SET = new ReadonlySet(
  BOSS_OBJECTIVE_BOSS_IDS,
);

export const STAGE_IDS_FOR_BOSS_OBJECTIVES = [
  StageID.BASEMENT, // 1
  StageID.CELLAR, // 2
  StageID.BURNING_BASEMENT, // 3
  StageID.DOWNPOUR, // 27
  StageID.DROSS, // 28

  StageID.CAVES, // 4
  StageID.CATACOMBS, // 5
  StageID.FLOODED_CAVES, // 6
  StageID.MINES, // 29
  StageID.ASHPIT, // 30

  StageID.DEPTHS, // 7
  StageID.NECROPOLIS, // 8
  StageID.DANK_DEPTHS, // 9
  StageID.MAUSOLEUM, // 31
  StageID.GEHENNA, // 32

  StageID.WOMB, // 10
  StageID.UTERO, // 11
  StageID.SCARRED_WOMB, // 12
  StageID.CORPSE, // 33
] as const;
