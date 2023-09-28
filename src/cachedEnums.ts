import {
  BatterySubType,
  BombSubType,
  BossID,
  Challenge,
  CoinSubType,
  HeartSubType,
  KeySubType,
  SackSubType,
} from "isaac-typescript-definitions";
import { getEnumValues } from "isaacscript-common";
import { AchievementType } from "./enums/AchievementType";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { UnlockablePath } from "./enums/UnlockablePath";
import { PillAchievementKind } from "./types/Achievement";

export const ACHIEVEMENT_TYPES: readonly AchievementType[] =
  getEnumValues(AchievementType);

export const BATTERY_SUB_TYPES: readonly BatterySubType[] =
  getEnumValues(BatterySubType);

export const BOMB_SUB_TYPES: readonly BombSubType[] =
  getEnumValues(BombSubType);

export const BOSS_IDS: readonly BossID[] = getEnumValues(BossID);

export const CHALLENGES: readonly Challenge[] = getEnumValues(Challenge);

export const CHARACTER_OBJECTIVE_KINDS: readonly CharacterObjectiveKind[] =
  getEnumValues(CharacterObjectiveKind);

export const COIN_SUB_TYPES: readonly CoinSubType[] =
  getEnumValues(CoinSubType);

export const HEART_SUB_TYPES: readonly HeartSubType[] =
  getEnumValues(HeartSubType);

export const KEY_SUB_TYPES: readonly KeySubType[] = getEnumValues(KeySubType);

export const OBJECTIVE_TYPES: readonly ObjectiveType[] =
  getEnumValues(ObjectiveType);

export const PILL_ACHIEVEMENT_KINDS: readonly PillAchievementKind[] =
  getEnumValues(PillAchievementKind);

export const SACK_SUB_TYPES: readonly SackSubType[] =
  getEnumValues(SackSubType);

export const UNLOCKABLE_PATHS: readonly UnlockablePath[] =
  getEnumValues(UnlockablePath);
