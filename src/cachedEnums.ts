import {
  Challenge,
  PocketItemSlot,
  StageType,
  TrinketSlot,
} from "isaac-typescript-definitions";
import { ReadonlySet, getEnumValues } from "isaacscript-common";
import { CharacterObjectiveKind } from "./enums/CharacterObjectiveKind";
import { ObjectiveType } from "./enums/ObjectiveType";
import { OtherUnlockKind } from "./enums/OtherUnlockKind";
import { RandomizerMode } from "./enums/RandomizerMode";
import { UnlockType } from "./enums/UnlockType";
import { UnlockableArea } from "./enums/UnlockableArea";

export const CHALLENGES: readonly Challenge[] = getEnumValues(Challenge);

export const CHARACTER_OBJECTIVE_KINDS: readonly CharacterObjectiveKind[] =
  getEnumValues(CharacterObjectiveKind);

export const OBJECTIVE_TYPES: readonly ObjectiveType[] =
  getEnumValues(ObjectiveType);

export const OBJECTIVE_TYPES_SET = new ReadonlySet(OBJECTIVE_TYPES);

export const OTHER_UNLOCK_KINDS: readonly OtherUnlockKind[] =
  getEnumValues(OtherUnlockKind);

export const POCKET_ITEM_SLOTS: readonly PocketItemSlot[] =
  getEnumValues(PocketItemSlot);

export const RANDOMIZER_MODES: readonly RandomizerMode[] =
  getEnumValues(RandomizerMode);

export const STAGE_TYPES: readonly StageType[] = getEnumValues(StageType);

export const TRINKET_SLOTS: readonly TrinketSlot[] = getEnumValues(TrinketSlot);

export const UNLOCKABLE_AREAS: readonly UnlockableArea[] =
  getEnumValues(UnlockableArea);

export const UNLOCK_TYPES: readonly UnlockType[] = getEnumValues(UnlockType);

export const UNLOCK_TYPES_SET = new ReadonlySet(UNLOCK_TYPES);
