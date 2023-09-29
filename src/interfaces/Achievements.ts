import type {
  BossID,
  Challenge,
  PlayerType,
} from "isaac-typescript-definitions";
import type { DefaultMap } from "isaacscript-common";
import type { CharacterObjectiveKind } from "../enums/CharacterObjectiveKind";
import type { Achievement } from "../types/Achievement";

export interface Achievements {
  characterAchievements: DefaultMap<
    PlayerType,
    Map<CharacterObjectiveKind, Achievement>
  >;
  bossAchievements: Map<BossID, Achievement>;
  challengeAchievements: Map<Challenge, Achievement>;
}
