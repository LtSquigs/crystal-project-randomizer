const fs = require('fs');
const path = require('path');
const AdmZip = require("adm-zip");

const GAME_PATH = "";

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
}

class EntityEditor {
    constructor(contentPath) {
        // All we actually care about is the field entities
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
        const globalCoords = parts[2].split(',');
    
        // coords are x, y, z
        // global coords are x, y, z
        // where x and z lineup to the file coords parsed from the other region
        // and y is the filename (e.g. y<n>e.json = entity json file)
        return {
            id: id,
            coords: {
                x: coords[0],
                y: coords[1],
                z: coords[2]
            },
            fileCoords: {
                x: globalCoords[0],
                y: globalCoords[1],
                z: globalCoords[2]
            }
        }
    }

    loadEntities() {
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

        const numZipFiles = entityDat.readInt32LE(4 + 4 + headerLength + ledgerLength);
        const zipMetaRegionOffset = 4 + headerLength + 4 + ledgerLength + 4;        
        const zipRegionOffset = 4 + headerLength + 4 + ledgerLength + 4 + (numZipFiles * 16) + 4;
        const zipRegionSize = entityDat.readInt32LE(zipRegionOffset);
        const zipRegion = entityArr.slice(zipRegionOffset + 4, zipRegionOffset + 4 + zipRegionSize)

        // We store these for writing out later
        this.beforeBytes = entityDat.slice(0, 4 + headerLength + 4 + ledgerLength);
        this.mysteriousBytes = entityDat.slice(zipRegionOffset - 4, zipRegionOffset);
        this.endingBytes = entityDat.slice(zipRegionOffset + 4 + zipRegionSize);

        // Now we go through all zip file metadata and get an index of them
        // and store the zip file in memory
        // TODO: Probably should do a better job of ensuring these are in order
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

        this.entityFiles = {};
        for(let entity of this.entityLedger) {
            const fileCoords = entity.fileCoords;
            const zipKey = fileCoords.x + ',' + fileCoords.z;
            const entry = 'y' + fileCoords.y + 'e.json';

            if (!!this.entityFiles[zipKey + ',' + fileCoords.y]) {
                continue;
            }

            const zip = this.zipDataCache[zipKey].data;
            const entityJson = JSON.parse(zip.getEntry(entry).getData().toString());
            this.entityFiles[zipKey + ',' + fileCoords.y] = entityJson;
        }
    }

    saveEntities() {
        // To save back this data we need to reconstruct the file
        // Everything up until the entity ledger should be the same
        // Potentially the ledger as well if we havent changed the location of anything

        // For every entity in entityFiles, turn the new JSON into a buffer
        // find the zip in the zipDataCache and overwrite the JSON file entry
        for(let key in this.entityFiles) {
            const parts = key.split(',');
            const zipKey = parts[0] + ',' + parts[1];
            const entryFile = 'y' + parts[2] + 'e.json';

            const zip = this.zipDataCache[zipKey].data;
            
            zip.getEntry(entryFile).setData(JSON.stringify(this.entityFiles[key]));
        }

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
        this.exeData = fs.readFileSync(path.join(gamePath, 'Crystal Project.exe'))
        this.saveDirBuf = Buffer.from("Save/", 'utf16le');
        this.newSaveDirBuf = Buffer.from("Rand/", 'utf16le');
        this.deleteDirBuf = Buffer.from("Deleted/", 'utf16le');
        this.newDeleteDirBuf = Buffer.from("Deyeted/", 'utf16le');
    }

    changeSaveDirectory() {
        let lastLastIdx = 0;
        let lastIdx = this.exeData.indexOf(this.saveDirBuf, 0);
        let bufferParts = [];
        while(lastIdx !== -1) {
            bufferParts.push(this.exeData.slice(lastLastIdx, lastIdx));
            bufferParts.push(this.newSaveDirBuf);
            lastLastIdx = lastIdx + this.newSaveDirBuf.length;
            lastIdx = this.exeData.indexOf(this.saveDirBuf, lastIdx+1)
        }
        bufferParts.push(this.exeData.slice(lastLastIdx));
        this.exeData = Buffer.concat(bufferParts);
    }

    changeDeleteDirectory() {
        let lastLastIdx = 0;
        let lastIdx = this.exeData.indexOf(this.deleteDirBuf, 0);
        let bufferParts = [];
        while(lastIdx !== -1) {
            bufferParts.push(this.exeData.slice(lastLastIdx, lastIdx));
            bufferParts.push(this.newDeleteDirBuf);
            lastLastIdx = lastIdx + this.newDeleteDirBuf.length;
            lastIdx = this.exeData.indexOf(this.deleteDirBuf, lastIdx+1)
        }
        bufferParts.push(this.exeData.slice(lastLastIdx));
        this.exeData = Buffer.concat(bufferParts);
    }

    saveExe() {
        fs.writeFileSync(path.join(this.gamePath, 'Crystal Project.exe'), this.exeData);
    }
}

// TODO Write EXE Editor, load EXE, search for strings, and fix

// 00 00 00 00 02 00 00 00 05 00 00 00 04 00 00 00 03 00 00 00 0E 00 00 00
// This is the default job setup

// 00 00 00 00 05 00 00 00 04 00 00 00 03 00 00 00
// This is the starting selected jobs

// Can check for SAVE_DIR string "Save/" and "Deleted/" to change, or prefixes
// Also maybe can search for Saved Games/
// Saved Games = 53 00 61 76 00 65 00 64 00 20 00 47 00 61 00 6D 00 65 00 73 00 2F 00
// Save/ = 53 00 61 00 76 00 65 00 2F 00
// Deleted/ = 44 00 65 00 6C 00 65 00 74 00 65 00 64 00 2F 00  


const localGameDir = 'crystal-project';
const contentPath = path.join(localGameDir, 'Content');

const dbReader = new DatabaseReader(contentPath);
const entityEditor = new EntityEditor(contentPath);
const exeEditor = new ExecutableEditor(localGameDir);

if (fs.existsSync(localGameDir)) {
    fs.rmSync(localGameDir, {recursive: true});
}
fs.cpSync(GAME_PATH, localGameDir, {recursive: true});

dbReader.readFiles(contentPath);
entityEditor.loadEntities(contentPath);
entityEditor.saveEntities(contentPath);
exeEditor.changeSaveDirectory();
exeEditor.changeDeleteDirectory();
exeEditor.saveExe();

