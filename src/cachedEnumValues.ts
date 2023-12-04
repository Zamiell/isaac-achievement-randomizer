import {
  BossID,
  Challenge,
  PocketItemSlot,
  TrinketSlot,
} from "isaac-typescript-definitions";
import { getEnumValues } from "isaacscript-common";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { OtherUnlockKind } from "./enums/OtherUnlockKind";
import { RandomizerMode } from "./enums/RandomizerMode";
import { UnlockType } from "./enums/UnlockType";
import { UnlockableArea } from "./enums/UnlockableArea";

export const BOSS_ID_VALUES = getEnumValues(BossID);

export const CHALLENGE_VALUES = getEnumValues(Challenge);

export const CHARACTER_OBJECTIVE_KIND_VALUES = getEnumValues(
  CharacterObjectiveKind,
);

export const OBJECTIVE_TYPE_VALUES = getEnumValues(ObjectiveType);

export const OTHER_UNLOCK_KIND_VALUES = getEnumValues(OtherUnlockKind);

export const POCKET_ITEM_SLOT_VALUES = getEnumValues(PocketItemSlot);

export const RANDOMIZER_MODE_VALUES = getEnumValues(RandomizerMode);

export const TRINKET_SLOT_VALUES = getEnumValues(TrinketSlot);

export const UNLOCKABLE_AREA_VALUES = getEnumValues(UnlockableArea);

export const UNLOCK_TYPE_VALUES = getEnumValues(UnlockType);
