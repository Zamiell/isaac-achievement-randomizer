# Achievement Randomizer

<!-- markdownlint-disable MD033 -->

## Summary (TL;DR)

- Achievement Randomizer is a mod for [_The Binding of Isaac: Repentance_](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) that gives you the experience of playing through the game from scratch, unlocking each item one by one in a randomized way.
- It does not simply randomize all of the vanilla achievements. Rather, it has [custom objectives](objectives.md) and [custom unlocks](unlocks.md).
- Unlike vanilla, almost everything that you can imagine is locked from the start of the game. That means you will have to beat your the first run as Isaac with only Breakfast in the item pools!
- The custom objectives are designed to be challenging and non-arbitrary. There are only 4 types of objectives:
  - Kill each story boss (per character).
  - Finish each floor without taking a hit (per character).
  - Survive each boss for 2 minutes without taking a hit.
  - Complete each challenge.
- For more specific details about why we designed it this way and what exact things are locked, read on.

<br>

## Beta Warning ⚠️

- The mod is currently in beta, so it is not recommended that you play it. If you want to test the beta version, then expect bugs, oversights, broken save files, uncompletable seeds, and so on.
- [Backup your save file](#how-do-i-backuprestoreedit-my-randomizer-save-file) after every run.
- Report any bugs that you encounter in [the Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF).

<br>

## Table of Contents

1. [Design Principles](#design-principles)
1. [Terminology](#terminology)
1. [Objective List](#objective-list)
1. [Unlock List](#unlock-list)
1. [Modes](#modes)
1. [Other Randomization Info](#other-randomization-info)
1. [Other Features](#other-features)
1. [F.A.Q.](#faq-frequently-asked-questions)

<br>

## Design Principles

We do not want to randomize the vanilla achievements. This is for several reasons:

1. [Other mods](https://steamcommunity.com/sharedfiles/filedetails/?id=2838967057) have already done that.
1. Some of the vanilla achievements do not make sense in the context of a player trying to "beat the game" in the least amount of death possible, like `The Scissors - Die 100 times` or `Mr. Resetter! - Reset 7 times in a row`. (This would make the minimum amount of deaths always be 100 and it is possible to complete the game in less than that.)
1. Some vanilla achievements do not make sense in the context of a player trying to "beat the game" in the fastest time possible, like `Dedication - Participate in 31 Daily Challenges`. (This would make the minimum amount of time always be 31 days and it is possible to complete the game in less than that.)
1. Most vanilla achievements are arbitrary conditions and are not very fun to play, like `They will charge you up... for a small fee - Donate to Battery Bums until they pay out with an item 5 times`. (If you are not lucky enough to get this achievement during your playthrough, the most consistent strategy is to reset as Tainted Keeper in Greed Mode until you see a Battery Bum in the shop. This is "busywork" and is not skill-based in any way.)
1. Many things are not gated behind vanilla achievements and it would be fun if they were (e.g. soul hearts, locked chests).

Thus, this mod takes a completely different approach. We want each objective to be non-arbitrary, difficult, and represent a meaningful accomplishment inside of the game. And we want to unlock as many things as possible.

<br>

## Terminology

Before we get into the details of the mod, we should clarify the terminology used:

- An _objective_ is something that you perform in the game to unlock something. (For example, killing Mom as Isaac is an objective.) All objectives are listed below.
- An _unlock_ is something that you get after completing an objective. (For example, killing Mom as Isaac might unlock the Yum Heart collectible, allowing it to appear in item pools on subsequent runs.) All unlocks are listed below.
- An _achievement_ is the unique pair of an _objective_ and an _unlock_. In this mod, all achievements are randomized, although there is some basic logic to prevent unbeatable seeds and other miscellaneous things.

<br>

## Objective List

Objectives are listed [on a separate page](objectives.md).

<br>

## Unlock List

Unlocks are listed [on a separate page](unlocks.md).

<br>

## Modes

When starting a new seed, you can select between several modes:

### 1) Casual Mode (Full Random)

In casual mode, things will mostly unlock in a completely random order, with some small exceptions for items that would be completely useless otherwise. (For example, if you unlock Deck of Cards before you have any cards unlocked, you will unlock a Fool card instead, and the place where you were supposed to unlock the Fool card will instead unlock Deck of Cards.)

This mode can make a randomizer playthrough extremely easy, because if your first unlock is an extremely powerful item (e.g. Mom's Knife), then each subsequent run will be trivialized (until the item pool is sufficiently diluted). If you want a challenge, do not play on this mode.

### 2) Hardcore Mode (Progressive Unlocks)

In hardcore mode, we want to prevent the situation where you unlock powerful items early on in your playthrough.

- Collectibles, trinkets, and cards will progressively unlock based on their quality classification. (50% of 0 quality items must unlock first before 1 quality items, and so on.)
  - Since trinkets and cards do not have vanilla quality classifications, custom qualities were created by [Gamonymous](https://github.com/Rchardon) & [Moucheron Quipet](https://www.twitch.tv/moucheronquipet).
  - Some collectibles have a [custom quality](https://github.com/Zamiell/isaac-achievement-randomizer/blob/main/mod/resources/items_metadata.xml) (like Cursed Eye).
- Pill effects will unlock on a cycle of one negative, one neutral, and one positive.
- Hearts will unlock in the following order:
  - Gold Heart
  - Rotten Heart
  - Scared Heart
  - Heart
  - Heart (double)
  - Heart (half soul)
  - Heart (soul)
  - Black Heart
  - Heart (eternal)
  - Bone Heart
- Coins will unlock in the following order:
  - Sticky Nickel
  - Double Penny
  - Nickel
  - Dime
  - Lucky Penny
  - Golden Penny
- Bombs will unlock in the following order:
  - Double Bomb
  - Golden Bomb
- Keys will unlock in the following order:
  - Charged Key
  - Key Ring
  - Golden Key
- Batteries will unlock in the following order:
  - Micro Battery
  - Lil' Battery
  - Mega Battery
  - Golden Battery
- Sacks will unlock in the following order:
  - Grab Bag
  - Black Sack
- Chests will unlock in the following order:
  - Spiked Chest
  - Mimic Chest
  - Haunted Chest
  - Chest
  - Locked Chest
  - Bomb Chest
  - Red Chest
  - Eternal Chest
  - Wooden Chest
  - Mega Chest

### 3) Nightmare Mode

Nightmare mode is the same as hardcore mode, but also has the following effects:

- If possible, enemies will spawn as champions.
- Champion enemies will not drop any pickups.
- You take full heart damage from all sources.
- Breakfast does not spawn.

<br>

## Other Randomization Info

- Unlocking new things will never apply to the current run and will only apply to subsequent runs.
  - For example, if you unlock Wooden Spoon on the first run by doing the no-hit objective on Basement 1, you will still get Breakfast as the boss collectible after defeating the Basement 2 boss.
- The following stat collectibles will always be unlocked before any other unlocks:
  - Wooden Spoon (#27)
  - Wire Coat Hanger (#32)
  - Cat-O-Nine-Tails (#165)
- 6 area unlocks are not randomized and always are unlocked from specific objectives:
  - Womb (by defeating Mom)
  - Cathedral (by defeating It Lives)
  - Sheol (by defeating Isaac)
  - The Chest (by defeating Satan)
  - Dark Room (by defeating Blue Baby)
  - Repentance floors (by defeating The Lamb)
- Each character is guaranteed to unlock another random character from one of their [basic objectives](objectives.md#character-unlock-objectives).
- The following characters are considered to be "hard" and are guaranteed to be in the second half of characters unlocked:
  - Blue Baby (#4)
  - Tainted Judas (#24)
  - Tainted Blue Baby (#25)
  - Tainted Lazarus (#29)
  - Tainted Lost (#31)
  - Tainted Forgotten (#35)
  - Tainted Bethany (#36)
  - Tainted Jacob (#37)
- Due to technical limitations, Bag of Crafting is not affected by collectible unlocks. Thus, Tainted Cain is guaranteed to be the final character unlocked.
- Besides that, there is no logic that makes things unlock in a particular order. However, certain specific unlocks will be swapped to ensure that unlocked things are not "useless", [as described in the casual mode section](#1-casual-mode-full-random).

<br>

## Other Features

### 1) Dead Sea Scrolls Integration <!-- deadSeaScrolls.ts -->

The mod comes with an in-game menu called _Dead Sea Scrolls_. (This is the same menu that is used in other mods, like [_Fiend Folio_](https://steamcommunity.com/sharedfiles/filedetails/?id=2851063440).) You can open the menu by pressing `c` after starting a run.

The menu will show you how many objectives you have left in your playthrough and other information.

### 2) Death Tracker <!-- Stats Tracker -->

The mod includes a death tracker. If you are a streaker, try to complete the randomizer with as few deaths as possible! (Starting a new run without finishing the previous run counts as a death.)

### 3) Timer <!-- Timer -->

The mod includes an on-screen timer, similar to the [Racing+](https://isaacracing.net/) mod. The timer starts off hidden by default, but you can enable it in the Dead Sea Scrolls menu. If you are a speedrunner, try to complete the randomizer as fast as possible!

Unlike the timer in Racing+, the timer in this mod tracks in-game time. Thus, the timer will be paused when the game is paused or when you are in the main menu.

### 4) Room Flipping

There are thousands of rooms in the game, but many players have already seen them all. To increase run variety, all rooms have a chance to be flipped on the X axis, Y axis, or both axes.

Gehenna is exempt from this behavior due to unavoidable damage with Ball and Chains.

### 5) More Champions

In the vanilla game, only certain specific enemies have the chance to spawn as a champion variant. In this mod, every enemy in the game has a chance to spawn as a champion variant.

### 6) Gameplay Removals

#### Donation Machine Removal <!-- RemoveDonationMachines -->

- The mod removes all Donation Machines from the game in order to increase the difficulty and prevent individual runs from influencing each other. (Eden's Blessing is removed from the game for the same reason.)
- Greed Donation Machines are also removed because they serve no purpose in this mod.
- The Karma trinket is removed because it would serve no purpose.

#### Void Portal Deletion <!-- RemoveVoidPortals -->

The mod deletes all Void Portals outside of the Blue Womb. This is both a balance change (since it slightly increases the difficulty of Delirium) and a quality of life fix (since players can no longer accidentally enter a Void Portal and lose their streak).

#### Glitched Item Removal <!-- RemoveGlitchedCollectibles -->

Glitched items are removed for the same reason that TMTRAINER is.

#### Victory Lap & Rerun Removal

Victory Laps and the "Rerun" feature on the main menu are banned for the same reason that R Key is.

### 7) Chill Room <!-- ChillRoom -->

The mod provides a custom challenge that simply locks you in the starting room of the run. You can use this challenge to review your achievements and plan for your next run. Runs started inside of the challenge will not count towards your randomizer stats or deaths.

### 8) Custom Console Commands <!-- consoleCommands.ts -->

The mod provides several custom [console commands](https://bindingofisaacrebirth.fandom.com/wiki/Debug_Console):

- `endRandomizer` - Ends the current randomizer playthrough.
- `randomizerVersion` - Displays the current version of the mod.
- `objectiveBoss` - For debugging. Immediately accomplishes the no-hit boss objective for the current room.
- `objectiveFloor` - For debugging. Immediately accomplishes the no-hit floor objective for the current floor.
- `startRandomizer [mode] [seed]` - Starts a new randomizer playthrough using the specified seed. For example: `startRandomizer hardcore 12345`
- `randomizerVersion` - Prints the version of the Achievement Randomizer mod.
- `spoilerLog` - Writes out a spoiler log to the "log.txt" file. Note that the unlocks may not be accurate, since the mod swaps an unlock if it detects that you should not get it yet.
- `unlockArea [area]` - For debugging. Immediately unlocks the specified area.
- `unlockCharacter [character]` - For debugging. Immediately unlocks the specified character.
- `unlockCollectible [collectible]` - For debugging. Immediately unlocks the specified collectible.
- `unlockPillEffect [pill effect]` - For debugging. Immediately unlocks the specified pill effect.
- `unlockRoom [room]` - For debugging. Immediately unlocks the specified room.

### 9) Crash & Softlock Prevention <!-- FixVanillaBugs -->

This mod attempts to fix as many vanilla crashes & softlocks as possible. The following situations are fixed:

#### Lil' Portal Crashes

Portals from Lil' Portal that leads to invalid rooms will automatically be removed.

#### Mega Mush + Lucky Pennies

Lucky Pennies are automatically converted to normal pennies while the Mega Mush effect is active.

### 9) Illegal Pause Detection & Illegal Save & Quit Detection

In the Isaac streaking community, you are only allowed to pause the game when the room is clear of enemies. If you are allowed to pause in a room with enemies, then you can think about the best movement patterns to defeat the enemies, and mentally prepare exactly what to do. This kind of thing goes against the spirit of the competition; players are intended to have to react instantly to new situations. Thus, the mod will keep track of any illegal pauses that you do, both displaying an error on the screen and then showing a that you have illegally paused on the stats menu for your playthrough. If you want the mod to prevent you from illegally pausing, turn on the option in the "Randomizer Settings" page of the menu.

In the Isaac streaking community, you are not allowed to use the save & quit feature of the game. If you are allowed to save & quit, then you can do things like prevent incoming damage, exploit Restock Machines, and reset enemy patterns. All of these things go against the spirit of the competition; players are intended to have to complete a room in one attempt and they should not get "do-overs" when they make movement mistakes. Thus, the mod will keep track of any illegal save & quits that you do, both displaying an error on the screen and then showing a that you have illegally saved and quit on the stats menu for your playthrough. If you want the mod to prevent you from illegally saving and quitting, turn on the option in the "Randomizer Settings" page of the menu.

### 10) Other Miscellaneous Quality of Life Improvements

- <!-- "ui_hearts.png" --> The heart UI sprites have been slightly modified so that it is easier to see an empty heart container on a black background.
- <!-- SilenceMomDad --> The audio clips of mom and dad on the Ascent are silenced.
- <!-- ForceFadedConsoleDisplay --> The "faded console display" feature is automatically enabled in the "options.ini" file, which allows you to visually see when an error in the game happens.
- <!-- PreventVictoryLapPopup --> The Victory Lap popup will no longer appear after defeating The Lamb.
- <!-- PreventEndMegaSatan --> Defeating Mega Satan no longer has a chance to immediately end the run.

<br>

## F.A.Q. (Frequently Asked Questions)

### What is the latest version?

The latest version can always be found [on the Steam Workshop change notes page](https://steamcommunity.com/sharedfiles/filedetails/changelog/3050399093).

### How do I tell what version I have?

The version of the mod is shown on the title screen and on the starting room of the run. You can also get the version by typing "randomizerVersion" into the in-game console.

### My game is stuck on an older version. How do I get it to update to the latest version?

If [the version that you have](#how-do-i-tell-what-version-i-have) is not the same as [the latest version on the Steam Workshop](#what-is-the-latest-version), then try restarting Steam. If that does not work, then try closing the game, unsubscribing from the mod, starting the game, closing the game, resubscribing to the mod, and then opening the game.

### How do I contact the developers, report a bug, or chat with other people about the mod?

The main hub of communication for the mod is the "#randomizer" channels in the [Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF). (Discord is a voice and text chat application that allows anyone to create a hosted server. We use one such server as the primary hub of communication for Isaac streaking.)

### How do I backup/restore/edit my randomizer save file?

The achievement randomizer save data is located in the following directory:

```text
C:\Program Files (x86)\Steam\steamapps\common\The Binding of Isaac Rebirth\data\isaac-achievement-randomizer
```

In this directory, there will be either a "save1.dat", "save2.dat", or "save3.dat" file, corresponding to which save slot that you play on.

It is important that you backup this file after every run.

### How do I change the data inside of my safe file?

See the previous section for the location of the save file.

Obviously, modifying your save file is normally considered to be cheating, but you might need to do it if the format of the save file needs to be updated or if you encounter a game-breaking bug that corrupts your save file in some way.

The save file is simply [a JSON file](https://www.w3schools.com/js/js_json_intro.asp), so you can open it any text editor such as Notepad or [Notepad++](https://notepad-plus-plus.org/). Make sure that the game is completely closed before opening the save file, or editing it won't work.

The format of the JSON file is minified (i.e. all whitespace is removed), which makes it hard to read. First, you should prettify it by pasting the contents into [a JSON beautifier such as this one](https://codebeautify.org/jsonviewer). (After pasting it in on the left side, click on the "Beautify" button.)

Once it is beautified, you can see that the top level keys correspond to various mod features, with the most important ones being "AchievementTracker" and "StatsTracker".

### Is this mod compatible with other mods that add items and achievements?

No. Since this mod uses a completely customized objective & unlock system based on vanilla items, it is not compatible with any other mods.

### Will this mod affect my existing achievements on Steam?

No. This mod requires a fully unlocked save file to play. Thus, it does not interact with any vanilla Steam achievements.

### What DLCs is this mod compatible with? (Afterbirth / Afterbirth+ / Repentance)

This mod is only compatible with Repentance. In other words, you must own all three of the DLCs (Afterbirth & Afterbirth+ & Repentance).

### Why does the mod take so long to randomize the achievements at the beginning of a playthrough?

When you start a new randomizer playthrough, the mod assigns each objective to a random unlock. However, not all assignments are valid. For example, the mod might have randomly assigned the objective of "beat challenge #3" to the unlock of "unlock challenge #3". In this case, the playthrough seed would be unbeatable!

After all of the achievements are randomized, the mod does a validation step: it pretends that it is a player and attempts to "beat" the seed by accomplishing all of the objectives that are reachable. (This part is pretty time intensive.) If the seed is not beatable, then the mod will start from scratch and randomize all of the objectives + achievements again. It will attempt to generate valid seeds until it finds one that is beatable. This is what the "attempts" count on the black screen refers to.

### What algorithm does the randomizer use to randomize the achievements?

It uses the random fill algorithm, as described [by TestRunner in the AGDQ 2019 randomizer panel](https://www.youtube.com/watch?v=vGIDzGvsrV8).

### Doesn't the Pause collectible trivialize the no-hit boss objectives?

No. If you use Pause, the timers will be disabled until you re-enter the room.

### Why is it possible to get a soul heart in the health before unlocking the soul heart pickup? Why is it possible to get a black heart in the health before unlocking the black heart pickup?

There is a difference between a _heart health type_ (which is what appears in the health UI at the top left corner of the screen) and a _heart pickup_ (which is the entity that appears on the ground that you have to touch with your body).
**Only the pickups are unlockable, not the health type.** In other words, it is possible to unlock the Ceremonial Robes collectible before unlocking the black heart pickup. (Ceremonial Robes adds 3 black hearts directly to the player's health upon pickup.)

### How can I do the Baby Plum objective if she flies away?

The no-hit achievement requires that you do not get hit on Baby Plum for 2 minutes, but Baby Plum will fly away if you do not damage her over the course of a minute. Thus, all you have to do is shoot a single tear at her every minute in order to reset the timer.

### Why do the characters appear as unlocked while on the main menu?

Due to technical limitations, it is not possible to dynamically mod the main menu. Thus, the best we can do is to display a "this character is locked" message once you get into the game.

Note that:

- You can see which characters you currently have unlocked by going into the menu and selecting "Achievement List", then "Unlock List", and then "Characters".
- You can use the "Randomizer Chill Room" custom challenge to get into the game and view the menu without having to finish an entire run. (Being in the challenge will not increment the number of runs or the number of deaths.)

### Who made this mod?

The mod was designed by Zamiel and [Gamonymous](https://github.com/Rchardon), with some help from [Moucheron Quipet](https://www.twitch.tv/moucheronquipet).

### What programming language is the mod written in?

It is written in [TypeScript](https://www.typescriptlang.org/) using the [IsaacScript](https://isaacscript.github.io/) framework.
