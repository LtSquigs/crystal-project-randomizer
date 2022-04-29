const { app, ipcRenderer, contextBridge } = require('electron');
const crypto = require("crypto");

let settings = {
    jobOptions: {
        enable: true,                   // Swaps all the jobs the crystals give you and what jobs you start with
        startingJobs: 6,                // How many jobs you start with. Min 1. Max 6.
        crystalJobs: 18,                // How many jobs the crystals can give you. Min 0. Max 18.
        customJobPool: [],            // Array of job IDs to pull from instead of all of them. (For challenge runs)
    },
    itemOptions: {
        includeTreasures: true,         // 535 items, All Chests.
        includeShops: true,             // 283 items, Does not include Craft/Lost And Found. Items have the price of the item they swapped with.
        includeMajorNpcItems: false,    // 18 items, Passes/Mount Items/Crystal Rewards, No logic is done here to make sure it makes sense
        includeOres: false,             // 165 items, All the little ores around the map
        includeMasterySeals: false,     // 24 items, From talking to master and mastering a job
        includeMinorNpcItems: false,    // 146 items, Everything else from an npc interaction not in the above (squirrels, crabs, shineys, etc.)
    },
    monsterOptions: {
        swapMonsters: true,             // Swaps all flames to be other flames from anywhere in the game
        swapBosses: true,               // Swap bosses
        includeKeyQuintars: false,      // The Brutish Quintar (in the sewers adjacent area) and Fancy Quintar can be disabled to make Quintar Pass/Flute guaranteed.
        shuffleMonsterDrops: true,      // Shuffles the monster drops between monster drops, not from the greater item pool
        shuffleMonsterSteals: true,     // Shuffles the monster seels between monster steels, not from the greater item pool
        bossesToBosses: true,
        statScaleBosses: true,
        statScaleNormal: true,
    },
    crystalOptions: {
        enable: false,                   // Randomly Moves Crystals between 18 new spots, and the 18 original spots
        includeOriginalLocations: false, // Wether to include the original, or just the new spots
    },
    cheatNanOptions: {                  // Creates a Nan at the very start that can give you various items. THESE ITEMS ARE NOT REMOVED FROM THE RANDOM POOL.
        quintarPass: false,              // Quintar Renting Pass
        homePointStone: false,           // Teleport Stone that Astley gives you at the start (easy to miss)
        quintarFlute: false,             // Personal Quintar
        salmonViolin: false,            // Basic Salmon
        owlDrum: false,                 // Owl Friend
        ibekBell: false,                // GOAT
        salmonCello: false,             // Extra Salmon
        goldenQuintar: false,           // In order to give you the golden quintar, the nan gives you the codex, an egg, and an incubator, and you must hatch it
        maps: false                     // This gives all maps, takes a long time due to it needing to give each map in sequence.
    }
};

let seed = crypto.randomBytes(20).toString('hex');

contextBridge.exposeInMainWorld('Randomizer',  {
    updateSettings: (optionKey, value) => {
        let curObj = settings;
        let keyParts = optionKey.split('.');
        for(let i = 0; i < keyParts.length; i++) {
            let key = keyParts[i];
            if (i === (keyParts.length - 1)) {
                curObj[key] = value;
            }
            curObj = curObj[key];
        }
    },

    updateJobPool: (jobId, inPool) => {
        if (inPool && settings.jobOptions.customJobPool.indexOf(jobId) === -1) {
            settings.jobOptions.customJobPool.push(jobId);
        }
        if (!inPool && settings.jobOptions.customJobPool.indexOf(jobId) !== -1) {
            settings.jobOptions.customJobPool = settings.jobOptions.customJobPool.filter(id => id != jobId);
        }
    },

    updateSettingsFull: (newSettings) => {
        settings = newSettings;
    },

    getSettings: () => {
        return settings;
    },

    changeSeed: (newSeed) => {
        seed = newSeed;
    },
    
    getNewSeed: () => {
        seed = crypto.randomBytes(20).toString('hex');
    },

    getSeed: () => {
        return seed;
    },

    randomize: async (options, seed) => {
        return await ipcRenderer.invoke('randomize', options, seed);
    },

    registerEventCallback: (eventCallback) => {
        ipcRenderer.on('randomize-event', (e, message) => {
            console.log('wtf')
            eventCallback(message);
        });
    }
});

