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
import type { AltFloor } from "../enums/AltFloor";
import { getAltFloorName } from "../enums/AltFloor";
import type { OtherAchievementKind } from "../enums/OtherAchievementKind";
import { getOtherAchievementName } from "../enums/OtherAchievementKind";
import type { UnlockablePath } from "../enums/UnlockablePath";
import { getPathName } from "../enums/UnlockablePath";
import type { UNLOCKABLE_GRID_ENTITY_TYPES } from "../unlockableGridEntityTypes";
import { getGridEntityName } from "../unlockableGridEntityTypes";

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

export function getAchievement(
  type: AchievementType.CHARACTER,
  character: PlayerType,
): CharacterAchievement;
export function getAchievement(
  type: AchievementType.PATH,
  unlockablePath: UnlockablePath,
): PathAchievement;
export function getAchievement(type: AchievementType, arg: int): Achievement {
  switch (type) {
    case AchievementType.CHARACTER: {
      return {
        type,
        character: arg,
      };
    }

    case AchievementType.PATH: {
      return {
        type,
        unlockablePath: arg,
      };
    }

    default: {
      return error(
        `getAchievement missing logic for achievement type: ${AchievementType[type]}`,
      );
    }
  }
}

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
