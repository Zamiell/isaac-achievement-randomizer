import type { PlayerType } from "isaac-typescript-definitions";
import {
  CHARACTER_OBJECTIVE_KIND_VALUES,
  OBJECTIVE_TYPE_VALUES,
} from "../cachedEnumValues";
import { DIFFICULTIES } from "../constants";
import { ObjectiveType } from "../enums/ObjectiveType";
import type { CharacterObjective, Objective } from "../types/Objective";
import { getObjective } from "../types/Objective";
import type { ObjectiveID } from "../types/ObjectiveID";
import { getObjectiveID } from "../types/ObjectiveID";
import { NON_STORY_BOSSES } from "./bosses";
import { UNLOCKABLE_CHALLENGES } from "./unlockableChallenges";
import { PLAYABLE_CHARACTERS } from "./unlockableCharacters";

export const ALL_OBJECTIVES: readonly Objective[] = (() => {
  const objectives: Objective[] = [];

  for (const objectiveType of OBJECTIVE_TYPE_VALUES) {
    switch (objectiveType) {
      case ObjectiveType.CHARACTER: {
        for (const character of PLAYABLE_CHARACTERS) {
          const characterObjectives = getAllCharacterObjectives(character);
          objectives.push(...characterObjectives);
        }

        break;
      }

      case ObjectiveType.BOSS: {
        for (const bossID of NON_STORY_BOSSES) {
          const objective: Objective = {
            type: ObjectiveType.BOSS,
            bossID,
          };
          objectives.push(objective);
        }

        break;
      }

      case ObjectiveType.CHALLENGE: {
        for (const challenge of UNLOCKABLE_CHALLENGES) {
          const challengeObjective = getObjective(
            ObjectiveType.CHALLENGE,
            challenge,
          );
          objectives.push(challengeObjective);
        }

        break;
      }
    }
  }

  return objectives;
})();

export function getAllCharacterObjectives(
  character: PlayerType,
): readonly CharacterObjective[] {
  const characterObjectives: CharacterObjective[] = [];

  for (const kind of CHARACTER_OBJECTIVE_KIND_VALUES) {
    for (const difficulty of DIFFICULTIES) {
      const characterObjective = getObjective(
        ObjectiveType.CHARACTER,
        character,
        kind,
        difficulty,
      );
      characterObjectives.push(characterObjective);
    }
  }

  return characterObjectives;
}

export const ALL_OBJECTIVE_IDS: readonly ObjectiveID[] = ALL_OBJECTIVES.map(
  (objective) => getObjectiveID(objective),
);
