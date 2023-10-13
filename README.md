# isaac-achievement-randomizer

## [READ THE MANUAL HERE](docs/about.md)

<!-- markdownlint-disable MD033 -->

Achievement Randomizer is a mod for [_The Binding of Isaac: Repentance_](https://store.steampowered.com/app/1426300/The_Binding_of_Isaac_Repentance/) that gives you the experience of playing through the game from scratch, unlocking each item one by one in a randomized way.

- Check out [the documentation](docs/about.md).
- Also see the [version history](docs/history.md).

<br>

## Credits

The mod was designed by Zamiel and [Gamonymous](https://github.com/Rchardon), with some help from [Moucheron Quipet](https://www.twitch.tv/moucheronquipet).

It is written in [TypeScript](https://www.typescriptlang.org/) using the [IsaacScript](https://isaacscript.github.io/) framework.

<br>

## Discord

For questions about playing the mod, or reporting bugs, or if you want to help develop the mod, contact us in the [Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF). (Discord is a voice and text chat application that allows anyone to create a hosted server. We use one such server as the primary hub of communication for Isaac streaking.)

<br>

## How To Play

<!--

For normal people, you can play the mod by subscribing to it on [the Steam Workshop](https://steamcommunity.com/app/250900/workshop/). (Subscribing to the mod will automatically download and install it once you launch the game.)

-->

The mod is not yet released on the Steam Workshop, since it is still in development. The alpha version will be released soon!

<br>

## How To Compile

If you are a developer, you can play the mod by compiling the TypeScript code into a "main.lua" file. Perform the following steps:

- Download and install [Node.js](https://nodejs.org/en/download/) (Windows Installer .msi, 64-bit).
- Download and install [Git](https://git-scm.com/download/win) (64-bit Git for Windows setup).
- Download (or clone) this repository:
  - Click on the "Code" button in the top-right-corner of this page.
  - Click on "Download ZIP".
- Unzip the zip file to a new directory.
- Open up the repository folder and double-click on the `run.sh` script. If prompted, choose to open it with Git for Windows. You will see a Git Bash terminal window open.
- The script might ask you some questions, like which save file that you use for testing.
- If the script is successful, you will see "Compilation successful." (You can continue to leave the terminal window open; it will monitor for changes in your project, and recompile if necessary.)
- Completely close Isaac if it is already open, and then open the game again, and the mod should be in the list of mods. You can now play or test the mod.
