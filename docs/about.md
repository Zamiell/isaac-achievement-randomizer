# Achievement Randomizer

<!-- markdownlint-disable MD033 -->

Achievement Randomizer is a mod for [_The Binding of Isaac: Repentance_](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) that gives you the experience of playing through the game from scratch, unlocking each item one by one in a randomized way.

This page explains how it works.

<br>

## Table of Contents

1. [Summary](#summary-tldr)
1. [Design Principles](#design-principles)
1. [Objective List](#objective-list)
1. [Unlock List](#unlock-list)
1. [Modes](#modes)
1. [Other Features](#other-features)
1. [F.A.Q.](#faq-frequently-asked-questions)

<br>

## Summary (TL;DR)

- This mod does not simply randomize all of the vanilla achievements. Rather, it has custom objectives and custom unlocks.
- The custom objectives are designed to be challenging and non-arbitrary. There are only 4 types of objectives:
  - Kill each story boss (per character).
  - Finish each floor without taking a hit (per character).
  - Survive each boss for 2 minutes without taking a hit.
  - Complete each challenge.
- Unlike vanilla, almost everything you can imagine is locked from the start of the game. That means you will have to beat your the first run as Isaac with only Breakfast in the item pools!
- For more specific details about why we designed it this way and what exact things are locked, read on.

<br>

## Beta Warning ⚠️

- The mod is currently in beta, so it is not recommended that you play it. If you want to test the beta version, then expect bugs, oversights, broken save files, uncompletable seeds, and so on.
- [Backup your save file](#how-do-i-backuprestoreedit-my-randomizer-save-file) after every run.
- Report any bugs that you encounter in [the Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF).

<br>

## Design Principles

We do not want to randomize the vanilla achievements. This is for several reasons:

1. [Other mods](https://steamcommunity.com/sharedfiles/filedetails/?id=2838967057) have already done that.
1. Some of the vanilla achievements do not make sense in the context of a player trying to "beat the game" in the least amount of death possible, like `The Scissors - Die 100 times` or `Mr. Resetter! - Reset 7 times in a row`. (This would make the minimum amount of deaths always be 100 and it is possible to complete the game in less than that.)
1. Some vanilla achievements do not make sense in the context of a player trying to "beat the game" in the fastest time possible, like `Dedication - Participate in 31 Daily Challenges`. (This would make the minimum amount of time always be 31 days and it is possible to complete the game in less than that.)
1. Most vanilla achievements are arbitrary conditions and are not very fun to play, like `They will charge you up... for a small fee - Donate to Battery Bums until they pay out with an item 5 times`. (If you are not lucky enough to get this achievement during your playthrough, the most consistent strategy is to reset as Tainted Keeper in Greed Mode until you see a Battery Bum in the shop. This is "busywork" and is not skill-based in any way.)
1. Many things are not gated behind vanilla achievements and it would be fun if they were (e.g. soul hearts, locked chests).

Thus, this mod takes a completely different approach. We want each objective to be non-arbitrary, difficult, and represent a meaningful accomplishment inside of the game. And we want to unlockable as many things as possible.

<br>

## Terminology

Before we get into the details of the mod, we should clarify the terminology used:

- An _objective_ is something that you perform in the game to unlock something. (For example, killing Mom as Isaac is an objective.) All objectives are listed below.
- An _unlock_ is something that you get after completing an objective. (For example, killing Mom as Isaac might unlock the Yum Heart collectible, allowing it to appear in item pools on subsequent runs.) All unlocks are listed below.
- An _achievement_ is the unique pair of an _objective_ and an _unlock_. In this mod, all achievements are randomized, although there is some basic logic to prevent unbeatable seeds and other miscellaneous things.

<br>

## Objective List

Note that all objectives must be completed on hard mode.

### Character-Based Objectives (1054)

Each character will unlock something upon defeating/completing the following:

1. Mom
2. It Lives
3. Isaac
4. Blue Baby
5. Satan
6. The Lamb
7. Mega Satan
8. Boss Rush
9. Hush
10. Ultra Greed
11. Delirium
12. Mother
13. The Beast

Additionally, each character will unlock something upon clearing the following floors without getting hit:

1. Basement 1 / Cellar 1 / Burning Basement 1
2. Basement 2 / Cellar 2 / Burning Basement 2
3. Caves 1 / Catacombs 1 / Flooded Caves 1
4. Caves 2 / Catacombs 2 / Flooded Caves 2
5. Depths 1 / Necropolis 1 / Dank Depths 1
6. Depths 2 / Necropolis 2 / Dank Depths 2
7. Womb 1 / Utero 1 / Scarred Womb 1
8. Womb 2 / Utero 2 / Scarred Womb 2
9. Cathedral / Sheol
10. The Chest / Dark Room
11. Downpour 1 / Dross 1
12. Downpour 2 / Dross 2
13. Mines 1 / Ashpit 1
14. Mines 2 / Ashpit 2
15. Mausoleum 1 / Gehenna 1
16. Mausoleum 2 / Gehenna 2
17. Corpse 1
18. Corpse 2

> Tip: A Crown of Light icon will appear next to the coin count UI when the "no hit" objective has not yet been accomplished for the particular character and floor combination.

### Boss-Based Objectives (104)

There is one unlock for surviving for 2 minutes without taking a hit for each boss.

The following "special" bosses / mini-bosses are also included:

- Ultra Pride (#46.2)
- Krampus (#81.1)
- Uriel (#271.0)
- Gabriel (#272.0)
- Ultra Famine (#951.10)
- Ultra Pestilence (#951.20)
- Ultra War (#951.30)
- Ultra Death (#951.40)

The following bosses have custom timer lengths:

- Brownie (#58) - 1 minute (because he damages himself)
- Hornfel (#82) - 1 minute (because he is extremely difficult)
- Scourge (#85) - 1 minute (because he is extremely difficult)
- Rotgut (#87) - 1 minute (because he is extremely difficult)

The following bosses have custom conditions:

- Fistula (#18) - Four or more pieces must be alive.
- Teratoma (#33) - Four or more pieces must be alive.
- Lokii (#31) - Both must be alive.
- Sisters Vis (#68) - Both must be alive.
- Ultra Pride - Both must be alive.

Additionally, the following bosses are excluded entirely:

- Mom's Heart (#8) (inaccessible on a fully unlocked save file)
- Gish (#19) (would be unfair since the boss is extremely rare)
- C.H.A.D. (#21) (would be unfair since the boss is extremely rare)
- Triachnid (#42) (would be unfair since the boss is extremely rare)
- Delirium (#70) (would be unfair since the boss is poorly designed)
- Raglich (#98) (unfinished boss, there are no actual boss rooms)

> Tip: A timer will appear on the screen if a boss is in the room and the corresponding objective has not yet been accomplished.

### Challenge-Based Objectives (44)

There is one unlock for completing each challenge, with the following exceptions:

- DELETE THIS (#45) (since TMTRAINER is banned)

### Total Objectives

There are 1054 + 104 + 44 = 1202 objectives in total.

<br>

## Unlock List

### Characters (33)

- The first character unlocked will always be Isaac. All other characters start off locked.
- Each character is guaranteed to unlock another random character from the following objectives:
  - Mom
  - It Lives
  - Isaac
  - Blue Baby
  - Satan
  - The Lamb

### Paths (10)

The following things start off locked and are inaccessible:

- The Polaroid + The Chest
- The Negative + The Dark Room
- Key Piece 1 + Key Piece 2 + Mega Satan
- Boss Rush
- Blue Womb
- The Void
- Repentance floors
- The Ascent
- Greed Mode
- Black Markets

Isaac is guaranteed to unlock both The Chest & Dark Room from one of his easier objectives. The rest can be randomly unlocked from any objective.

### Alternate Floors (11)

The following alternate floors start out locked:

- Cellar
- Burning Basement
- Catacombs
- Flooded Caves
- Necropolis
- Dank Depths
- Utero
- Scarred Womb
- Dross
- Ashpit
- Gehenna

### Room Types (7)

The following room types start out locked:

- Arcade (#9) (unlocks before first slot machine)
- Curse Room (#10) (unlocks before first Curse Room collectible)
- Library (#12) (unlocks before first book collectible)
- Sacrifice Room (#13) (unlocks before first Angel Room collectible)
- Vault (#20) (unlocks before first golden chest collectible)
- Dice Room (#21) (unlocks before first dice collectible/trinket/card)
- Planetarium (#24) (unlocks before first Planetarium collectible)

<!-- - Clean Bedroom (#18) (unlocks before first heart or bed) -->
<!-- - Dirty Bedroom (#19) (unlocks before first heart or bed) -->

### Challenges (44)

All challenges start off locked, with the following exceptions:

- DELETE THIS (#45) (since TMTRAINER is banned)

### Collectibles (694)

Every collectible in the game is locked, with the following exceptions:

- 5 collectibles from the Boss Room pool for each stat (#2):
  - Breakfast (#25) (HP)
  - Wooden Spoon (#27) (speed)
  - Mom's Underwear (#29) (range)
  - Wire Coat Hanger (#32) (tears)
  - Cat-O-Nine-Tails (#165) (damage)
- Quest collectibles (except for the ones relating to the unlockable paths above):
  - Broken Shovel (#550)
  - Broken Shovel (#551)
  - Mom's Shovel (#552)
  - Knife Piece 1 (#626)
  - Knife Piece 2 (#627)
  - Dogma (#633)
  - Dad's Note (#668)
- Special non-obtainable collectibles:
  - Book of Belial Birthright (#59)
  - Broken Glass Cannon (#474)
  - Damocles Passive (#656)
  - Recall (#714)
- Banned collectibles (since they would potentially trivialize difficult objectives):
  - Gnawed Leaf (#210)
  - Eden's Blessing (#381)
  - Plan C (#475)
  - Clicker (#482)
  - Metronome (#488)
  - R Key (#636)
  - TMTRAINER (#721)

Also note that:

- Even if Ankh (#161) is unlocked, it is removed from pools until all of the Blue Baby objectives are completed.
- Even if Judas' Shadow (#311) is unlocked, it is removed from pools until all of the Judas objectives are completed.
- Even if Lazarus Rags (#332) is unlocked, it is removed from pools until all of the Lazarus objectives are completed.

### Trinkets (185)

Every trinket in the game is locked, with the following exceptions:

- Banned trinkets in this mod:
  - Error (#75)
  - Karma (#85) (would be useless; see below)
  - 'M (#138) (would break collectible unlocks)

If no trinkets are unlocked, they will be converted to pennies.

Also note that:

- Even if Mysterious Paper (#21) or Missing Poster (#23) are unlocked, they are removed from pools until all of The Lost objectives are completed.
- Even if Broken Ankh (#28) is unlocked, it is removed from pools until all of the Blue Baby objectives are completed.

### Cards & Runes (95)

Every card/rune in the game is locked, with the following exceptions:

- Chaos Card (#42) (would trivialize difficult objectives)
- Rune Shard (#55)

If no cards/runes are unlocked, they will be converted to pennies.

### Pill Effects (50)

Every pill effect in the game is locked. If no pill effects are unlocked, pills will be converted to pennies.

### Other Pickups (38)

- Only half red heart pickups start out unlocked. Every other heart pickup in the game is locked. Locked hearts are converted to half red hearts. (11)
- Only pennies start out unlocked. Every other coin in the game is locked. Locked coins are converted to pennies. (6)
- Only normal bomb pickups start out unlocked. Every other bomb pickup in the game is locked. Locked bombs are converted to normal bombs. (2)
- Only normal key pickups start out unlocked. Every other key pickup in the game is locked. Locked keys are converted to normal keys. (3)
- Every battery type in the game is locked. Locked batteries are converted to pennies. (4)
- Every sack type in the game is locked. Locked sacks are converted to pennies. (2)
- Every chest type in the game is locked. Locked chests are converted to pennies. (10)
  - Old Chests and Mom's Chest are not unlockable since those chests do not randomly spawn.

### Slots (15)

Every slot entity (e.g. machines and beggars) is locked behind a random objective. Locked slot entities are removed.

### Grid Entities (13)

The following grid entities start out locked:

- Tinted Rocks (#4.0)
- Urns (#6.0)
- Mushrooms (#6.0)
- Skulls (#6.0)
- Polyps (#6.0)
- Golden Poop (#14.3)
- Rainbow Poop (#14.4)
- Black Poop (#14.5)
- Charming Poop (#14.11)
- Crawlspaces (#18.0)
- Reward Plates (#20.1)
- Super Tinted Rocks (#22.0)
- Fool's Gold Rocks (#27.0)

### Miscellaneous (7)

The following other things start out locked:

- Beds (#5.380)
- Shopkeepers (#17)
- Blue Fireplaces (#33.2)
- Purple Fireplaces (#33.3)
- Golden Trinkets
- Gold Pills
- Horse Pills

### Total Unlocks

There are 33 + 10 + 11 + 7 + 44 + 694 + 185 + 95 + 50 + 38 + 15 + 13 + 7 = 1202 unlocks in total.

<br>

## Modes

When starting a new seed, you can select between two modes:

### 1) Casual Mode (Full Random)

In casual mode, things will mostly unlock in a completely random order, with some small exceptions for items that would be completely useless otherwise. (For example, if you unlock Deck of Cards before you have any cards unlocked, you will unlock a Fool card instead, and the place where you were supposed to unlock the Fool card will instead unlock Deck of Cards.)

This mode can make a randomizer playthrough extremely easy, because if your first unlock is an extremely powerful item (e.g. Mom's Knife), then each subsequent run will be trivialized (until the item pool is sufficiently diluted). If you want a challenge, do not play on this mode.

### 2) Hardcore Mode (Progressive Unlocks)

In hardcore mode, we want to prevent the situation where you unlock powerful items early on in your playthrough.

- Collectibles, trinkets, cards, and pill effects will progressively unlock based on their quality classification. (50% of 0 quality items must unlock first before 1 quality items, and so on.)
  - Since trinkets and cards do not have vanilla quality classifications, custom qualities were created by [Gamonymous](https://github.com/Rchardon) & [Moucheron Quipet](https://www.twitch.tv/moucheronquipet).
  - A pill effect's quality is simply the pill effect class (e.g. positive/negative/neutral).
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

<br>

## Randomization Behavior

- Unlocking new things will never apply to the current run and will only apply to subsequent runs.
  - For example, if you unlock The Polaroid on Basement 1 and go on to kill Mom, she will still not drop The Polaroid because it will only be unlocked on the next run.

<br>

## Other Features

### Dead Sea Scrolls Integration <!-- deadSeaScrolls.ts -->

The mod comes with an in-game menu called _Dead Sea Scrolls_. (This is the same menu that is used in other mods, like [_Fiend Folio_](https://steamcommunity.com/sharedfiles/filedetails/?id=2851063440).) You can open the menu by pressing `c` after starting a run.

The menu will show you how many objectives you have left in your playthrough and other information.

### Death Tracker <!-- Stats Tracker -->

The mod includes a death tracker. If you are a streaker, try to complete the randomizer with as few deaths as possible! (Starting a new run without finishing the previous run counts as a death.)

### Timer <!-- Timer -->

The mod includes an on-screen timer, similar to the [Racing+](https://isaacracing.net/) mod. The timer starts off hidden by default, but you can enable it in the Dead Sea Scrolls menu. If you are a speedrunner, try to complete the randomizer as fast as possible!

Unlike the timer in Racing+, the timer in this mod tracks in-game time. Thus, the timer will be paused when the game is paused or when you are in the main menu.

### Gameplay Removals

#### Donation Machine Removal <!-- RemoveDonationMachines -->

- The mod removes all Donation Machines from the game in order to increase the difficulty and prevent individual runs from influencing each other. (Eden's Blessing is removed from the game for the same reason.)
- Greed Donation Machines are also removed because they serve no purpose in this mod.
- The Karma trinket is removed from the game because it would serve no purpose.

#### Void Portal Deletion <!-- RemoveVoidPortals -->

The mod deletes all Void Portals outside of the Blue Womb. This is both a balance change (since it slightly increases the difficulty of Delirium) and a quality of life fix (since players can no longer accidentally enter a Void Portal and lose their streak).

#### Glitched Item Removal <!-- RemoveGlitchedCollectibles -->

Glitched items are removed for the same reason that TMTRAINER is.

### Chill Room <!-- ChillRoom -->

The mod provides a custom challenge that simply locks you in the starting room of the run. You can use this challenge to review your achievements and plan for your next run. Runs started inside of the challenge will not count towards your randomizer stats or deaths.

### Custom Console Commands <!-- consoleCommands.ts -->

The mod provides several custom [console commands](https://bindingofisaacrebirth.fandom.com/wiki/Debug_Console):

- `endRandomizer` - Ends the current randomizer playthrough.
- `startRandomizer [mode] [seed]` - Starts a new randomizer playthrough using the specified seed. For example: `startRandomizer hardcore 12345`
- `spoilerLog` - Writes out a spoiler log to the "log.txt" file. Note that the unlocks may not be accurate, since the mod swaps an unlock if it detects that you should not get it yet.

### Crash & Softlock Prevention <!-- FixVanillaBugs -->

This mod attempts to fix as many vanilla crashes & softlocks as possible. The following situations are fixed:

#### Lil' Portal Crashes

Portals from Lil' Portal that leads to invalid rooms will automatically be removed.

#### Mega Mush + Lucky Pennies

Lucky Pennies are automatically converted to normal pennies while the Mega Mush effect is active.

### Illegal Pause Detection & Illegal Save & Quit Detection

In the Isaac streaking community, you are only allowed to pause the game when the room is clear of enemies. If you are allowed to pause in a room with enemies, then you can think about the best movement patterns to defeat the enemies, and mentally prepare exactly what to do. This kind of thing goes against the spirit of the competition; players are intended to have to react instantly to new situations. Thus, the mod will keep track of any illegal pauses that you do, both displaying an error on the screen and then showing a that you have illegally paused on the stats menu for your playthrough.

In the Isaac streaking community, you are not allowed to use the save & quit feature of the game. If you are allowed to save & quit, then you can do things like prevent incoming damage, exploit Restock Machines, and reset enemy patterns. All of these things go against the spirit of the competition; players are intended to have to complete a room in one attempt and they should not get "do-overs" when they make movement mistakes. Thus, the mod will keep track of any illegal save & quits that you do, both displaying an error on the screen and then showing a that you have illegally saved and quit on the stats menu for your playthrough.

### Other Miscellaneous Quality of Life Improvements

- <!-- "ui_hearts.png" --> The heart UI sprites have been slightly modified so that it is easier to see an empty heart container on a black background.
- <!-- SilenceMomDad --> The audio clips of mom and dad on the Ascent are silenced.
- <!-- ForceFadedConsoleDisplay --> The "faded console display" feature is automatically enabled in the "options.ini" file, which allows you to visually see when an error in the game happens. Please report bugs to the developers in [the Discord server](https://discord.gg/GwhUeQjHTF).
- <!-- PreventVictoryLapPopup --> Victory Laps and the "Rerun" feature on the main menu are banned for the same reason that R Key is. As a quality of life fix, the Victory Lap popup will no longer appear after defeating The Lamb.

<br>

## F.A.Q. (Frequently Asked Questions)

### How do I backup/restore/edit my randomizer save file?

The achievement randomizer save data is located in the following directory:

```text
C:\Program Files (x86)\Steam\steamapps\common\The Binding of Isaac Rebirth\data\isaac-achievement-randomizer
```

In this directory, there will be either a "save1.dat", "save2.dat", or "save3.dat" file, corresponding to which save slot that you play on.

It is important that you backup this file after every run.

### What is the latest version?

The latest version can always be found [on the Steam Workshop change notes page](https://steamcommunity.com/sharedfiles/filedetails/changelog/3050399093).

### Why does the mod take so long to randomize the achievements at the beginning of a playthrough?

When you start a new randomizer playthrough, the mod assigns each objective to a random unlock. However, not all assignments are valid. For example, the mod might have randomly assigned the objective of "beat challenge #3" to the unlock of "unlock challenge #3". In this case, the playthrough seed would be unbeatable!

After all of the achievements are randomized, the mod does a validation step: it pretends that it is a player and attempts to "beat" the seed by accomplishing all of the objectives that are reachable. (This part is pretty time intensive.) If the seed is not beatable, then the mod will start from scratch and randomize all of the objectives + achievements again. It will attempt to generate valid seeds until it finds one that is beatable. This is what the "attempts" count on the black screen refers to.

### Is this mod compatible with other mods that add items and achievements?

No. Since this mod uses a completely customized objective & unlock system based on vanilla items, it is not compatible with any other mods.

### Will this mod affect my existing achievements on Steam?

No. This mod requires a fully unlocked save file to play. Thus, it does not interact with any vanilla Steam achievements.

### What algorithm does the randomizer use to randomize the achievements?

It uses the random fill algorithm, as described [by TestRunner in the AGDQ 2019 randomizer panel](https://www.youtube.com/watch?v=vGIDzGvsrV8).
