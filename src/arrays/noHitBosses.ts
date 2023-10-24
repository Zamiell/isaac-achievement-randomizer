import { BossID } from "isaac-typescript-definitions";
import { ReadonlyMap, ReadonlySet } from "isaacscript-common";
import { BOSS_IDS, BOSS_IDS_CUSTOM } from "../cachedEnums";

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
).concat(...BOSS_IDS_CUSTOM);

const BOSSES_WITH_CUSTOM_MINUTES = new ReadonlyMap<BossID, float>([
  // Basement easy modifier.
  [BossID.MONSTRO, 1], // 1
  [BossID.LARRY_JR, 1], // 2
  [BossID.FAMINE, 1.5], // 9
  [BossID.DUKE_OF_FLIES, 1], // 13
  [BossID.GEMINI, 1], // 17
  [BossID.FISTULA, 1.5], // 18
  [BossID.STEVEN, 1], // 20
  [BossID.TERATOMA, 1.5], // 33
  [BossID.PIN, 1.5], // 37
  [BossID.DINGLE, 1.5], // 44
  [BossID.GURGLING, 1.5], // 56

  // When play testing, even without dealing any damage to Brownie, he kills himself at around the 1
  // minute and 10 seconds mark.
  [BossID.BROWNIE, 1], // 58

  // Basement easy modifier.
  [BossID.LITTLE_HORN, 1.5], // 60
  [BossID.RAG_MAN, 1.5], // 61
  [BossID.DANGLE, 1.5], // 64
  [BossID.TURDLING, 1.5], // 65

  // The boss is extremely difficult to do without taking any damage.
  [BossID.HORNFEL, 1], // 82

  // Basement easy modifier.
  [BossID.BABY_PLUM, 1.5], // 84

  // The boss is extremely difficult to do without taking any damage.
  [BossID.SCOURGE, 1], // 85

  // 2 minutes is probably doable but it is pretty difficult.
  [BossID.ROTGUT, 1], // 87
]);

export function getNumMinutesForBossObjective(bossID: BossID): int {
  const customMinutes = BOSSES_WITH_CUSTOM_MINUTES.get(bossID);
  return customMinutes ?? DEFAULT_NO_HIT_BOSS_MINUTES;
}
