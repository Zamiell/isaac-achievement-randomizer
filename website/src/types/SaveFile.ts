import { z } from "zod";
import { RandomizerMode } from "../../../src/enums/RandomizerMode";

export const SAVE_FILE_SCHEMA = z.object({
  AchievementTracker: z.object({
    persistent: z.object({
      seed: z.number().int(),
      randomizerMode: z.nativeEnum(RandomizerMode),
      objectiveIDToUnlockIDMap: z.record(z.string(), z.string()),
      completedObjectiveIDs: z.record(z.string(), z.string()),
    }),
  }),

  StatsTracker: z.object({
    persistent: z.object({
      stats: z.object({
        numCompletedRuns: z.number().int(),
        numDeaths: z.number().int(),
        gameFramesElapsed: z.number().int(),
        currentStreak: z.number().int(),
        bestStreak: z.number().int(),

        usedIllegalPause: z.boolean(),
        usedSaveAndQuit: z.boolean(),
        doubleUnlocked: z.boolean(),
        usedMods: z.boolean(),
        generatedWithCheat: z.boolean(),
      }),
    }),
  }),
});

export type SaveFile = z.infer<typeof SAVE_FILE_SCHEMA>;
