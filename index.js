const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");
const deepSearch = require('./deep-search-json');
const { exit } = require('process');

const GAME_PATH = "";

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

const makeCheatNan = (options, mapIds) => {
    let itemIds = [];
    if (options.quintarPass) itemIds.push(7);
    if (options.homePointStone) itemIds.push(19);
    if (options.quintarFlute) itemIds.push(39);
    if (options.salmonViolin) itemIds.push(48);
    if (options.owlDrum) itemIds.push(49);
    if (options.ibekBell) itemIds.push(50);
    if (options.salmonCello) itemIds.push(114);
    if (options.goldenQuintar) {
        itemIds.push(115);
        itemIds.push(167);
        itemIds.push(201);
    }
    if (options.maps) {
        itemIds = itemIds.concat(mapIds);
    }

    const preItemActions = [ 
        {
            "ActionType": 0,
            "Data": null
        },
        {
            "ActionType": 1,
            "Data": {
            "Message": "It's a secret to everybody...",
            "NpcKey": null,
            "Choices": [],
            "AnswerVariableKey": null,
            "ShowPartyStatus": false
            }
        }
    ]
    const postItemActions = [
        {
            "ActionType": 6,
            "Data": {
            "Scope": 0,
            "EntityKey": null,
            "VariableKey": "Obtained",
            "VariableType": 0,
            "Flag": true,
            "Number": 0,
            "SourceVariableScope": 0,
            "SourceVariableKey": null,
            "LootType": 0,
            "LootValue": 0
            }
        },
        {
            "ActionType": 2,
            "Data": null
        },
    ]

    const itemActions = [
    ]
    for(let itemId of itemIds) {
        itemActions.push(
            {
                "ActionType": 8,
                "Data": {
                    "LootType": 1,
                    "LootValue": itemId,
                    "Count": 1
                }
            }
        )
    }

    if (options.goldenQuintar) {
        itemActions.push(
            {
              "ActionType": 63,
              "Data": {
                "ActionType": 0,
                "QuintarType": 7,
                "QuintarNature": 3,
                "Slot": 0,
                "RaceTrack": 0
              }
            },
            {
              "ActionType": 63,
              "Data": {
                "ActionType": 1,
                "QuintarType": 0,
                "QuintarNature": 0,
                "Slot": 0,
                "RaceTrack": 0
              }
            }
        )
    }

    return {
        "ID": 99989,
        "Coord": {
            "X": 3,
            "Y": 99,
            "Z": -1
        },
        "EntityType": 0,
        "Comments": null,
        "NpcData": {
            "Key": "Z1_CheatNan",
            "LinkedKey": null,
            "TieToSpawn": false,
            "UniquePerKey": false,
            "Outfits": [
                {
                    "Condition": {
                        "ConditionType": 0,
                        "Data": null,
                        "IsNegation": false
                    },
                    "TextureKey": "Actor/Npc_Nan",
                    "Name": "Nan",
                    "PlayerCharacterLevel": null,
                    "Facing": 5,
                    "ShadowType": 2,
                    "AutoStep": false,
                    "VoxelID": null,
                    "VoxelVariantIndex": 0,
                    "PlayerCollision": 3,
                    "NpcCollision": 0,
                    "MountType": 15,
                    "JumpType": 0,
                    "KeepSpawned": false,
                    "WanderType": 0,
                    "WanderSpeed": 0,
                    "WanderFrequency": 0,
                    "WanderRadius": 0,
                    "WanderRoute": [],
                    "WanderRouteIsLine": false
                }
            ],
            "Pages": [
                {
                "Condition": {
                    "ConditionType": 0,
                    "Data": null,
                    "IsNegation": false
                },
                "TriggerType": 0,
                "TriggerProximityRadius": 0,
                "TriggerProximityBox": {
                    "XNeg": 0,
                    "YNeg": 0,
                    "ZNeg": 0,
                    "XPos": 0,
                    "YPos": 0,
                    "ZPos": 0
                },
                "TriggerOnExitProximity": false,
                "TriggerTouchType": 0,
                "Actions": [
                    {
                        "ActionType": 3,
                        "Data": {
                            "Condition": {
                                "ConditionType": 3,
                                "Data": {
                                    "Scope": 0,
                                    "EntityKey": null,
                                    "VariableKey": "Obtained",
                                    "Eval": 0,
                                    "VariableType": 0,
                                    "Flag": false,
                                    "Number": 0,
                                    "SourceVariableScope": 0,
                                    "SourceVariableKey": null,
                                    "LootType": 0,
                                    "LootValue": 0
                                },
                                "IsNegation": false
                            },
                            "ConditionActionsTrue": [
                                {
                                    "ActionType": 0,
                                    "Data": null
                                },
                                {
                                    "ActionType": 1,
                                    "Data": {
                                        "Message": "It's a secret to everybody...",
                                        "NpcKey": null,
                                        "Choices": [],
                                        "AnswerVariableKey": null,
                                        "ShowPartyStatus": false
                                    }
                                },
                                {
                                    "ActionType": 2,
                                    "Data": null
                                }
                            ],
                            "ConditionActionsFalse": preItemActions.concat(itemActions).concat(postItemActions)
                        }
                    }
                ],
                "Context": 0
                }
            ]
        },
        "SignData": null,
        "SparkData": null,
        "DoorData": null,
        "HomePointData": null,
        "TreasureData": null,
        "CrystalData": null,
        "MarkerData": null
    }
}

class DatabaseReader {
    constructor(contentPath) {
        this.contentPath = contentPath;
        this.files = [
            'ability', 'actor', 'animation', 'biome', 'difficulty', 
            'equipment', 'gender', 'item', 'job', 'monster', 'passive', 
            'recipe', 'spark', 'status', 'system', 'troop', 'voxel'
        ];
    
        this.databases = {};
    }

    readFiles() {
        console.log('Reading database files');
        for(const file of this.files) {
            const data = fs.readFileSync(path.join(this.contentPath, 'Database', file + '.dat'));
            const header = data.slice(0, 2);
            const arr = new Uint8Array(data.slice(2));
            const end = arr.length;

            let i = 0;
            while(i < end) {
                arr[i] = 255 - arr[i];
                i++;
            }

            const json = JSON.parse(Buffer.from(arr).toString());

            this.databases[file] = {
                name: file,
                header: header,
                json: json,
            } 
        }
    }

    writeFiles() {
        for(let file in this.databases) {
            const data = this.databases[file];
            const arr = new Uint8Array(Buffer.from(JSON.stringify(data.json)));
            const end = arr.length;

            let i = 0;
            while(i < end) {
                arr[i] = 255 - arr[i];
                i++;
            }

            const datFile = Buffer.concat([data.header, Buffer.from(arr)]);
            fs.writeFileSync(path.join(this.contentPath, 'Database', file + '.dat'), datFile)
        }
    }

    getJobIds() {
        const jobs = this.databases.job.json;
        return jobs.map((job) => job.ID)
    }

    getMapIds() {
        const items = this.databases.item.json;
        return items.filter((item) => item && item.MapForBiomeID !== null).map((item) => item.ID)
    }

}

const voxelCoordFromGlobal = (coord) => {
    const voxelSize = 16;
    // Voxel Coords are in chunks of 16 size
    // e.g. Voxel 0 = 0 to 15, Voxel 1 = 16 to 31
    // Voxel -1 = -16 to -1
    
    // Luckily Math.floor will do this for us automatically, even
    // for negative numbers
    return Math.floor(coord/16);
}

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

    parseEntityLedger(line) {
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
        const id = entity.ID;
        const coords = entity.Coord;
        const x = coords.X;
        const y = coords.Y;
        const z = coords.Z;
        const voxelX = voxelCoordFromGlobal(x);
        const voxelY = voxelCoordFromGlobal(y);
        const voxelZ = voxelCoordFromGlobal(z);


        return `${id}:${x},${y},${z}:${voxelX},${voxelY},${voxelZ}`;
    }

    swapJobs(jobIds) {
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
        const allTreasure = [];

        // Iterative through all entities and grab items
        const shopTreasureMap = {};
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                // If this is a treasure chest, than we just add it to the pool
                // Roughly ~535 items
                if(options.includeTreasures && entity.TreasureData && entity.TreasureData.LootType != 0) {
                    allTreasure.push({
                        LootType: entity.TreasureData.LootType,
                        LootValue: entity.TreasureData.LootValue
                    })
                }

                // If this is an npc we check for shop data or npc data
                if(entity.NpcData) {
                    if(options.includeShops) {
                        var shopAction = null;
                        await deepSearch(entity.NpcData, "ActionType", (obj) => {
                            if (obj.ActionType == 5) {
                                shopAction = obj;
                            }
                        });

                        // For shop data, because shops are meant to be "linked" in a sense
                        // we only add each item from the shop to the pool once and make a map
                        // to later map them to a random item.
                        // e.g. if the gold armor shop in one zone changes, it should sell
                        // the same thing in another zone.
                        // Roughly ~300 items
                        if (shopAction !== null) {
                            if (shopAction.Data) { // Ignore weird use cases
                                for(let item of shopAction.Data.Stock) {
                                    if(item.LootType != 0 && shopTreasureMap[item.LootType + ',' + item.LootValue] !== -1) {
                                        shopTreasureMap[item.LootType + ',' + item.LootValue] = -1 // Dummy value for now
                                        allTreasure.push({
                                            LootType: item.LootType,
                                            LootValue: item.LootValue
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        const shuffledTreasure = shuffle(allTreasure); 

        // Now that we have shuffled the treasure, the first thing we must do is map
        // the treasure data back to shops. 
        // This is because shops cant sell money treasure, so to ensure we have enough
        // to fill the shops we do them seperately
        if(options.includeShops) {
            for(let key in this.entityFiles) {
                const entityFile = this.entityFiles[key];
                for(let entity of entityFile) {
                    if(entity.NpcData) {
                        var shopAction = null;
                        await deepSearch(entity.NpcData, "ActionType", (obj, path) => {
                            let searchObj = entity.NpcData;
                            for(let key of path) {
                                searchObj = searchObj[key];
                            }
                            if (searchObj.ActionType == 5) {
                                shopAction = searchObj;
                            }
                        });

                        // For shop data, we pick a random item/equip (loot type 1 or 2) from the pool
                        if (shopAction !== null) {
                            if (shopAction.Data) { // Ignore weird use cases
                                for(let item of shopAction.Data.Stock) {
                                    if(item.LootType != 0) {
                                        let newItem = shopTreasureMap[item.LootType + ',' + item.LootValue];
                                        if (newItem === -1) {
                                            // Havent mapped this one yet, lets grab a random item!
                                            newItem = allTreasure.shift();
                                            while(!(newItem.LootType === 1 || newItem.LootType === 2)) {
                                                allTreasure.push(newItem);
                                                newItem = allTreasure.shift();
                                            }

                                            shopTreasureMap[item.LootType + ',' + item.LootValue] = newItem;
                                        }
                                        
                                        item.LootType = newItem.LootType;
                                        item.LootValue = newItem.LootValue;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Now we go through and swap em
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(options.includeTreasures && entity.TreasureData && entity.TreasureData.LootType != 0) {
                    const newTreasure = shuffledTreasure.shift();
                    entity.TreasureData.LootType = newTreasure.LootType;
                    entity.TreasureData.LootValue = newTreasure.LootValue;
                }
            }
        }

        console.log(shuffledTreasure.length);
    }

    shuffleMonsters(options) {
        const allTroops = [];
        const hasKeyQuintar = (sparkData) => {
            let hasQuintar = false;
            sparkData.TroopPages.forEach(troop => {
                // Troop: 59, 90 are the IDs of the brutish quintar 
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
                    if (!options.includeUniques && entity.SparkData.IsUnique) {
                        continue;
                    }
                    if (!options.includeKeyQuintars && hasKeyQuintar(entity.SparkData)) {
                        continue;
                    }
                    allTroops.push(entity.SparkData.TroopPages)
                }
            }
        }

        const shuffledTroops = shuffle(allTroops); 

        // Swap em
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.SparkData) {
                    if (!options.includeUniques && entity.SparkData.IsUnique) {
                        continue;
                    }
                    if (!options.includeKeyQuintars && hasKeyQuintar(entity.SparkData)) {
                        continue;
                    }
                    const newTroops = shuffledTroops.shift();
                    entity.SparkData.TroopPages = newTroops;
                }
            }
        }
    }

    moveCrystals(options) {
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

        // First we grab all the treasures in the entities
        // For now we will be super naive, swapping everything, even unique ones
        // even bosses, even giants, even ones that set flags, and the entire
        // troop page
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

        customPoints = shuffle(customPoints);

        // Replace this
        for(let crystal of crytalsToMove) {
            const p = customPoints.shift();
            this.moveEntity(crystal.from, { X: p[0], Y: p[1], Z: p[2] }, crystal.entity);
        }
    }

    addEntity(entity) {
        const voxelX = voxelCoordFromGlobal(entity.Coord.X);
        const voxelY = voxelCoordFromGlobal(entity.Coord.Y);
        const voxelZ = voxelCoordFromGlobal(entity.Coord.Z);
        const newEntityFile = `${voxelX},${voxelZ},${voxelY}`;

        if (!this.entityFiles[newEntityFile]) {
            const zipKey = `${voxelX},${voxelZ}`;
            // If there is not an existing entity file, we need to make the array for it
            // as well as create the entry in the corresponding zip file
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

        // Finally we remove out entity from the old entity JSON file
        // and add it to the new entity JSON file
        newEntityJson.push(entity)
        this.entityFiles[newEntityFile] = newEntityJson;
    }

    // to here should by simple x,y,z global coords
    // from here should be the entity file key (e.g. x,y,z of file)
    moveEntity(from, to, entity) {
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

        const voxelX = voxelCoordFromGlobal(to.X);
        const voxelY = voxelCoordFromGlobal(to.Y);
        const voxelZ = voxelCoordFromGlobal(to.Z);
        const newEntityFile = `${voxelX},${voxelZ},${voxelY}`;

        if (!this.entityFiles[newEntityFile]) {
            const zipKey = `${voxelX},${voxelZ}`;
            // If there is not an existing entity file, we need to make the array for it
            // as well as create the entry in the corresponding zip file
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
        console.log('Loading entities');
        const worldFile = fs.readFileSync(path.join(this.contentPath, "Worlds", this.file + ".dat"));

        // The world file is actually just a Zip File, but with a small header of 2 bytes in front
        // used for versioning.
        this.fileHeader = worldFile.slice(0, 2);
        this.worldZip = new AdmZip(worldFile.slice(2))

        // At the root of the worlds file, is another .dat file named the same as the world itself
        // this dat file contains the entity information we are after (as well as other things)
        const entityDat = this.worldZip.getEntry(this.file + '.dat').getData();
        const entityArr = new Uint8Array(entityDat);

        // Finally, the structure of this entity dat is a collection of segments of various metadata
        // with zip files containing voxel data and entity json files.

        // The format as best I have figured out is:
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
        const headerLength = entityDat.readInt32LE();
        const ledgerLength = entityDat.readInt32LE(4 + headerLength);

        // First we load the entity ledger section.
        // This whole section is plaintext, where each line represents metadata about the entity (lines are ended by ;\r\n)
        // which is used to determine which zip file the entities data exists in
        const entityLedgerBuffer = Buffer.from(entityArr.slice(4 + headerLength + 4, 4 + headerLength + 4 + ledgerLength))
        this.entityLedger = entityLedgerBuffer.toString().split(';\r\n').filter((x) => !!x).map(this.parseEntityLedger);

        // Next we read the Zip data regions
        const numZipFiles = entityDat.readInt32LE(4 + 4 + headerLength + ledgerLength);
        const zipMetaRegionOffset = 4 + headerLength + 4 + ledgerLength + 4;        
        const zipRegionOffset = 4 + headerLength + 4 + ledgerLength + 4 + (numZipFiles * 16) + 4;
        const zipRegionSize = entityDat.readInt32LE(zipRegionOffset);
        const zipRegion = entityArr.slice(zipRegionOffset + 4, zipRegionOffset + 4 + zipRegionSize)

        // We store some segments of the DAT files that we will never change
        // to reconstruct it later.
        this.beforeBytes = entityDat.slice(0, 4 + headerLength);
        this.mysteriousBytes = entityDat.slice(zipRegionOffset - 4, zipRegionOffset);
        this.endingBytes = entityDat.slice(zipRegionOffset + 4 + zipRegionSize);

        // Now we go through all zip file metadata and keep an index of them in memory
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

        // For every file in entityFiles, turn the new JSON into a buffer
        // find the zip in the zipDataCache and overwrite the JSON file entry
        // We also store ledger information about the entities in the file
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

        // UNSURE if this is UTF 8 or UTF 16
        // have to add the final newline in
        const ledgerBuff = Buffer.from(ledger.join(';\r\n') + ';\r\n');
        const leaderHeader = Buffer.alloc(4);
        leaderHeader.writeInt32LE(ledgerBuff.length);

        // For every zip in the zipDataCache, generate a buffer, get the size of each one
        // and concatenate all of them together, get the full region size
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

        const fullZipBuffer = Buffer.concat(zipBuffers);
        const fullMetadataBuffer = Buffer.concat(zipMetaBuffers);
        const fullZipHeader = Buffer.alloc(4);
        fullZipHeader.writeInt32LE(fullZipBuffer.length);
        const fullMetadataHeader = Buffer.alloc(4);
        fullMetadataHeader.writeInt32LE(numZips);

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

        this.worldZip.getEntry(this.file + '.dat').setData(fullDatFile);
        const finalDat = Buffer.concat([this.fileHeader, this.worldZip.toBuffer()]);
        fs.writeFileSync(path.join(this.contentPath, "Worlds", this.file + ".dat"), finalDat);
    }
}

class ExecutableEditor {
    constructor(gamePath) {
        this.gamePath = gamePath;
        this.exeData = null;
        // These strings are static variables/hardcoded strings in the code
        // That are used to determine the save directory (and deletede save directory)
        // In order to not fuck with peoples non-randomized stuff, I hack it to
        // change the save directory to its own one
        this.saveDirBuf = Buffer.from("Save/", 'utf16le');
        this.newSaveDirBuf = Buffer.from("Rand/", 'utf16le');
        this.deleteDirBuf = Buffer.from("Deleted/", 'utf16le');
        this.newDeleteDirBuf = Buffer.from("Deyeted/", 'utf16le');

        // This byte signature is for a static variable in the code that determins
        // what six jobs you start the game with unlocked. Each int64 is the id
        // of a job.
        this.startJobBuffer = Buffer.alloc(4 * 6);
        this.startJobBuffer.writeUInt32LE(0);
        this.startJobBuffer.writeUInt32LE(2, 4);
        this.startJobBuffer.writeUInt32LE(5, 8);
        this.startJobBuffer.writeUInt32LE(4, 12);
        this.startJobBuffer.writeUInt32LE(3, 16);
        this.startJobBuffer.writeUInt32LE(14, 20);

        // This byte signature is for a static variable in the code that determiens
        // what 4 jobs the 4 characters you create on a new game start as. Im guessing
        // this should be kept in line with the unlocked jobs above to avoid crashes.
        this.pickedJobBuffer = Buffer.alloc(4 * 4);
        this.pickedJobBuffer.writeUInt32LE(0);
        this.pickedJobBuffer.writeUInt32LE(5, 4);
        this.pickedJobBuffer.writeUInt32LE(4, 8);
        this.pickedJobBuffer.writeUInt32LE(3, 12);

    }

    loadExe() {
        this.exeData = fs.readFileSync(path.join(this.gamePath, 'Crystal Project.exe'));
    }

    replaceBuffer(oldBuffer, newBuffer) {
        let replaceCount = 0;
        let lastLastIdx = 0;
        let lastIdx = this.exeData.indexOf(oldBuffer, 0);
        let bufferParts = [];
        while(lastIdx !== -1) {
            bufferParts.push(this.exeData.slice(lastLastIdx, lastIdx));
            bufferParts.push(newBuffer);
            lastLastIdx = lastIdx + newBuffer.length;
            lastIdx = this.exeData.indexOf(oldBuffer, lastIdx+1)
            replaceCount++;
        }
        bufferParts.push(this.exeData.slice(lastLastIdx));
        this.exeData = Buffer.concat(bufferParts);

        return replaceCount;
    }

    changeSaveDirectory() {
        const count = this.replaceBuffer(this.saveDirBuf, this.newSaveDirBuf);
        console.log(`replaced ${count} patterns for save directory`);
    }

    changeDeleteDirectory() {
        const count = this.replaceBuffer(this.deleteDirBuf, this.newDeleteDirBuf);
        console.log(`replaced ${count} patterns for delete directory`);
    }

    changeStartingJobs(jobIds) {
        const newStartJobBuffer = Buffer.alloc(4 * 6);
        for(let i = 0; i < 6; i++) {
            const jobId = jobIds[i % jobIds.length];
            newStartJobBuffer.writeUInt32LE(jobId, i * 4);
        }

        const count = this.replaceBuffer(this.startJobBuffer, newStartJobBuffer);
        console.log(`replaced ${count} patterns for starting jobs`);
    }

    changePickedJobs(jobIds) {
        const newPickedJobBuffer = Buffer.alloc(4 * 4);
        for(let i = 0; i < 4; i++) {
            const jobId = jobIds[i % jobIds.length];
            newPickedJobBuffer.writeUInt32LE(jobId, i * 4);
        }

        const count = this.replaceBuffer(this.pickedJobBuffer, newPickedJobBuffer);
        console.log(`replaced ${count} patterns for picked jobs`);
    }

    saveExe() {
        fs.writeFileSync(path.join(this.gamePath, 'Crystal Project.exe'), this.exeData);
    }
}

const localGameDir = 'crystal-project';
const contentPath = path.join(localGameDir, 'Content');

// TODO: Change this logic to edit in place
if (fs.existsSync(localGameDir)) {
    fs.rmSync(localGameDir, {recursive: true});
}
fs.cpSync(GAME_PATH, localGameDir, {recursive: true});

const options = {
    jobOptions: {
        enable: true,
        startingJobs: 6,
        crystalJobs: 18,
        customJobPool: null,
    },
    itemOptions: {
        includeTreasures: true,
        includeShops: true,
    },
    monsterOptions: {
        enable: true,
        includeUniques: true,
        includeKeyQuintars: false,
    },
    crystalOptions: {
        enable: true,
        includeOriginalLocations: true,
    },
    cheatNanOptions: {
        enable: true,
        quintarPass: true,
        homePointStone: true,
        quintarFlute: true,
        salmonViolin: false,
        owlDrum: false,
        ibekBell: false,
        salmonCello: false,
        goldenQuintar: false,
        maps: false
    }
};

(async () => {
    const dbReader = new DatabaseReader(contentPath);
    const entityEditor = new EntityEditor(contentPath);
    const exeEditor = new ExecutableEditor(localGameDir);

    dbReader.readFiles();
    entityEditor.loadEntities();
    exeEditor.loadExe();

    if (options.jobOptions.enable) {
        console.log('Swapping Jobs');
        let randomizedJobs = null;
        if (options.jobOptions.customJobPool) {
            randomizedJobs = shuffle(customJobPool);
        } else {
            randomizedJobs = shuffle(dbReader.getJobIds());
        }
        if (options.jobOptions.numberOfJobs > 0) {
            randomizedJobs = randomizedJobs.slice(0, options.jobOptions.numberOfJobs);
        }
        entityEditor.swapJobs(randomizedJobs.slice(options.jobOptions.startingJobs, options.jobOptions.startingJobs + options.jobOptions.crystalJobs));
        exeEditor.changeStartingJobs(randomizedJobs.slice(0, options.jobOptions.startingJobs));
        exeEditor.changePickedJobs(randomizedJobs.slice(0, 4));
    }

    if(options.itemOptions.includeTreasures || options.itemOptions.includeShops) {
        console.log('Swapping items');
        await entityEditor.shuffleItems(options.itemOptions);
    }

    if (options.monsterOptions.enable) {
        console.log('Swapping Monsters');
        entityEditor.shuffleMonsters(options.monsterOptions);
    }

    if (options.crystalOptions.enable) {
        console.log('Moving Crystals');
        entityEditor.moveCrystals(options.crystalOptions);
    }

    if (options.cheatNanOptions.enable) {
        console.log('Creating Cheat Nan')
        const mapIds = dbReader.getMapIds();
        entityEditor.addEntity(makeCheatNan(options.cheatNanOptions, mapIds))
    }

    // Change save directory to protect non-rando saves
    exeEditor.changeSaveDirectory();
    exeEditor.changeDeleteDirectory();

    entityEditor.saveEntities();
    dbReader.writeFiles();
    exeEditor.saveExe();
})()

// Initial Randomizer Options:
// - Randomize the Jobs from crytals including starting jobs (Done)
// - Randomize crystal locations within set of some locations (Done)
// - Randomize all treasure chests (Done)
//   - Consider how hard it is to randomize Shop inventories (Medium)
//      - Basic Shops - Not So hard
//          "ActionType": 5 Data.Stock, 57 Results
//      Recipes - No
//      Lost and Found - Lol no no
//   - Consider randomizing NPC quest rewards into pool (Hard? unless we dont care about logic)
//      - There are 354 results.. not all of these should be randomized right?
//          This includes: Black Squirrels, Ores, The three Tablets, Ibek Bell, Raft Pass, Quintar Pass
//                         Milk Bag, Keys, Fisher Rewards, Master Crests, The Octopus Hat, Butterfly Goo wtf?
//                         Crabs, Ground Sparkles, King Crab Item, 
//          Prob the most important thing here would be the Quintar Pass and the Raft Pass as they are technically
//          One item, and the ability to filter out the mining. Otherwise... free for all is prob fine?
//          Finding Actions also not simple
// - Randomize Monsters in Flames (Done)
// - Give option to add Cheat Nan (Done)
//
// - Custom PRNG that can set seed for shareability
//
// - Put this all in an Electron App
// - Have it modify the local copy of the EXE, while making a backup of both files
// - Have option to restore original files
// - Figure out if its possible to set seed or use different PRNG