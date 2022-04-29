const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");
const deepSearch = require('../deep-search-json');
const Rand = require('./Rand')

class EntityEditor {
    constructor(contentPath) {
        this.contentPath = contentPath;
        this.file = 'field';
        this.worldZip = null;
        this.fileHeader = null;
        this.entityLedger = null;
        this.zipDataCache = null;
        this.entityFiles = null;
        this.beforeBytes = null;
        this.mysteriousBytes = null;
        this.endingBytes = null;
    }

    voxelCoordFromGlobal(coord) {
        // Voxel Coords are used to determine which zip and subsequent file an entity is defined in.
        // Voxel Coords are in chunks of 16 (as a voxel is 16x16x16)
        // e.g. Voxel 0 = 0 to 15, Voxel 1 = 16 to 31
        // Voxel -1 = -16 to -1
        
        const voxelSize = 16;
        return Math.floor(coord/16);
    }

    parseEntityLedger(line) {
        // This converts a line from the entity ledger into a more usable object format
        // entity leder lines are in teh format <id>:<x>,<y>,<z>:<voxelX>,<voxelY>,<voxelY>
        const parts = line.split(':');
        const id = parts[0];
        const coords = parts[1].split(',');
        const voxelCoords = parts[2].split(',');

        return {
            id: id,
            coords: {
                x: coords[0],
                y: coords[1],
                z: coords[2]
            },
            voxelCoords: {
                x: voxelCoords[0],
                y: voxelCoords[1],
                z: voxelCoords[2]
            }
        }
    }

    createEntityLedger(entity) {
        // This converts entity objects back into plaintext lines
        const id = entity.ID;
        const coords = entity.Coord;
        const x = coords.X;
        const y = coords.Y;
        const z = coords.Z;
        const voxelX = this.voxelCoordFromGlobal(x);
        const voxelY = this.voxelCoordFromGlobal(y);
        const voxelZ = this.voxelCoordFromGlobal(z);


        return `${id}:${x},${y},${z}:${voxelX},${voxelY},${voxelZ}`;
    }

    swapJobs(jobIds) {
        // Given a list of job Ids, go through every entity in every file and find all of them
        // that are Crystals, and assign them a new job.
        // This list of job Ids is applied in order, and it is assumed that it has already been randomized.
        const firstJob = jobIds.length > 0 ? jobIds[0] : 0;
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.CrystalData) {
                    if (jobIds.length > 0) {
                        entity.CrystalData.JobID = jobIds.shift();
                    } else { // Useful for the limited jobs option
                        entity.CrystalData.JobID = firstJob;
                    }
                }
            }
        }
    }

    async shuffleItems(options) {
        // This code is a mess, but I dont care at this poitn
        const allTreasure = [];

        // These are a list of blacklisted items depending on the categories selected by the user
        const npcShuffleEnabled = options.includeMajorNpcItems || options.includeMasterySeals || options.includeMinorNpcItems || options.includeOres;
        // Quintar Pass, Home Point Stone, Quintar Flute, Salmon Violin, Owl Drum, Ibek Bell, Pyramid Key, Salmon Cello, Ocarina, Ferry Pass, Luxury Pass, Skeleton Key, Luxury Pass V2
        const majorNpcItems = ['1,7','1,19','1,39','1,48','1,49','1,50','1,60','1,114','1,115','1,37','1,93','1,147','1,148'];
        // Every jobs mastery accessory
        const masterSeals = ['2,564','2,565','2,566','2,567','2,568','2,569','2,570','2,571','2,572','2,573','2,574','2,575','2,576','2,577','2,578','2,579','2,580','2,581','2,582','2,583','2,584','2,585','2,586','2,587'];
        // Ores, Dust, and Ingons for Silver, Gold, and Diamond
        const ores = ['1,3','1,4','1,5','1,67','1,68','1,69','1,70','1,71','1,72'];

        // This variable is used to keep a map of shop items and what replaces them.
        // We want to make sure that if one shop item is replaced by an item, its replaced by
        // that same item in other shops. As shops are meant to be linked in this sense.
        // (e.g. Gold Armor in one shop is effectively the same as in another shop)
        const shopTreasureMap = {};

        // For our first step, we go through every entity in every file and check to see if it is either a Treasure box
        // or and NPC (Shop or NPC script)
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                // Having TreasureData indicates this is a Treasure Box.
                // No special logic needs to be done here, can just add this to the treasure pool if enabled.
                if(options.includeTreasures && entity.TreasureData && entity.TreasureData.LootType != 0) {
                    allTreasure.push({
                        LootType: entity.TreasureData.LootType,
                        LootValue: entity.TreasureData.LootValue
                    })
                }

                // Having NPC Data indicates this may be a Shop or have a Script to give items
                if(entity.NpcData) {
                    if(options.includeShops) {
                        // For shop data, because shops are meant to be linked
                        // we only add each item from the shop to the pool *once* and make a map
                        // that will be later used to mapethat one item across the shops.
                        await deepSearch(entity.NpcData, "ActionType", (obj) => {
                            // ActionType 5 = Shop action with stock data.
                            if (obj.ActionType == 5) {
                                if (obj.Data) {
                                    for(let item of obj.Data.Stock) {
                                        if(item.LootType != 0 && shopTreasureMap[item.LootType + ',' + item.LootValue] !== -1) {
                                            // We set the map value to a dummy value as its not mapped yet
                                            shopTreasureMap[item.LootType + ',' + item.LootValue] = -1
                                            allTreasure.push({
                                                LootType: item.LootType,
                                                LootValue: item.LootValue
                                            })
                                        }
                                    }
                                }
                            }
                        });
                    }

                    if(npcShuffleEnabled) {
                        await deepSearch(entity.NpcData, "ActionType", (obj) => {
                            // This ActionType is used when an npc gives the player an item directly.
                            if (obj.ActionType == 8) {
                                if (obj.Data) {
                                    const itemKey = `${obj.Data.LootType},${obj.Data.LootValue}`;
                                    if (!options.includeMajorNpcItems && majorNpcItems.includes(itemKey)) {
                                        return;
                                    }
                                    if (!options.includeMasterySeals && masterSeals.includes(itemKey)) {
                                        return;
                                    }
                                    if (!options.includeOres && ores.includes(itemKey)) {
                                        return;
                                    }
                                    // minor items are any item not in the other list
                                    if (!options.includeMinorNpcItems && !ores.includes(itemKey) && !masterSeals.includes(itemKey) && !majorNpcItems.includes(itemKey)) {
                                        return;
                                    }
                                    if (obj.Data.LootType !== 0) {
                                        allTreasure.push({
                                            LootType: obj.Data.LootType,
                                            LootValue: obj.Data.LootValue,
                                        })
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        // If all the items were disabled, just send an empty array.
        if (allTreasure.length === 0) {
            return [[]];
        }

        const shuffledTreasure = Rand.shuffle(allTreasure);

        // Now that we have shuffled the treasure, we have to assign the items to the shops before
        // we do anything else.
        // This is because shops cant sell treasures of type 3 (e.g. money), so to ensure we have enough
        // to fill the shops we do them seperately, even if it adds a tiny bias to the randomness.
        const seenShopItems = {};
        if(options.includeShops) {
            for(let key in this.entityFiles) {
                const entityFile = this.entityFiles[key];
                for(let entity of entityFile) {
                    if(entity.NpcData) {
                        await deepSearch(entity.NpcData, "ActionType", (obj, path) => {
                            // deepSearch returns a copy of the object, but we need to edit in place
                            // so we use this path array to retrieve the original object we want to edit.
                            let searchObj = entity.NpcData;
                            for(let key of path) {
                                searchObj = searchObj[key];
                            }
                            if (searchObj.ActionType == 5) {
                                if (searchObj.Data) { 
                                    for(let item of searchObj.Data.Stock) {
                                        if(item.LootType !== 0) {
                                            let newItem = shopTreasureMap[item.LootType + ',' + item.LootValue];
                                            if (newItem === -1) {
                                                // Havent mapped this one yet, lets grab a random item! It needs to be of type 1 or 2
                                                newItem = allTreasure.shift();
                                                while(!(newItem.LootType === 1 || newItem.LootType === 2) || seenShopItems[newItem.LootType + ',' + newItem.LootValue]) {
                                                    allTreasure.push(newItem);
                                                    newItem = allTreasure.shift();
                                                }

                                                // This prevents one item being mapped to two things, just simplifies life
                                                seenShopItems[newItem.LootType + ',' + newItem.LootValue] = true;
                                                shopTreasureMap[item.LootType + ',' + item.LootValue] = newItem;
                                            }
                                            
                                            item.LootType = newItem.LootType;
                                            item.LootValue = newItem.LootValue;
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }

        // Now for the NPCS and Treasure Chests we swap them
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                // Swapping treasure is easy, just pop an item off and put it in the chest
                if(options.includeTreasures && entity.TreasureData && entity.TreasureData.LootType !== 0) {
                    const newTreasure = shuffledTreasure.shift();
                    entity.TreasureData.LootType = newTreasure.LootType;
                    entity.TreasureData.LootValue = newTreasure.LootValue;
                }

                if(npcShuffleEnabled) {
                    await deepSearch(entity.NpcData, "ActionType", (obj, path) => {
                        // Just like the shop entities, we need to use path to get to the original object
                        // as we need to edit in place.
                        let searchObj = entity.NpcData;
                        for(let key of path) {
                            searchObj = searchObj[key];
                        }
                        if (searchObj.ActionType == 8) {
                            if (searchObj.Data) {
                                const itemKey = `${searchObj.Data.LootType},${searchObj.Data.LootValue}`;
                                if (!options.includeMajorNpcItems && majorNpcItems.includes(itemKey)) {
                                    return;
                                }
                                if (!options.includeMasterySeals && masterSeals.includes(itemKey)) {
                                    return;
                                }
                                if (!options.includeOres && ores.includes(itemKey)) {
                                    return;
                                }
                                // minor npc items are any items not in the other categories.
                                if (!options.includeMinorNpcItems && !ores.includes(itemKey) && !masterSeals.includes(itemKey) && !majorNpcItems.includes(itemKey)) {
                                    return;
                                }
                                if (searchObj.Data.LootType !== 0) {
                                    const newTreasure = shuffledTreasure.shift();
                                    searchObj.Data.LootType = newTreasure.LootType;
                                    searchObj.Data.LootValue = newTreasure.LootValue;
                                }
                            }
                        }
                    });
                }
            }
        }

        // We return the map we had of shuffled shop items, so that we can fix their prices with the DBReader
        return [shopTreasureMap];
    }

    shuffleMonsters(options) {
        // Shuffles all Sparks in the game so that they contain different monsters.
        // If a spark contains multiple troops, those groupings are kept together when they
        // are moved to new sparks.
        const allTroops = [];
        // We use this to try to scale stats later
        const troopMap = [];
        const hasKeyQuintar = (sparkData) => {
            let hasQuintar = false;
            sparkData.TroopPages.forEach(troop => {
                // Troop: 59 and 90 are the IDs of the brutish quintar 
                // in the quintar sanctuary and the Fancy Quintar
                // boss used for quintar pass and quintar flute
                if (troop.TroopID == 59 || troop.TroopID == 90) {
                    hasQuintar = true;
                }
            });

            return hasQuintar;
        }

        // We grab a list of all the troop pages available
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.SparkData) {
                    if (!options.swapUniques && entity.SparkData.IsUnique) {
                        continue;
                    }
                    if (!options.swapMonsters &&  !entity.SparkData.IsUnique) {
                        continue;
                    }
                    if (!options.includeKeyQuintars && hasKeyQuintar(entity.SparkData)) {
                        continue;
                    }
                    allTroops.push({ IsUnique: entity.SparkData.IsUnique, troop: entity.SparkData.TroopPages })
                }
            }
        }

        const shuffledTroops = Rand.shuffle(allTroops); 

        // Assign the troops to new entities
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.SparkData) {
                    if (!options.swapUniques && entity.SparkData.IsUnique) {
                        continue;
                    }
                    if (!options.includeKeyQuintars && hasKeyQuintar(entity.SparkData)) {
                        continue;
                    }
                    if (!options.swapMonsters &&  !entity.SparkData.IsUnique) {
                        continue;
                    }
                    if(options.bossesToBosses) { // complex shuffle
                        let newTroops = shuffledTroops.shift();
                        // We shouldnt have to worry about an infinite loop here because there should be
                        // the same number of unique and non unique monsters in the new entity list as the
                        // old one
                        while(newTroops.IsUnique !== entity.SparkData.IsUnique) {
                            shuffledTroops.push(newTroops);
                            newTroops = shuffledTroops.shift();
                        }
                        if (newTroops.IsUnique) {
                            troopMap.push([entity.SparkData.TroopPages, newTroops.troop])
                        }
                        entity.SparkData.TroopPages = newTroops.troop;
                    } else { // simple shuffle
                        const newTroops = shuffledTroops.shift();
                        if (newTroops.IsUnique) {
                            troopMap.push([entity.SparkData.TroopPages, newTroops.troop])
                        }
                        entity.SparkData.TroopPages = newTroops.troop;
                    }
                }
            }
        }

        return troopMap;
    }

    moveCrystals(options) {
        // Moves crystals to new locations
        const crytalsToMove = [];

        let customPoints = [
            [-10, 122, -39], // In the overpas between spawning meadow and desert
            [-190, 157, -310], // On top of the CUBE
            [930, 91, -50], // In the middle of the ferries path
            [926, 10, -87], // In the depths
            [-88, 109, -368], // Salmon Bay Left Cliff Jutt
            [756, 207, -376], // Inside Eastern Chasm
            [293, 140, -102], // Delende, near the Giant Boss
            [380, 95, -33], // Seaside Cliffs right side, near the random Crab
            [172, 128, 37], // Mercury Shrine, to the left overpass to volcano already
            [332, 199, -331], // Boomer Society Balcony
            [97, 126, -204], // Center of lake delende
            [257, 62, 115], // Underwater crab cavern
            [270, 30, -586], // Underwater Quiz Cave (where item finder is)
            [170, 141, -255], // Salmon Pass in the little cave that connects the underpass to hte main river
            [400, 144, -237], // Under the bridge to the main town
            [700, 213, -320], // On Top of the Quintar Maosoleum
            [632, 246, -261], // On Top of the tree on top of the mountain near ninja (where autumn leaf is)
            [415, 205, -532], // On top of the  icelibrary (not very top, but in front of a window)
        ]

        // Go through each crystal and get its current location and store it in a list of crystals to move.
        // We need to seperate the objects from the entityFiles array, as the moveEntity function edits
        // the array directly, causing problems if we try to run it while iterating through it.
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.CrystalData) {
                    crytalsToMove.push({ from: key, entity: entity });
                    if (options.includeOriginalLocations) {
                        customPoints.push([entity.Coord.X, entity.Coord.Y, entity.Coord.Z]);
                    }
                }
            }
        }

        customPoints = Rand.shuffle(customPoints);

        // Move the crystals
        for(let crystal of crytalsToMove) {
            const p = customPoints.shift();
            this.moveEntity(crystal.from, { X: p[0], Y: p[1], Z: p[2] }, crystal.entity);
        }
    }

    addEntity(entity) {
        // Adds a new entity to the entity files. 
        // Does not work properly if the entity already exists! Only use for new entities.
        const voxelX = this.voxelCoordFromGlobal(entity.Coord.X);
        const voxelY = this.voxelCoordFromGlobal(entity.Coord.Y);
        const voxelZ = this.voxelCoordFromGlobal(entity.Coord.Z);
        const newEntityFile = `${voxelX},${voxelZ},${voxelY}`;

        if (!this.entityFiles[newEntityFile]) {
            // If there is not an existing entity file, we need to make the array for it
            // as well as create the entry in the corresponding zip file
            const zipKey = `${voxelX},${voxelZ}`;
            this.entityFiles[newEntityFile] = [];
            const zipMeta = this.zipDataCache[zipKey];
            
            if (!zipMeta) {
                // There is no existing zip file, we have to make one, which is annoying
                // I dont think this use case can ever actually happen though because
                // where would we be placing an entity with no existing voxels?
                // For now just log a warning and ignore it
                console.error("No existing voxel zip to place entity in");
                return;
            }

            const zip = zipMeta.data;
            // Just as an extra precaution we make sure the entry is not there already
            // before adding a new entry for it
            if (!zip.getEntry(`y${voxelY}e.json`)) {
                zip.addFile(`y${voxelY}e.json`, Buffer.from(JSON.stringify([])));
            }
        }

        // Finally we add the entity to the entityFile we just created/opened
        const newEntityJson = this.entityFiles[newEntityFile];
        newEntityJson.push(entity)
        this.entityFiles[newEntityFile] = newEntityJson;
    }

    moveEntity(from, to, entity) {
        // from here we expect to be the string key of the old entity file location
        // to here should be x,y,z global coordinates

        // First make sure we arent moving it to itself
        if (to.X == entity.Coord.X && to.Y == entity.Coord.Y && to.Z == entity.Coord.Z) {
            return;
        }

        // In order to move an entity, we need to change its internal X/Y/Z coords
        // and also which entityFile the entitiy is in.
        // If those are changed, the rest will automatically be handled by the save system.
        // NOTE: Its also important to not use this function within a loop iterating over entities
        // or entity files, as it will change those fields.
        entity.Coord.X = to.X;
        entity.Coord.Y = to.Y;
        entity.Coord.Z = to.Z;

        const voxelX = this.voxelCoordFromGlobal(to.X);
        const voxelY = this.voxelCoordFromGlobal(to.Y);
        const voxelZ = this.voxelCoordFromGlobal(to.Z);
        const newEntityFile = `${voxelX},${voxelZ},${voxelY}`;

        if (!this.entityFiles[newEntityFile]) {
            // If there is not an existing entity file, we need to make the array for it
            // as well as create the entry in the corresponding zip file
            const zipKey = `${voxelX},${voxelZ}`;
            this.entityFiles[newEntityFile] = [];
            const zipMeta = this.zipDataCache[zipKey];
            
            if (!zipMeta) {
                // There is no existing zip file, we have to make one, which is annoying
                // I dont think this use case can ever actually happen though because
                // where would we be placing an entity with no existing voxels?
                // For now just log a warning and ignore it
                console.error("No existing voxel zip to place entity in");
                return;
            }

            const zip = zipMeta.data;
            // Just as an extra precaution we make sure the entry is not there
            // already
            if (!zip.getEntry(`y${voxelY}e.json`)) {
                zip.addFile(`y${voxelY}e.json`, Buffer.from(JSON.stringify([])));
            }
        }

        const newEntityJson = this.entityFiles[newEntityFile];
        const oldEntityJson = this.entityFiles[from];

        // Finally we remove out entity from the old entity JSON file
        // and add it to the new entity JSON file
        this.entityFiles[from] = oldEntityJson.filter((oldEntity) => entity.ID !== oldEntity.ID);
        newEntityJson.push(entity)
        this.entityFiles[newEntityFile] = newEntityJson;
    }

    loadEntities() {
        // This loads all the entities in the field.dat into memory
        const worldFile = fs.readFileSync(path.join(this.contentPath, "Worlds", this.file + ".dat"));

        // The world file is actually just a Zip File, but with a small header of 2 bytes in front
        // used for versioning. We take off the header for later (to save it back) and open the zip
        // in memory.
        this.fileHeader = worldFile.slice(0, 2);
        this.worldZip = new AdmZip(worldFile.slice(2))

        // At the root of the worlds zip, is another .dat file named the same as the world itself
        // this dat file contains the entity information we are after (as well as other things)
        // We will refer to this internal .dat file as the entity dat.
        const entityDat = this.worldZip.getEntry(this.file + '.dat').getData();
        const entityArr = new Uint8Array(entityDat);

        // The structure of this entity dat is a set of different segments each with a header
        // before the segment describing the length of the segment after it
        // These segments as best I have figured out is:
        //    4 bytes that <header_length> which describes the length of the following region
        //    Region of <header_length> bytes that I suspect is a header of various metadata
        //    4 bytes for <ledger_length> which describes the length of the following region
        //    Region of <ledger_length> size, this contains in plaintext a ledger of the entities
        //    4 bytes for <num_zip_files> which describes the number of zip file entries in the file
        //    Region of <num_zip_files> * 16 length which contains metadata about the zip files
        //      This metadata is in the form of:
        //         4 bytes for X coordinate, 4 bytes for Z coordinate, 4 bytes for Offset, 4 bytes for Length
        //    4 bytes for of unknown data.
        //    4 bytes for <zip_file_length> which describes the full length of the following segment
        //    Region of <zip_file_length> size which contains zip files containing voxels and entities
        //      These zipfiles are described by the section above, the Offsets are relative to the start of this section
        //    4 bytes for unknown data (end signature? unclear)

        // First we read in data about the header
        const headerLength = entityDat.readInt32LE();
        const ledgerLength = entityDat.readInt32LE(4 + headerLength);

        // Now we load the entity ledger section.
        // This whole section is plaintext, where each line represents metadata about the entity (lines are ended by ;\r\n)
        // which is used to determine which zip file the entities data exists in.
        // In general we should only have to adjust this ledger in cases where we move an entity or create a new entity.
        const entityLedgerBuffer = Buffer.from(entityArr.slice(4 + headerLength + 4, 4 + headerLength + 4 + ledgerLength))
        this.entityLedger = entityLedgerBuffer.toString().split(';\r\n').filter((x) => !!x).map(this.parseEntityLedger);

        // Next we read the Zip data regions, which describe the number of zip files contained in the file and their location
        // within the file
        const numZipFiles = entityDat.readInt32LE(4 + 4 + headerLength + ledgerLength);
        const zipMetaRegionOffset = 4 + headerLength + 4 + ledgerLength + 4;        
        const zipRegionOffset = 4 + headerLength + 4 + ledgerLength + 4 + (numZipFiles * 16) + 4;
        const zipRegionSize = entityDat.readInt32LE(zipRegionOffset);
        const zipRegion = entityArr.slice(zipRegionOffset + 4, zipRegionOffset + 4 + zipRegionSize)

        // Now that we have all the offsets in the file, we can use them to store segments of this DAT file
        // for later use. When we write the file back out to disk these sections do not change ever, so
        // we store them in their raw form to write back out.
        this.beforeBytes = entityDat.slice(0, 4 + headerLength);
        this.mysteriousBytes = entityDat.slice(zipRegionOffset - 4, zipRegionOffset);
        this.endingBytes = entityDat.slice(zipRegionOffset + 4 + zipRegionSize);

        // Now we go through all the metadata information about zip files and we create an
        // index of these zip files in memory
        this.zipDataCache = {};
        for(let i = 0; i < numZipFiles; i++) {
            const zipData = {}
            zipData.x = entityDat.readInt32LE(zipMetaRegionOffset + (i * 16));
            zipData.y = entityDat.readInt32LE(zipMetaRegionOffset + (i * 16) + 4);
            zipData.offset = entityDat.readInt32LE(zipMetaRegionOffset + (i * 16) + 8);
            zipData.length = entityDat.readInt32LE(zipMetaRegionOffset + (i * 16) + 12);
            zipData.data = new AdmZip(Buffer.from(zipRegion.slice(zipData.offset, zipData.offset + zipData.length)))
            this.zipDataCache[zipData.x + ',' + zipData.y] = zipData;
        }

        // Finally, we want to grab all the entity JSON data to be able to edit them
        // To do this we just use the entity ledger to search the zip files we know have entities
        // and skip ones weve already loaded
        // If an entitiy is indicated as being in a zip file, then there will be a file called
        // y<num>e.json in the zip file (where num is the global y coord of the entity) that
        // contains a JSON list of all the entities at the y coordinate.
        this.entityFiles = {};
        for(let entity of this.entityLedger) {
            const voxelCoords = entity.voxelCoords;
            const zipKey = voxelCoords.x + ',' + voxelCoords.z;
            const entry = 'y' + voxelCoords.y + 'e.json';

            if (!!this.entityFiles[zipKey + ',' + voxelCoords.y]) {
                continue;
            }

            const zip = this.zipDataCache[zipKey].data;
            const entityJson = JSON.parse(zip.getEntry(entry).getData().toString());
            this.entityFiles[zipKey + ',' + voxelCoords.y] = entityJson;
        }
    }

    saveEntities() {
        // To save back this data we need to reconstruct the file

        // For every file in entityFiles, we turn the new JSON into a buffer
        // find the zip in the zipDataCache and overwrite the JSON file entry in that zip file
        // We also create the ledger information about the entities in the file
        const ledger = [];
        for(let key in this.entityFiles) {
            const parts = key.split(',');
            const zipKey = parts[0] + ',' + parts[1];
            const entryFile = 'y' + parts[2] + 'e.json';

            const zip = this.zipDataCache[zipKey].data;
            const entities = this.entityFiles[key];

            for(let entity of entities) {
                ledger.push(this.createEntityLedger(entity));
            }
            
            zip.getEntry(entryFile).setData(JSON.stringify(entities));
        }

        // The entity ledger ends with ';\r\n' so we have to tack it on to the end
        const ledgerBuff = Buffer.from(ledger.join(';\r\n') + ';\r\n');
        const leaderHeader = Buffer.alloc(4);
        leaderHeader.writeInt32LE(ledgerBuff.length);

        // For every zip in the zipDataCache, generate a buffer, get the size of each one
        // and concatenate all of them together, get the full region size.
        let curOffset = 0;
        let numZips = 0;
        const zipBuffers = [];
        const zipMetaBuffers = [];
        for(let key in this.zipDataCache) {
            const zipData = this.zipDataCache[key];
            const zipDataBuffer = zipData.data.toBuffer();

            // add the zip buffer
            zipBuffers.push(zipDataBuffer);

            // create the zipmetadata buffer
            const metadataBuffer = Buffer.alloc(16);
            metadataBuffer.writeInt32LE(zipData.x);
            metadataBuffer.writeInt32LE(zipData.y, 4);
            metadataBuffer.writeInt32LE(curOffset, 8);
            metadataBuffer.writeInt32LE(zipDataBuffer.length, 12);
            zipMetaBuffers.push(metadataBuffer);

            curOffset += zipDataBuffer.length;
            numZips++;
        }

        // Here we are just recreating the headers we read earlier, but with new lengths
        // to reflect the size of the files.
        const fullZipBuffer = Buffer.concat(zipBuffers);
        const fullMetadataBuffer = Buffer.concat(zipMetaBuffers);
        const fullZipHeader = Buffer.alloc(4);
        fullZipHeader.writeInt32LE(fullZipBuffer.length);
        const fullMetadataHeader = Buffer.alloc(4);
        fullMetadataHeader.writeInt32LE(numZips);

        // This is the full dat file
        const fullDatFile = Buffer.concat([
            this.beforeBytes,
            leaderHeader,
            ledgerBuff,
            fullMetadataHeader,
            fullMetadataBuffer,
            this.mysteriousBytes,
            fullZipHeader,
            fullZipBuffer,
            this.endingBytes
        ]);

        // Now that we have the full dat file, we overwrite the dat file in the original world dat file (which was really a zip)
        this.worldZip.getEntry(this.file + '.dat').setData(fullDatFile);
        // We append the original header bits to the start of the dat file and write it out
        const finalDat = Buffer.concat([this.fileHeader, this.worldZip.toBuffer()]);
        fs.writeFileSync(path.join(this.contentPath, "Worlds", this.file + ".dat"), finalDat);
    }
}

module.exports = EntityEditor;