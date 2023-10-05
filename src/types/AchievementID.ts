import { AchievementType } from "../enums/AchievementType";
import type { Achievement } from "./Achievement";

/**
 * A string that represents an achievement. This is the achievement metadata separated by periods.
 *
 * This type is branded for extra type safety.
 */
type AchievementID = string & { readonly __achievementIDBrand: symbol };

export function getAchievementID(achievement: Achievement): AchievementID {
  switch (achievement.type) {
    case AchievementType.CHARACTER: {
      return `${achievement.type}.${achievement.character}` as AchievementID;
    }

    case AchievementType.PATH: {
      return `${achievement.type}.${achievement.unlockablePath}` as AchievementID;
    }

    case AchievementType.ALT_FLOOR: {
      return `${achievement.type}.${achievement.altFloor}` as AchievementID;
    }

    case AchievementType.CHALLENGE: {
      return `${achievement.type}.${achievement.challenge}` as AchievementID;
    }

    case AchievementType.COLLECTIBLE: {
      return `${achievement.type}.${achievement.collectibleType}` as AchievementID;
    }

    case AchievementType.TRINKET: {
      return `${achievement.type}.${achievement.trinketType}` as AchievementID;
    }

    case AchievementType.CARD: {
      return `${achievement.type}.${achievement.cardType}` as AchievementID;
    }

    case AchievementType.PILL_EFFECT: {
      return `${achievement.type}.${achievement.pillEffect}` as AchievementID;
    }

    case AchievementType.HEART: {
      return `${achievement.type}.${achievement.heartSubType}` as AchievementID;
    }

    case AchievementType.COIN: {
      return `${achievement.type}.${achievement.coinSubType}` as AchievementID;
    }

    case AchievementType.BOMB: {
      return `${achievement.type}.${achievement.bombSubType}` as AchievementID;
    }

    case AchievementType.KEY: {
      return `${achievement.type}.${achievement.keySubType}` as AchievementID;
    }

    case AchievementType.BATTERY: {
      return `${achievement.type}.${achievement.batterySubType}` as AchievementID;
    }

    case AchievementType.SACK: {
      return `${achievement.type}.${achievement.sackSubType}` as AchievementID;
    }

    case AchievementType.CHEST: {
      return `${achievement.type}.${achievement.pickupVariant}` as AchievementID;
    }

    case AchievementType.SLOT: {
      return `${achievement.type}.${achievement.slotVariant}` as AchievementID;
    }

    case AchievementType.GRID_ENTITY: {
      return `${achievement.type}.${achievement.gridEntityType}` as AchievementID;
    }

    case AchievementType.OTHER: {
      return `${achievement.type}.${achievement.kind}` as AchievementID;
    }
  }
}
