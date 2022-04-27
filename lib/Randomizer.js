const fs = require('fs');
const path = require('path');
const process = require('process');
const Rand = require('./Rand')
const CheatNan = require('./CheatNan')
const DatabaseReader = require('./DatabaseReader')
const EntityEditor = require('./EntityEditor')
const ExecutableEditor = require('./ExecutableEditor')

class Randomizer {
    constructor(cwd) {
        // replace process.getcwd with whatever it needs to be replaced by for electron
        this.gamePath = cwd || process.cwd();
        this.contentPath =  path.join(this.gamePath, 'Content');
        this.backupContentPath = path.join(this.gamePath, 'Content-backup')
        this.exeFile = path.join(this.gamePath, 'Crystal Project.exe');
        this.backupExeFile = path.join(this.gamePath, 'Crystal Project.exe.bak');
    }

    createBackups() {
        // Create backup files only if they arent here yet
        if (!fs.existsSync(this.backupExeFile)) {
            fs.cpSync(this.exeFile, this.backupExeFile)
        }
        if (!fs.existsSync(this.backupContentPath)) {
            fs.cpSync(this.contentPath, this.backupContentPath, {recursive: true})
        }
    }

    restoreBackups(deleteBackups) {
        // Restore the backups to their real directory
        // if deleteBackups is set, remove our backups entirely
        if (fs.existsSync(this.backupExeFile)) {
            if(fs.existsSync(this.exeFile)) {
                fs.rmSync(this.exeFile);
            }
            fs.cpSync(this.backupExeFile, this.exeFile)

            if(deleteBackups) {
                fs.rmSync(this.backupExeFile);
            }
        }
        if (fs.existsSync(this.backupContentPath)) {
            if(fs.existsSync(this.contentPath)) {
                fs.rmSync(this.contentPath, {recursive: true});
            }
            fs.cpSync(this.backupContentPath, this.contentPath, {recursive: true})

            if(deleteBackups) {
                fs.rmSync(this.backupContentPath, {recursive: true});
            }
        }
    }

    async randomize(options, seed) {
        if(!fs.existsSync(this.exeFile) && !fs.existsSync(this.contentPath)) {
            console.error('Crystal Project files not found. This must be run within the crystal project executable folder.');
            return "Crystal Project files not found. This must be run within the crystal project executable folder.";
        }

        this.createBackups();
        this.restoreBackups();

        Rand.resetGenerator();

        const dbReader = new DatabaseReader(this.contentPath);
        const entityEditor = new EntityEditor(this.contentPath);
        const exeEditor = new ExecutableEditor(this.gamePath);
    
        console.log('Reading database files');
        dbReader.readFiles();
        console.log('Loading entities');
        entityEditor.loadEntities();
        console.log('Loading executable');
        exeEditor.loadExe();
    
        if (options.jobOptions.enable) {
            console.log('Swapping Jobs');
            let randomizedJobs = null;
            if (options.jobOptions.customJobPool && options.jobOptions.customJobPool.length > 0) {
                randomizedJobs = Rand.shuffle(customJobPool);
            } else {
                randomizedJobs = Rand.shuffle(dbReader.getJobIds());
            }
            if (options.jobOptions.numberOfJobs > 0) {
                randomizedJobs = randomizedJobs.slice(0, options.jobOptions.numberOfJobs);
            }
            entityEditor.swapJobs(randomizedJobs.slice(options.jobOptions.startingJobs, options.jobOptions.startingJobs + options.jobOptions.crystalJobs));
            exeEditor.changeStartingJobs(randomizedJobs.slice(0, options.jobOptions.startingJobs));
            exeEditor.changePickedJobs(randomizedJobs.slice(0, 4));
        }
    
        if(options.itemOptions.includeTreasures || options.itemOptions.includeShops || options.itemOptions.includeMajorNpcItems || options.itemOptions.includeOres || options.itemOptions.includeMasterySeals || options.itemOptions.includeMinorNpcItems) {
            console.log('Swapping items');
            const [shuffledShopItems] = await entityEditor.shuffleItems(options.itemOptions);
            dbReader.fixItemPrices(shuffledShopItems);
        }
    
        if (options.monsterOptions.swapMonsters) {
            console.log('Swapping Monsters');
            entityEditor.shuffleMonsters(options.monsterOptions);
        }
    
        if(options.monsterOptions.shuffleMonsterDrops) {
            console.log('Swapping Monster Drops');
            dbReader.shuffleMonsterDrops();
        }
    
        if(options.monsterOptions.shuffleMonsterSteals) {
            console.log('Swapping Monster Steals');
            dbReader.shuffleMonsterSteals();
        }
    
        if (options.crystalOptions.enable) {
            console.log('Moving Crystals');
            entityEditor.moveCrystals(options.crystalOptions);
        }
    
        if (options.cheatNanOptions.quintarPass || options.cheatNanOptions.homePointStone || options.cheatNanOptions.quintarFlute ||
            options.cheatNanOptions.salmonViolin || options.cheatNanOptions.owlDrum || options.cheatNanOptions.ibekBell ||
            options.cheatNanOptions.salmonCello || options.cheatNanOptions.goldenQuintar || options.cheatNanOptions.maps) {
            console.log('Creating Cheat Nan')
            const mapIds = dbReader.getMapIds();
            const cheatNan = new CheatNan(options.cheatNanOptions, mapIds)
            entityEditor.addEntity(cheatNan.createCheatNan())
        }
    
        // Change save directory to protect non-rando saves
        exeEditor.changeSaveDirectory();
        exeEditor.changeDeleteDirectory();
    
        console.log('Saving entities');
        entityEditor.saveEntities();
        console.log('Saving database');
        dbReader.writeFiles();
        console.log('Saving executable');
        exeEditor.saveExe();
    }
}

module.exports = Randomizer;