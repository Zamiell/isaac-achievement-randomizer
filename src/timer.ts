import { SeedEffect } from "isaac-typescript-definitions";
import {
  DefaultMap,
  assertDefined,
  game,
  getHUDOffsetVector,
} from "isaacscript-common";
import { TimerType } from "./enums/TimerType";
import { newSprite } from "./sprite";

class TimerSprites {
  clock = newSprite("gfx/timer/clock.anm2");

  colons = {
    afterMinutes: newSprite("gfx/timer/colon.anm2"),
    afterHours: newSprite("gfx/timer/colon.anm2"),
  };

  digits = {
    hour1: newSprite("gfx/timer/timer.anm2"),
    hour2: newSprite("gfx/timer/timer.anm2"),
    minute1: newSprite("gfx/timer/timer.anm2"),
    minute2: newSprite("gfx/timer/timer.anm2"),
    second1: newSprite("gfx/timer/timer.anm2"),
    second2: newSprite("gfx/timer/timer.anm2"),
  };
}

const DIGIT_LENGTH = 7.25;

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

  const hourAdjustment = 2;
  let hourAdjustment2 = 0;

  const timerValues = convertSecondsToTimerValues(seconds);
  if (timerValues === undefined) {
    return;
  }

  const { hour1, hour2, minute1, minute2, second1, second2 } = timerValues;

  const sprites = spriteCollectionMap.getAndSetDefault(timerType);

  const positionClock = Vector(x + 34, y + 45);
  sprites.clock.Render(positionClock);

  if (hour2 > 0) {
    // The format of the time will be "#:##:##" (instead of "##:##", which is the default).
    hourAdjustment2 = 2;
    x += DIGIT_LENGTH * 2 + hourAdjustment;

    const positionHour1 = Vector(x - DIGIT_LENGTH * 2 - hourAdjustment, y);
    sprites.digits.hour1.SetFrame("Default", hour1);
    sprites.digits.hour1.Render(positionHour1);

    const positionHour2 = Vector(x - DIGIT_LENGTH - hourAdjustment, y);
    sprites.digits.hour2.SetFrame("Default", hour2);
    sprites.digits.hour2.Render(positionHour2);

    const positionColon = Vector(x - DIGIT_LENGTH + 7, y + 19);
    sprites.colons.afterHours.Render(positionColon);
  }

  const positionMinute1 = Vector(x, y);
  sprites.digits.minute1.SetFrame("Default", minute1);
  sprites.digits.minute1.Render(positionMinute1);

  const positionMinute2 = Vector(x + DIGIT_LENGTH, y);
  sprites.digits.minute2.SetFrame("Default", minute2);
  sprites.digits.minute2.Render(positionMinute2);

  const positionColon1 = Vector(x + DIGIT_LENGTH + 10, y + 19);
  sprites.colons.afterMinutes.Render(positionColon1);

  const positionSecond1 = Vector(x + DIGIT_LENGTH + 11, y);
  sprites.digits.second1.SetFrame("Default", second1);
  sprites.digits.second1.Render(positionSecond1);

  const positionSecond2 = Vector(
    x + DIGIT_LENGTH + 11 + DIGIT_LENGTH + 1 - hourAdjustment2,
    y,
  );
  sprites.digits.second2.SetFrame("Default", second2);
  sprites.digits.second2.Render(positionSecond2);
}

export function convertSecondsToTimerValues(totalSeconds: int):
  | {
      hour1: int;
      hour2: int;
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
  const hoursString = hoursStringUnpadded.padStart(2, "0");

  // The first character.
  const hour1String = hoursString[0] ?? "0";
  const hour1 = tonumber(hour1String);
  assertDefined(hour1, "Failed to parse the first hour of the timer.");

  // The second character.
  const hour2String = hoursString[1] ?? "0";
  const hour2 = tonumber(hour2String);
  assertDefined(hour2, "Failed to parse the second hour of the timer.");

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

  return { hour1, hour2, minute1, minute2, second1, second2, tenths };
}
