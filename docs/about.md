# Achievement Randomizer

<!-- markdownlint-disable MD033 -->

Achievement Randomizer is a mod for [_The Binding of Isaac: Repentance_](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) that gives you the experience of playing through the game from scratch, unlocking each item one by one in a randomized way.

This page explains how it works.

<br>

## Table of Contents

1. [Design Principles](#design-principles)
2. [Objective List](#objective-list)
3. [Progression](#progression)
4. [Other Features](#other-features)

<br>

## Design Principles

This mod **does not** simply randomize all of the vanilla achievements. This is for several reasons:

1. [Other mods](https://steamcommunity.com/sharedfiles/filedetails/?id=2838967057) have already done that.
1. Some of the vanilla achievements do not make sense in the context of a player trying to "beat the game" in the least amount of death possible, like `The Scissors - Die 100 times` or `Mr. Resetter! - Reset 7 times in a row`. (This would make the minimum amount of deaths always be 100.)
1. Some vanilla achievements do not make sense in the context of a player trying to "beat the game" in the fastest time possible, like `Dedication - Participate in 31 Daily Challenges`. (This would make the minimum amount of time always be 31 days.)
1. Some vanilla achievements are arbitrary conditions and are not very fun to play, like `They will charge you up... for a small fee - Donate to Battery Bums until they pay out with an item 5 times`. (If you are not lucky enough to get this achievement during your streak, the most consistent strategy is to reset as Tainted Keeper in Greed Mode until you see a Battery Bum in the shop. This is "busywork" and is not skill-based in any way.)
1. Many things are not gated behind vanilla achievements and it would be fun if they were (e.g. soul hearts, locked chests).

Thus, this mod locks almost everything behind custom achievements that actually represent meaningful accomplishments inside of the game.

<br>

## Objective List

Note that all objectives must be completed on hard mode.

### Character-Based Objectives

Each character will unlock something upon defeating the following bosses/objectives:

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
12. Mom's Heart (in Mausoleum/Gehenna)
13. Mother
14. Dogma
15. The Beast

Additionally, each character other than The Lost and Tainted Lost will unlock something upon clearing the following floors without taking damage:

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

- There are 34 main characters.
- There are 15 boss objectives and 18 floor objectives, which makes 33 in total.
- Thus, since The Lost & Tainted Lost do not have floor objectives, there are 34 x 33 - 18 x 2 = 1086 character-based objectives.

### Challenge-Based Objectives

There is one achievement for completing each challenge. Thus, there are 45 challenge-based achievements.

### Total

There are 1086 + 45 = 1131 objectives in total.

<br>

## Progression

### Characters

- The first character unlocked will always be Isaac. All other characters start off locked.
- Each character is guaranteed to unlock another random character.

### Paths

- The following places start off locked and are inaccessible:
  - The Chest
  - The Dark Room
  - Mega Satan
  - Boss Rush
  - Blue Womb
  - The Void
  - Repentance floors
  - The Ascent
  - Greed Mode
- Isaac is guaranteed to unlock both The Chest & Dark Room from one of his easier objectives.
- The rest of the places can be randomly unlocked from any objective.

### Challenges

All challenges start off locked.

### Collectibles <!-- 5.100 -->

Every collectible in the game is locked behind a random objective, with the following exceptions:

- 7 collectibles from the Treasure Room pool (#0):
  - Tiny Planet (#233)
  - Best Bud (#274)
  - Isaac's Heart (#276)
  - Strange Attractor (#315)
  - Key Bum (#388)
  - Hush (#470)
- 5 collectibles from the Shop pool (#1):
  - Ladder (#60)
  - Fanny Pack (#204)
  - Piggy Bank (#227)
  - King Baby (#472)
  - Options (#670)
- 5 collectibles from the Boss Room pool (#2):
  - Breakfast (#25) (HP)
  - Wooden Spoon (#27) (speed)
  - Mom's Underwear (#29) (range)
  - Wire Coat Hanger (#32) (tears)
  - Cat-O-Nine-Tails (#165) (damage)
- 5 collectibles from the Devil Room pool (#3):
  - Quarter (#74)
  - Blood Rights (#186)
  - Missing Page 2 (#262)
  - Shade (#468)
  - Pound of Flesh (#672)
- 5 collectibles from the Angel Room pool (#4):
  - Guardian Angel (#112)
  - Stigmata (#138)
  - Prayer Card (#146)
  - Holy Grail (#184)
  - Sworn Protector (#363)
- Quest collectibles (except for The Polaroid and the Negative):
  - Key Piece 1 (#238)
  - Key Piece 2 (#239)
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
  - Damocles (Passive) (#656)
  - Recall (#714)
  - Hold (#715)
- Banned collectibles in this mod:
  - Plan C (#475) (would trivialize some difficult boss objectives)
  - Clicker (#482) (would break harder character objectives)
  - R Key (#636) (would trivialize some difficult objectives)

Also note that:

- Even if Ankh (#161) is unlocked, it is removed from pools until all of the Blue Baby objectives are completed.
- Even if Judas' Shadow (#311) is unlocked, it is removed from pools until all of the Judas objectives are completed.
- Even if Lazarus Rags (#332) is unlocked, it is removed from pools until all of the Lazarus objectives are completed.

### Trinkets <!-- 5.350 -->

Every trinket in the game is locked behind a random objective, with the following exceptions:

- Banned trinkets in this mod:
  - 'M (#138) (would break collectible unlocks)

If no trinkets are unlocked, trinkets will be converted to pennies.

Also note that:

- Even if Mysterious Paper (#21) or Missing Poster (#23) are unlocked, they are removed from pools until all of The Lost objectives are completed.

### Cards & Runes <!-- 5.300 -->

Every card/rune in the game is locked behind a random objective (except for Rune Shard, which will never spawn). If no cards/runes are unlocked, cards/runes will be converted to pennies.

### Pills <!-- 5.70 -->

- Every pill effect in the game is locked behind a random objective. If no pill effects are unlocked, pills will be converted to pennies.
- Gold pills are locked behind a random objective.
- Horse pills are locked behind a random objective.

### Other Pickups

- Only half red heart pickups start as being unlocked. Every other heart pickup in the game is locked behind a random objective.
- Only pennies start as being unlocked. Every other coin in the game is locked behind a random objective.
- Only normal bomb pickups start as being unlocked. Every other bomb pickup in the game is locked behind a random objective.
- Only normal key pickups start as being unlocked. Every other key pickup in the game is locked behind a random objective.
- Every battery type in the game is locked behind a random objective. If no batteries are unlocked, batteries will be converted to pennies.
- Every sack type in the game is locked behind a random objective. If no sack are unlocked, sacks will be converted to pennies.
- Only normal chests start as being unlocked. Every other chest type in the game is locked behind a random objective.

<br>

## Other Features

### Dead Sea Scrolls Integration

The mod comes with an in-game menu called _Dead Sea Scrolls_. (This is the same menu that is used in other mods, like [_Fiend Folio_](https://steamcommunity.com/sharedfiles/filedetails/?id=2851063440).) You can open the menu by pressing `c` after starting a run.

The menu will show you how many objectives you have left in your streak and other information.

### Death Tracker

The mod includes a death tracker. If you are a streaker, try to complete the randomizer with as few deaths as possible! (Starting a new run without finishing the previous run counts as a death.)

### Timer

The mod includes an on-screen timer, similar to the [Racing+](https://isaacracing.net/) mod. The timer starts off hidden by default, but you can enable it in the Dead Sea Scrolls menu. If you are a speedrunner, try to complete the randomizer as fast as possible!

Unlike the timer in Racing+, the timer in this mod tracks in-game time. Thus, the timer will be paused when the game is paused or when you are in the main menu.

### Eden TMTRAINER Handling

In this mod, Eden can never start with TMTRAINER. (This is a quality of life fix for a convention taken from the Isaac streaking community, because starting TMTRAINER is unfair for streaking purposes. For example, a TMTRAINER collectible could have the effect of `when enemy dies --> spawn another enemy`, making the run impossible to complete.)

### Pause Prevention

The mod prevents you from pausing the game in uncleared rooms in order to prevent pause abuse. (This is a rule taken from the Isaac streaking community.)

### Save & Quit Prevention

The mod prevents you from using the save & quit feature of the game in order to prevent save & quit abuse. If you try to resume a game, the mod will restart you back at the beginning. (This is a rule taken from the Isaac streaking community.)

### Softlock Prevention

Since saving & quitting is prevented, the mod will attempt to fix as many vanilla softlocks as possible. The following situations are fixed:

#### Mega Mush + Lucky Pennies

Lucky Pennies are automatically converted to normal pennies while the Mega Mush effect is active.

<br>
