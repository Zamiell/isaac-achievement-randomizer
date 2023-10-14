import { BossID } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { BOSS_IDS } from "../cachedEnums";
import { BossIDCustom } from "../enums/BossIDCustom";

/** @see about.md */
const NO_HIT_EXCEPTION_BOSSES = new ReadonlySet([
  BossID.MOMS_HEART, // 8
  BossID.GISH, // 19
  BossID.CHAD, // 21
  BossID.TRIACHNID, // 42
  BossID.DELIRIUM, // 70
  BossID.RAGLICH, // 98
]);

export const NO_HIT_BOSSES: readonly BossID[] = BOSS_IDS.filter(
  (bossID) => !NO_HIT_EXCEPTION_BOSSES.has(bossID),
  // eslint-disable-next-line unicorn/prefer-spread
).concat(...Object.values(BossIDCustom));
