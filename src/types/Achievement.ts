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
import { GridEntityType } from "isaac-typescript-definitions";
import type { CompositionTypeSatisfiesEnum } from "isaacscript-common";
import {
  getBatteryName,
  getBombName,
  getCardName,
  getChallengeName,
  getCharacterName,
  getChestName,
  getCoinName,
  getCollectibleName,
  getHeartName,
  getKeyName,
  getPillEffectName,
  getSackName,
  getSlotName,
  getTrinketName,
} from "isaacscript-common";
import { AchievementType } from "../enums/AchievementType";
import { AltFloor } from "../enums/AltFloor";
import { OtherAchievementKind } from "../enums/OtherAchievementKind";
import { UnlockablePath } from "../enums/UnlockablePath";
import type { UNLOCKABLE_GRID_ENTITY_TYPES } from "../unlockableGridEntityTypes";

interface CharacterAchievement {
  type: AchievementType.CHARACTER;
  character: PlayerType;
}

interface PathAchievement {
  type: AchievementType.PATH;
  unlockablePath: UnlockablePath;
}

interface AltFloorAchievement {
  type: AchievementType.ALT_FLOOR;
  altFloor: AltFloor;
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
  | AltFloorAchievement
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

type _Test = CompositionTypeSatisfiesEnum<Achievement, AchievementType>;

export function getAchievementText(achievement: Achievement): [string, string] {
  switch (achievement.type) {
    case AchievementType.CHARACTER: {
      return ["character", getCharacterName(achievement.character)];
    }

    case AchievementType.PATH: {
      return ["area", getPathName(achievement.unlockablePath)];
    }

    case AchievementType.ALT_FLOOR: {
      return ["floor", getAltFloorName(achievement.altFloor)];
    }

    case AchievementType.CHALLENGE: {
      return ["challenge", getChallengeName(achievement.challenge)];
    }

    case AchievementType.COLLECTIBLE: {
      return ["collectible", getCollectibleName(achievement.collectibleType)];
    }

    case AchievementType.TRINKET: {
      return ["trinket", getTrinketName(achievement.trinketType)];
    }

    case AchievementType.CARD: {
      return ["card", getCardName(achievement.cardType)];
    }

    case AchievementType.PILL_EFFECT: {
      return ["pill effect", getPillEffectName(achievement.pillEffect)];
    }

    case AchievementType.HEART: {
      return ["heart", getHeartName(achievement.heartSubType)];
    }

    case AchievementType.COIN: {
      return ["coin", getCoinName(achievement.coinSubType)];
    }

    case AchievementType.BOMB: {
      return ["bomb", getBombName(achievement.bombSubType)];
    }

    case AchievementType.KEY: {
      return ["key", getKeyName(achievement.keySubType)];
    }

    case AchievementType.BATTERY: {
      return ["battery", getBatteryName(achievement.batterySubType)];
    }

    case AchievementType.SACK: {
      return ["sack", getSackName(achievement.sackSubType)];
    }

    case AchievementType.CHEST: {
      return ["chest", getChestName(achievement.pickupVariant)];
    }

    case AchievementType.SLOT: {
      return ["slot", getSlotName(achievement.slotVariant)];
    }

    case AchievementType.GRID_ENTITY: {
      return ["grid entity", getGridEntityName(achievement.gridEntityType)];
    }

    case AchievementType.OTHER: {
      return getOtherAchievementName(achievement.kind);
    }
  }
}

function getPathName(unlockablePath: UnlockablePath): string {
  switch (unlockablePath) {
    case UnlockablePath.CHEST: {
      return "The Chest";
    }

    case UnlockablePath.DARK_ROOM: {
      return "Dark Room";
    }

    case UnlockablePath.MEGA_SATAN: {
      return "Mega Satan";
    }

    case UnlockablePath.BOSS_RUSH: {
      return "Boss Rush";
    }

    case UnlockablePath.BLUE_WOMB: {
      return "Blue Womb";
    }

    case UnlockablePath.VOID: {
      return "The Void";
    }

    case UnlockablePath.REPENTANCE_FLOORS: {
      return "Repentance floors";
    }

    case UnlockablePath.THE_ASCENT: {
      return "The Ascent";
    }

    case UnlockablePath.GREED_MODE: {
      return "Greed Mode";
    }

    case UnlockablePath.BLACK_MARKETS: {
      return "Black Markets";
    }
  }
}

function getAltFloorName(altFloor: AltFloor): string {
  switch (altFloor) {
    case AltFloor.CELLAR: {
      return "Cellar";
    }

    case AltFloor.BURNING_BASEMENT: {
      return "Burning Basement";
    }

    case AltFloor.CATACOMBS: {
      return "Catacombs";
    }

    case AltFloor.FLOODED_CAVES: {
      return "Flooded Caves";
    }

    case AltFloor.NECROPOLIS: {
      return "Necropolis";
    }

    case AltFloor.DANK_DEPTHS: {
      return "Dank Depths";
    }

    case AltFloor.UTERO: {
      return "Utero";
    }

    case AltFloor.SCARRED_WOMB: {
      return "Scarred Womb";
    }

    case AltFloor.DROSS: {
      return "Dross";
    }

    case AltFloor.ASHPIT: {
      return "Ashpit";
    }

    case AltFloor.GEHENNA: {
      return "Gehenna";
    }
  }
}

function getGridEntityName(
  gridEntityType: (typeof UNLOCKABLE_GRID_ENTITY_TYPES)[number],
): string {
  switch (gridEntityType) {
    // 4
    case GridEntityType.ROCK_TINTED: {
      return "tinted rocks";
    }

    // 18
    case GridEntityType.CRAWL_SPACE: {
      return "crawl spaces";
    }

    // 22
    case GridEntityType.ROCK_SUPER_SPECIAL: {
      return "super tinted rocks";
    }

    // 27
    case GridEntityType.ROCK_GOLD: {
      return "fool's gold rocks";
    }
  }
}

function getOtherAchievementName(
  otherAchievementKind: OtherAchievementKind,
): [string, string] {
  switch (otherAchievementKind) {
    case OtherAchievementKind.BEDS: {
      return ["pickup", "beds"];
    }

    case OtherAchievementKind.SHOPKEEPERS: {
      return ["entity", "shopkeepers"];
    }

    case OtherAchievementKind.BLUE_FIREPLACES: {
      return ["entity", "blue fireplaces"];
    }

    case OtherAchievementKind.GOLD_TRINKETS: {
      return ["trinket type", "gold trinkets"];
    }

    case OtherAchievementKind.GOLD_PILLS: {
      return ["pill type", "gold pills"];
    }

    case OtherAchievementKind.HORSE_PILLS: {
      return ["pill type", "horse pills"];
    }

    case OtherAchievementKind.URNS: {
      return ["grid entity", "urns"];
    }

    case OtherAchievementKind.MUSHROOMS: {
      return ["grid entity", "mushrooms"];
    }

    case OtherAchievementKind.SKULLS: {
      return ["grid entity", "skulls"];
    }

    case OtherAchievementKind.POLYPS: {
      return ["grid entity", "polyps"];
    }

    case OtherAchievementKind.GOLDEN_POOP: {
      return ["grid entity", "golden poop"];
    }

    case OtherAchievementKind.RAINBOW_POOP: {
      return ["grid entity", "rainbow poop"];
    }

    case OtherAchievementKind.BLACK_POOP: {
      return ["grid entity", "black poop"];
    }

    case OtherAchievementKind.CHARMING_POOP: {
      return ["grid entity", "charming poop"];
    }

    case OtherAchievementKind.REWARD_PLATES: {
      return ["grid entity", "reward plates"];
    }
  }
}
