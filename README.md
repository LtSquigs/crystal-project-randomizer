# crystal-project-randomizer
This application is used to randomized the game The Crystal Project with various options.

**Important Note:** This randomization is done in place to the executable and data files.
The randomizer makes backup files that can be restored after randomization. Or the user can use Steam to redownload the game.

The randomizer also edits the EXE to use a different Save directory than the original game, so that the original games save files are not disturbed by randomized games.

## Example of UI and Options
<div>
<img width="400" alt="Screen Shot 2022-04-27 at 3 48 43 PM" src="https://user-images.githubusercontent.com/1436831/165628334-ddfe174e-5d4e-4178-ae04-d0ccc1968a43.png">
<img width="400" alt="Screen Shot 2022-04-27 at 3 48 59 PM" src="https://user-images.githubusercontent.com/1436831/165628370-ade90346-947c-4a84-8674-a3b60091de09.png">
</div>

## How To Use
Download the latest release, and run the EXE from it in the same directory as the `Crystal Project.exe` and `Content` folders.

## How To Restore Backups
The randomizer makes backups called `Crystal Project.exe.bak` and `Content-backup` that contain the original files. To restore them just rename them and replace the modified files.

## Randomizer Options

### Job Shuffling

These options change what jobs you start with and what jobs the crystals give.

- **Enable Job Shuffling**: When enabled, all the jobs that are in the job pool will be distributed randomly among the starting jobs and crystal jobs.
- **Starting Jobs**: How many jobs you start with unlocked (1-6)
- **Crystal Jobs**: How many jobs are distributed among the crystals. (0-18)
- **Job Pool**: What jobs are included in the randomization pool. If none are selected than all the jobs will be included.

If there are less than 24 jobs total between all of these options options, multiple crystals may be given the same job.

### Item Shuffling

These options shuffle items between various entities. Each option adds items from those entities to the overall pool, which are distributed amongst the other entites.

- **Shuffle Treasure Chests**: Adds all Chests to the shuffle pool (535 items)
- **Shuffle Shop Inventories**: Adds shop inventories to the pool. (283 items) Does not include the Lost and Found or shops that use Recipies. An item shuffled into a shop has the price of the item that was there before.
- **Shuffle Major NPC Items**: Adds major items that NPCs give you to the list. (18 items) Mainly includes mount items, passes, and a few keys that involve progression.
- **Shuffle Ores**: Adds all the ore spots. Silver/Gold/Diamond ore, ingots, and dust. (165 items)
- **Shuffle Mastery Seals**: Adds the mastery seals from job masters to the pool. (24 items)
- **Shuffle Minor Npcs**: Adds any item from npcs not included in the above (shinies, crabs, squirrels, penguins, etc.) (146 items)

### Monster Shuffle Settings

These options are related to shuffling monster related things around. The pools for this shuffle are not shared with the item shuffle.

- **Shuffle Monsters**: Shuffles monster encounters. Whole sparks are shuffled, so if a spark had 2 encounters, those 2 encounters will always be together.
- **Include Unique Monsters**: Whether or not to include unique monsters like bosses
- **Include Key Quintar**: Whether to include the Fancy Quintar and Brutish Quintar that are used to get the Quintar Pass and Whistle.
- **Shuffle Monster Drops**: Shuffles monster drop tables between monsters. Monsters have the same number of drops no matter what.
- **Shuffle Monster Steals**: Shuffles monster steal tables betweeb monsters. Unsure if this affects Lost and Found.

### Crystal Shuffle Settings

This option determines if crystal shuffling is enabled. When it is enabled the crystals physical positions will be shuffled between the original locations
and new hand picked locations. (A list of which can be found [here](https://github.com/LtSquigs/crystal-project-randomizer/blob/main/lib/EntityEditor.js#L343)

- **Shuffle Crystals**: Shuffles crystals between locations
- **Include Original Locations**: Whether or not to include the original crystal locations in the shuffle list.

### Cheat Nan Options

These options, when enabled, will cause a nan to be spawend in the intro meadow that when talked to will give you the items selected.

These items are not removed from the shuffle pool for items.

I will not list all the options here, but an important note: The items are given one at a time, so the more you select, the longer it takes to get the items.

### Settings

- **Seed**: The seed used to randomize the game. If you set the same seed as someone else, should produce same randomization.
- **Configuration String**: Used to quickly load or save a configuration
