import { BossID } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { BOSS_IDS } from "../cachedEnums";
import { IS_DEV } from "../constants";
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

const HARD_BOSS_IDS = new ReadonlySet<BossID>([
  // When play testing, even without dealing any damage to Brownie, he kills himself at around the 1
  // minute and 10 seconds mark.
  BossID.BROWNIE, // 58

  // The boss is extremely difficult to do without taking any damage.
  BossID.HORNFEL, // 82

  // The boss is extremely difficult to do without taking any damage.
  BossID.SCOURGE, // 85

  // 2 minutes is probably doable but it is pretty difficult.
  BossID.ROTGUT, // 87
]);

export function getNumMinutesForBossObjective(bossID: BossID): int {
  if (IS_DEV) {
    return 0.05;
  }

  return HARD_BOSS_IDS.has(bossID) ? 1 : 2;
}
