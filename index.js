const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");

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

const makeCheatNan = (itemIds) => {
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
            "ActionType": 10,
            "Data": {
            "RefreshCurrentOutfit": false,
            "RefreshCurrentPage": false,
            "RefreshCurrentPosition": false,
            "CancelAllActiveActions": false,
            "TriggerPlayerAction": true,
            "TriggerPlayerProximity": false,
            "TriggerAuto": false,
            "TriggerPlayerTouch": false,
            "TriggerTriggerNpc": false,
            "GlobalRefreshOutfits": false,
            "GlobalRefreshPages": false,
            "GlobalRefreshPositions": false,
            "GlobalTrySpawn": false,
            "GlobalTryDespawn": false,
            "NpcKey": null
            }
        }
    ]

    const itemActions = [
    ]
    for(let itemId in itemIds) {
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

    return {
        "ID": 99989,
        "Coord": {
            "X": 0,
            "Y": 99,
            "Z": 3
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
        console.log('Swapping Crystal jobs');
        // Here we go through all the files, for every one where we find CrystalData we
        // push in a new job ID.
        // With this swap, a job may remain where it already was.
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.CrystalData) {
                    if (jobIds.length > 0) {
                        entity.CrystalData.JobID = jobIds.shift();
                    } else {
                        entity.CrystalData.JobID = 0;
                    }
                }
            }
        }
    }

    shuffleTreasure() {
        console.log('Swapping treasures');
        const allTreasure = [];
        // First we grab all the treasures in the entities
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                // IDK What lootType 0 is and im not messing with it
                // 1 and 2 seem to be equipment vs item
                if(entity.TreasureData && entity.TreasureData.LootType != 0) {
                    allTreasure.push({
                        LootType: entity.TreasureData.LootType,
                        LootValue: entity.TreasureData.LootValue
                    })
                }
            }
        }

        const shuffledTreasure = shuffle(allTreasure); 

        // Now we go through and swap em
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.TreasureData && entity.TreasureData.LootType != 0) {
                    const newTreasure = shuffledTreasure.shift();
                    entity.TreasureData.LootType = newTreasure.LootType;
                    entity.TreasureData.LootValue = newTreasure.LootValue;
                }
            }
        }
    }

    shuffleMonsters() {
        // SparkData
        // SparkData.IsUnique
        // SparkData.IsGiant
        // SparkData.SetGlobalFlagOnVictory
        // SparkData.TroopPages[].TroopID and .Rate
        console.log('Swapping Monsters (Naive)');
        const allTroops = [];
        // First we grab all the treasures in the entities
        // For now we will be super naive, swapping everything, even unique ones
        // even bosses, even giants, even ones that set flags, and the entire
        // troop page
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.SparkData) {
                    allTroops.push(entity.SparkData.TroopPages)
                }
            }
        }

        const shuffledTroops = shuffle(allTroops); 

        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.SparkData) {
                    const newTroops = shuffledTroops.shift();
                    entity.SparkData.TroopPages = newTroops;
                }
            }
        }
    }

    moveCrystals() {
        console.log('Moving Crystals');
        const crytalsToMove = [];
        // First we grab all the treasures in the entities
        // For now we will be super naive, swapping everything, even unique ones
        // even bosses, even giants, even ones that set flags, and the entire
        // troop page
        for(let key in this.entityFiles) {
            const entityFile = this.entityFiles[key];
            for(let entity of entityFile) {
                if(entity.CrystalData && entity.ID == 130) {
                    crytalsToMove.push({ from: key, entity: entity });
                }
            }
        }

        this.moveEntity(crytalsToMove[0].from, { X: -4, Y: 120, Z: -22 }, crytalsToMove[0].entity);
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

if (fs.existsSync(localGameDir)) {
    fs.rmSync(localGameDir, {recursive: true});
}
fs.cpSync(GAME_PATH, localGameDir, {recursive: true});

const dbReader = new DatabaseReader(contentPath);
const entityEditor = new EntityEditor(contentPath);
const exeEditor = new ExecutableEditor(localGameDir);

dbReader.readFiles();
const randomizedJobs = shuffle(dbReader.getJobIds());

entityEditor.loadEntities();
entityEditor.swapJobs(randomizedJobs.slice(6));
entityEditor.shuffleTreasure();
entityEditor.shuffleMonsters();
entityEditor.moveCrystals();
// Add a cheat nan with the 3 mount items
entityEditor.addEntity(makeCheatNan(39, 49, 50))
entityEditor.saveEntities();

exeEditor.loadExe();
exeEditor.changeSaveDirectory();
exeEditor.changeDeleteDirectory();
exeEditor.changeStartingJobs(randomizedJobs.slice(0, 6));
exeEditor.changePickedJobs(randomizedJobs.slice(0, 4));
exeEditor.saveExe();
