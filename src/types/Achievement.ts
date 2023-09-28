import type {
  BatterySubType,
  BombSubType,
  CardType,
  Challenge,
  CoinSubType,
  CollectibleType,
  HeartSubType,
  KeySubType,
  PickupVariant,
  PillEffect,
  PlayerType,
  SackSubType,
  SlotVariant,
  TrinketType,
} from "isaac-typescript-definitions";
import type { AchievementType } from "../enums/AchievementType";
import type { OtherAchievementKind } from "../enums/OtherAchievementKind";
import type { UnlockablePath } from "../enums/UnlockablePath";
import type { UNLOCKABLE_GRID_ENTITY_TYPES } from "../unlockableGridEntityTypes";

interface CharacterAchievement {
  type: AchievementType.CHARACTER;
  character: PlayerType;
}

interface PathAchievement {
  type: AchievementType.PATH;
  unlockablePath: UnlockablePath;
}

interface ChallengeAchievement {
  type: AchievementType.CHALLENGE;
  challenge: Challenge;
}

interface CollectibleAchievement {
  type: AchievementType.COLLECTIBLE;
  collectibleType: CollectibleType;
}

interface TrinketAchievement {
  type: AchievementType.TRINKET;
  trinketType: TrinketType;
}

interface CardAchievement {
  type: AchievementType.CARD;
  cardType: CardType;
}

interface PillEffectAchievement {
  type: AchievementType.PILL_EFFECT;
  pillEffect: PillEffect;
}

interface HeartAchievement {
  type: AchievementType.HEART;
  heartSubType: HeartSubType;
}

interface CoinAchievement {
  type: AchievementType.COIN;
  coinSubType: CoinSubType;
}

interface BombAchievement {
  type: AchievementType.BOMB;
  bombSubType: BombSubType;
}

interface KeyAchievement {
  type: AchievementType.KEY;
  keySubType: KeySubType;
}

interface BatteryAchievement {
  type: AchievementType.BATTERY;
  batterySubType: BatterySubType;
}

interface SackAchievement {
  type: AchievementType.SACK;
  sackSubType: SackSubType;
}

interface ChestAchievement {
  type: AchievementType.CHEST;
  pickupVariant: PickupVariant;
}

interface SlotAchievement {
  type: AchievementType.SLOT;
  slotVariant: SlotVariant;
}

interface GridEntityAchievement {
  type: AchievementType.GRID_ENTITY;
  gridEntityType: (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number];
}

interface OtherAchievement {
  type: AchievementType.OTHER;
  kind: OtherAchievementKind;
}

export type Achievement =
  | CharacterAchievement
  | PathAchievement
  | ChallengeAchievement
  | CollectibleAchievement
  | TrinketAchievement
  | CardAchievement
  | PillEffectAchievement
  | HeartAchievement
  | CoinAchievement
  | BombAchievement
  | KeyAchievement
  | BatteryAchievement
  | SackAchievement
  | ChestAchievement
  | SlotAchievement
  | GridEntityAchievement
  | OtherAchievement;
