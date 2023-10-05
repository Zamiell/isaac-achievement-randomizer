import {
  BossID,
  Challenge,
  PocketItemSlot,
  StageType,
  TrinketSlot,
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

export const BOSS_IDS: readonly BossID[] = getEnumValues(BossID);

export const CHALLENGES: readonly Challenge[] = getEnumValues(Challenge);

export const CHARACTER_OBJECTIVE_KINDS: readonly CharacterObjectiveKind[] =
  getEnumValues(CharacterObjectiveKind);

export const OBJECTIVE_TYPES: readonly ObjectiveType[] =
  getEnumValues(ObjectiveType);

export const OTHER_ACHIEVEMENT_KINDS: readonly OtherAchievementKind[] =
  getEnumValues(OtherAchievementKind);

export const POCKET_ITEM_SLOTS: readonly PocketItemSlot[] =
  getEnumValues(PocketItemSlot);

export const STAGE_TYPES: readonly StageType[] = getEnumValues(StageType);

export const TRINKET_SLOTS: readonly TrinketSlot[] = getEnumValues(TrinketSlot);

export const UNLOCKABLE_PATHS: readonly UnlockablePath[] =
  getEnumValues(UnlockablePath);
