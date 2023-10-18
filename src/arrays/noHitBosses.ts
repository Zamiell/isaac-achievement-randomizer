import { BossID } from "isaac-typescript-definitions";
import { ReadonlyMap, ReadonlySet } from "isaacscript-common";
import { BOSS_IDS } from "../cachedEnums";
import { IS_DEV } from "../constants";
import { BossIDCustom } from "../enums/BossIDCustom";

const DEFAULT_NO_HIT_BOSS_MINUTES = 2;

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

const BOSSES_WITH_CUSTOM_MINUTES = new ReadonlyMap<BossID, float>([
  // Too easy.
  [BossID.MONSTRO, 1], // 1

  // Too easy.
  [BossID.LARRY_JR, 1], // 2

  // Mostly easy.
  [BossID.FAMINE, 1.5], // 9

  // Too easy.
  [BossID.DUKE_OF_FLIES, 1], // 13

  // Too easy.
  [BossID.GEMINI, 1], // 17

  // Mostly easy.
  [BossID.FISTULA, 1.5], // 18

  // Too easy.
  [BossID.STEVEN, 1], // 20

  // Mostly easy.
  [BossID.TERATOMA, 1.5], // 33

  // Mostly easy.
  [BossID.PIN, 1.5], // 37

  // Mostly easy.
  [BossID.DINGLE, 1.5], // 44

  // Mostly easy.
  [BossID.GURGLING, 1.5], // 56

  // When play testing, even without dealing any damage to Brownie, he kills himself at around the 1
  // minute and 10 seconds mark.
  [BossID.BROWNIE, 1], // 58

  // Mostly easy.
  [BossID.LITTLE_HORN, 1.5], // 60

  // Mostly easy.
  [BossID.RAG_MAN, 1.5], // 61

  // Mostly easy.
  [BossID.DANGLE, 1.5], // 64

  // Mostly easy.
  [BossID.TURDLING, 1.5], // 65

  // The boss is extremely difficult to do without taking any damage.
  [BossID.HORNFEL, 1], // 82

  // The boss is extremely difficult to do without taking any damage.
  [BossID.SCOURGE, 1], // 85

  // 2 minutes is probably doable but it is pretty difficult.
  [BossID.ROTGUT, 1], // 87
]);

export function getNumMinutesForBossObjective(bossID: BossID): int {
  if (IS_DEV) {
    return 0.05;
  }

  const customMinutes = BOSSES_WITH_CUSTOM_MINUTES.get(bossID);
  return customMinutes ?? DEFAULT_NO_HIT_BOSS_MINUTES;
}
