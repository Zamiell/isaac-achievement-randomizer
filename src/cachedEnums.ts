import {
  BatterySubType,
  BombSubType,
  BossID,
  Challenge,
  CoinSubType,
  HeartSubType,
  KeySubType,
  SackSubType,
  SlotVariant,
} from "isaac-typescript-definitions";
import { getEnumValues } from "isaacscript-common";
import { AchievementType } from "./enums/AchievementType";
import { AltFloor } from "./enums/AltFloor";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { OtherAchievementKind } from "./enums/OtherAchievementKind";
import { UnlockablePath } from "./enums/UnlockablePath";

export const ACHIEVEMENT_TYPES: readonly AchievementType[] =
  getEnumValues(AchievementType);

export const ALT_FLOORS: readonly AltFloor[] = getEnumValues(AltFloor);

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

export const OTHER_ACHIEVEMENT_KINDS: readonly OtherAchievementKind[] =
  getEnumValues(OtherAchievementKind);

export const SACK_SUB_TYPES: readonly SackSubType[] =
  getEnumValues(SackSubType);

export const SLOT_VARIANTS: readonly SlotVariant[] = getEnumValues(SlotVariant);

export const UNLOCKABLE_PATHS: readonly UnlockablePath[] =
  getEnumValues(UnlockablePath);
