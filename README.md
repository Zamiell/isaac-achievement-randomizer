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

For questions about playing the mod, or reporting bugs, contact us in the [Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF). (Discord is a voice and text chat application that allows anyone to create a hosted server. We use one such server as the primary hub of communication for Isaac streaking.)

<br>

## How To Play

For normal people, you can play the mod by subscribing to it on [the Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3050399093). (Subscribing to the mod will automatically download and install it once you launch the game.)

<br>

## Installation for Development

Achievement Randomizer is open source and anyone can help contribute to make the mod better. If you are interested in helping, this section will help you get started. If you get stuck, post a message in the `#randomizer-development` channel on the [Isaac Streaking Discord server](https://discord.gg/GwhUeQjHTF).

- Before working with this repository, you should first become a familiar with IsaacScript. Follow the steps on [the IsaacScript getting started documentation](https://isaacscript.github.io/docs/getting-started). Once you have created a test mod and verified in-game that everything works the way it should, read on.
- Download and install [Git](https://git-scm.com/), if you do not have it already.
- Open a new [command prompt window](https://www.howtogeek.com/235101/10-ways-to-open-the-command-prompt-in-windows-10/). (Or, feel free to use Windows Terminal, PowerShell, Git Bash, etc.)
- Configure Git, if you have not done so already:
  - `git config --global user.name "Your_Username"`
  - `git config --global user.email "your@email.com"`
- Fork the repository by clicking on the button in the top-right-hand-corner of the repository page.
- Clone your forked repository:
  - `cd [the path where you want the code to live]` (optional)
  - If you already have an SSH key pair and have the public key attached to your GitHub profile, then use the following command to clone the repository via SSH:
    - `git clone git@github.com:[username]/isaac-achievement-randomizer.git`
    - (Replace "[username]" with your GitHub username.)
  - If you do not already have an SSH key pair, then use the following command to clone the repository via HTTPS:
    - `git clone https://github.com/[username]/isaac-achievement-randomizer.git`
    - (Replace "[username]" with your GitHub username.)
- Enter the cloned repository:
  - `cd isaac-achievement-randomizer`
- Install Yarn, if you have not done so already:
  - `corepack enable`
- Install dependencies:
  - `yarn install`
- Run IsaacScript, which will compile the mod and copy it to your "mods" folder:
  - `npx isaacscript`
