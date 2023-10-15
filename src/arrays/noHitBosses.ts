import { BossID } from "isaac-typescript-definitions";
import { ReadonlySet } from "isaacscript-common";
import { BOSS_IDS } from "../cachedEnums";
import { IS_DEV } from "../constants";
import { BossIDCustom } from "../enums/BossIDCustom";

const DEFAULT_NUM_MINUTES_FOR_BOSS_OBJECTIVE = 2;

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

export function getNumMinutesForBossObjective(bossID: BossID): int {
  if (IS_DEV) {
    return 0.05;
  }

  switch (bossID) {
    // 58
    case BossID.BROWNIE: {
      return 1;
    }

    // 78
    case BossID.VISAGE: {
      return 1;
    }

    // 79
    case BossID.SIREN: {
      return 1;
    }

    // 82
    case BossID.HORNFEL: {
      return 1;
    }

    // 84
    case BossID.BABY_PLUM: {
      return 1;
    }

    // 85
    case BossID.SCOURGE: {
      return 1;
    }

    // 87
    case BossID.ROTGUT: {
      return 1;
    }

    default: {
      return DEFAULT_NUM_MINUTES_FOR_BOSS_OBJECTIVE;
    }
  }
}
