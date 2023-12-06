# Achievement Randomizer Known Bugs

<!-- cspell:ignore Kirbyster -->

Some gameplay-related bugs are not fixable due to the limitations of the game's Lua API.

- When playing as Eden or Tainted Eden, at the beginning of every run, their random collectibles are removed and custom collectibles are selected. However, if the natural passive collectible was Red Stew, then Eden will retain the damage bonus, because the damage bonus is not based on the presence of the collectible and there is no way to remove the damage bonus using the Lua API. (Reported by Kirbyster)
