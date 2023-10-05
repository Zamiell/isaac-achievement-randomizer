export enum CharacterObjectiveKind {
  MOM,
  IT_LIVES,
  ISAAC,
  BLUE_BABY,
  SATAN,
  LAMB,

  MEGA_SATAN,
  BOSS_RUSH,
  HUSH,
  DELIRIUM,
  MOTHER,
  BEAST,
  ULTRA_GREED,

  NO_HIT_BASEMENT_1,
  NO_HIT_BASEMENT_2,
  NO_HIT_CAVES_1,
  NO_HIT_CAVES_2,
  NO_HIT_DEPTHS_1,
  NO_HIT_DEPTHS_2,
  NO_HIT_WOMB_1,
  NO_HIT_WOMB_2,
  NO_HIT_SHEOL_CATHEDRAL,
  NO_HIT_DARK_ROOM_CHEST,
  NO_HIT_DOWNPOUR_1,
  NO_HIT_DOWNPOUR_2,
  NO_HIT_MINES_1,
  NO_HIT_MINES_2,
  NO_HIT_MAUSOLEUM_1,
  NO_HIT_MAUSOLEUM_2,
  NO_HIT_CORPSE_1,
  NO_HIT_CORPSE_2,
}

export function getCharacterObjectiveKindName(
  kind: CharacterObjectiveKind,
): string {
  switch (kind) {
    case CharacterObjectiveKind.MOM: {
      return "Mom";
    }

    case CharacterObjectiveKind.IT_LIVES: {
      return "It Lives";
    }

    case CharacterObjectiveKind.ISAAC: {
      return "Isaac";
    }

    case CharacterObjectiveKind.BLUE_BABY: {
      return "Blue Baby";
    }

    case CharacterObjectiveKind.SATAN: {
      return "Satan";
    }

    case CharacterObjectiveKind.LAMB: {
      return "The Lamb";
    }

    case CharacterObjectiveKind.MEGA_SATAN: {
      return "Mega Satan";
    }

    case CharacterObjectiveKind.BOSS_RUSH: {
      return "Boss Rush";
    }

    case CharacterObjectiveKind.HUSH: {
      return "Hush";
    }

    case CharacterObjectiveKind.DELIRIUM: {
      return "Delirium";
    }

    case CharacterObjectiveKind.MOTHER: {
      return "Mother";
    }

    case CharacterObjectiveKind.BEAST: {
      return "The Beast";
    }

    case CharacterObjectiveKind.ULTRA_GREED: {
      return "Ultra Greed";
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_1: {
      return "1";
    }

    case CharacterObjectiveKind.NO_HIT_BASEMENT_2: {
      return "2";
    }

    case CharacterObjectiveKind.NO_HIT_CAVES_1: {
      return "3";
    }

    case CharacterObjectiveKind.NO_HIT_CAVES_2: {
      return "4";
    }

    case CharacterObjectiveKind.NO_HIT_DEPTHS_1: {
      return "5";
    }

    case CharacterObjectiveKind.NO_HIT_DEPTHS_2: {
      return "6";
    }

    case CharacterObjectiveKind.NO_HIT_WOMB_1: {
      return "7";
    }

    case CharacterObjectiveKind.NO_HIT_WOMB_2: {
      return "8";
    }

    case CharacterObjectiveKind.NO_HIT_SHEOL_CATHEDRAL: {
      return "10";
    }

    case CharacterObjectiveKind.NO_HIT_DARK_ROOM_CHEST: {
      return "11";
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_1: {
      return "1 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_DOWNPOUR_2: {
      return "2 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MINES_1: {
      return "3 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MINES_2: {
      return "4 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_1: {
      return "5 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_MAUSOLEUM_2: {
      return "6 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_CORPSE_1: {
      return "7 (alt)";
    }

    case CharacterObjectiveKind.NO_HIT_CORPSE_2: {
      return "8 (alt)";
    }
  }
}
