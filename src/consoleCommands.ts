import { startRandomizer } from "./classes/features/AchievementTracker";
import { mod } from "./mod";

export const MIN_SEED = 1;
export const MAX_SEED = 4_294_967_295;

export function initConsoleCommands(): void {
  mod.addConsoleCommand("achievementrandomizer", achievementRandomizer);
}

function achievementRandomizer(params: string) {
  if (params === "") {
    print("You must enter a seed. e.g. achievementrandomizer 12345");
    return;
  }

  const seedNumber = tonumber(params);
  if (seedNumber === undefined) {
    print(`The provided seed was not a number: ${params}`);
    return;
  }

  if (seedNumber < MIN_SEED || seedNumber > MAX_SEED) {
    print(`The seed must be between ${MIN_SEED} and ${MAX_SEED}.`);
  }

  const seed = seedNumber as Seed;
  startRandomizer(seed);
}
