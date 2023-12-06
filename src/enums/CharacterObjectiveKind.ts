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
  MOTHER,
  BEAST,
  ULTRA_GREED,

  NO_HIT_BASEMENT,
  NO_HIT_CAVES,
  NO_HIT_DEPTHS,
  NO_HIT_WOMB,
}

const CHARACTER_OBJECTIVE_KIND_NAMES = {
  [CharacterObjectiveKind.MOM]: "Mom",
  [CharacterObjectiveKind.IT_LIVES]: "It Lives",
  [CharacterObjectiveKind.ISAAC]: "Isaac",
  [CharacterObjectiveKind.BLUE_BABY]: "Blue Baby",
  [CharacterObjectiveKind.SATAN]: "Satan",
  [CharacterObjectiveKind.LAMB]: "The Lamb",
  [CharacterObjectiveKind.MEGA_SATAN]: "Mega Satan",
  [CharacterObjectiveKind.BOSS_RUSH]: "Boss Rush",
  [CharacterObjectiveKind.HUSH]: "Hush",
  [CharacterObjectiveKind.MOTHER]: "Mother",
  [CharacterObjectiveKind.BEAST]: "The Beast",
  [CharacterObjectiveKind.ULTRA_GREED]: "Ultra Greed",
  [CharacterObjectiveKind.NO_HIT_BASEMENT]: "Basement",
  [CharacterObjectiveKind.NO_HIT_CAVES]: "Caves",
  [CharacterObjectiveKind.NO_HIT_DEPTHS]: "Depths",
  [CharacterObjectiveKind.NO_HIT_WOMB]: "Womb",
} as const satisfies Record<CharacterObjectiveKind, string>;

export function getCharacterObjectiveKindName(
  kind: CharacterObjectiveKind,
): string {
  return CHARACTER_OBJECTIVE_KIND_NAMES[kind];
}
