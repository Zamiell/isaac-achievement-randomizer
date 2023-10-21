import { SeedEffect } from "isaac-typescript-definitions";
import {
  DefaultMap,
  assertDefined,
  game,
  getHUDOffsetVector,
  newSprite,
} from "isaacscript-common";
import { TimerType } from "./enums/TimerType";

class TimerSprites {
  clock = newSprite("gfx/timer/clock.anm2");

  colons = {
    afterMinutes: newSprite("gfx/timer/colon.anm2"),
    afterHours: newSprite("gfx/timer/colon.anm2"),
  };

  digits = {
    hour1: newSprite("gfx/timer/timer.anm2"),
    hour2: newSprite("gfx/timer/timer.anm2"),
    hour3: newSprite("gfx/timer/timer.anm2"),
    minute1: newSprite("gfx/timer/timer.anm2"),
    minute2: newSprite("gfx/timer/timer.anm2"),
    second1: newSprite("gfx/timer/timer.anm2"),
    second2: newSprite("gfx/timer/timer.anm2"),
  };
}

const DIGIT_LENGTH = 7.25;
const COLON_LENGTH = 4;

const STARTING_COORDINATES = {
  [TimerType.MAIN]: [19, 198], // Directly below the stat HUD.
  [TimerType.NO_HIT]: [55, 79], // To the right of the speed stat.
} as const satisfies Record<TimerType, readonly [int, int]>;

const spriteCollectionMap = new DefaultMap<int, TimerSprites>(
  () => new TimerSprites(),
);

/** Should be called from the `POST_RENDER` callback. */
export function timerDraw(timerType: TimerType, seconds: int): void {
  const hud = game.GetHUD();
  if (!hud.IsVisible()) {
    return;
  }

  // The `HUD.IsVisible` method does not take into account `SeedEffect.NO_HUD`.
  const seeds = game.GetSeeds();
  if (seeds.HasSeedEffect(SeedEffect.NO_HUD)) {
    return;
  }

  // We want the timer to be drawn when the game is paused so that players can continue to see the
  // countdown if they tab out of the game.

  // Calculate the starting draw position. It will be directly below the stat HUD.
  const [startingX, startingY] = STARTING_COORDINATES[timerType];
  const HUDOffsetVector = getHUDOffsetVector();
  let x = startingX + HUDOffsetVector.X;
  const y = startingY + HUDOffsetVector.Y;

  const timerValues = convertSecondsToTimerValues(seconds);
  if (timerValues === undefined) {
    return;
  }

  const { hour1, hour2, hour3, minute1, minute2, second1, second2 } =
    timerValues;

  const sprites = spriteCollectionMap.getAndSetDefault(timerType);

  const positionClock = Vector(x + 34, y + 45);
  sprites.clock.Render(positionClock);

  if (hour1 > 0) {
    sprites.digits.hour1.SetFrame(hour1);
    sprites.digits.hour1.Render(Vector(x, y));

    x += DIGIT_LENGTH;
  }

  if (hour1 > 0 || hour2 > 0) {
    sprites.digits.hour2.SetFrame(hour2);
    sprites.digits.hour2.Render(Vector(x, y));

    x += DIGIT_LENGTH;
  }

  if (hour1 > 0 || hour2 > 0 || hour3 > 0) {
    sprites.digits.hour3.SetFrame(hour3);
    sprites.digits.hour3.Render(Vector(x, y));

    x += DIGIT_LENGTH;

    const positionColonAfterHours = Vector(x - 2, y);
    sprites.colons.afterHours.Render(positionColonAfterHours);

    x += COLON_LENGTH;
  }

  sprites.digits.minute1.SetFrame(minute1);
  sprites.digits.minute1.Render(Vector(x, y));

  x += DIGIT_LENGTH;

  sprites.digits.minute2.SetFrame(minute2);
  sprites.digits.minute2.Render(Vector(x, y));

  x += DIGIT_LENGTH;

  sprites.colons.afterMinutes.Render(Vector(x - 2, y));

  x += COLON_LENGTH;

  sprites.digits.second1.SetFrame(second1);
  sprites.digits.second1.Render(Vector(x, y));

  x += DIGIT_LENGTH;

  sprites.digits.second2.SetFrame(second2);
  sprites.digits.second2.Render(Vector(x, y));
}

export function convertSecondsToTimerValues(totalSeconds: int):
  | {
      hour1: int;
      hour2: int;
      hour3: int;
      minute1: int;
      minute2: int;
      second1: int;
      second2: int;
      tenths: int;
    }
  | undefined {
  if (totalSeconds < 0) {
    return undefined;
  }

  // Calculate the hours digits.
  const hours = Math.floor(totalSeconds / 3600);
  const hoursStringUnpadded = hours.toString();
  const hoursString = hoursStringUnpadded.padStart(3, "0");

  // The first character.
  const hour1String = hoursString[0] ?? "0";
  const hour1 = tonumber(hour1String);
  assertDefined(hour1, "Failed to parse the first hour of the timer.");

  // The second character.
  const hour2String = hoursString[1] ?? "0";
  const hour2 = tonumber(hour2String);
  assertDefined(hour2, "Failed to parse the second hour of the timer.");

  // The third character.
  const hour3String = hoursString[2] ?? "0";
  const hour3 = tonumber(hour3String);
  assertDefined(hour3, "Failed to parse the third hour of the timer.");

  // Calculate the minutes digits.
  let minutes = Math.floor(totalSeconds / 60);
  if (hours > 0) {
    minutes -= hours * 60;
  }
  const minutesStringUnpadded = minutes.toString();
  const minutesString = minutesStringUnpadded.padStart(2, "0");

  // The first character.
  const minute1String = minutesString[0] ?? "0";
  const minute1 = tonumber(minute1String);
  assertDefined(minute1, "Failed to parse the first minute of the timer.");

  // The second character.
  const minute2String = minutesString[1] ?? "0";
  const minute2 = tonumber(minute2String);
  assertDefined(minute2, "Failed to parse the second minute of the timer.");

  // Calculate the seconds digits.
  const seconds = Math.floor(totalSeconds % 60);
  const secondsStringUnpadded = seconds.toString();
  const secondsString = secondsStringUnpadded.padStart(2, "0");

  // The first character.
  const second1String = secondsString[0] ?? "0";
  const second1 = tonumber(second1String);
  assertDefined(second1, "Failed to parse the first second of the timer.");

  // The second character.
  const second2String = secondsString[1] ?? "0";
  const second2 = tonumber(second2String);
  assertDefined(second2, "Failed to parse the second second of the timer.");

  // Calculate the tenths digit.
  const rawSeconds = totalSeconds % 60; // 0.000 to 59.999
  const decimals = rawSeconds - Math.floor(rawSeconds);
  const tenths = Math.floor(decimals * 10);

  return { hour1, hour2, hour3, minute1, minute2, second1, second2, tenths };
}
