const fs = require('fs');
const path = require('path');

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
        this.replaceBuffer(this.saveDirBuf, this.newSaveDirBuf);
    }

    changeDeleteDirectory() {
        this.replaceBuffer(this.deleteDirBuf, this.newDeleteDirBuf);
    }

    changeStartingJobs(jobIds) {
        const newStartJobBuffer = Buffer.alloc(4 * 6);
        for(let i = 0; i < 6; i++) {
            const jobId = jobIds[i % jobIds.length];
            newStartJobBuffer.writeUInt32LE(jobId, i * 4);
        }

        this.replaceBuffer(this.startJobBuffer, newStartJobBuffer);
    }

    changePickedJobs(jobIds) {
        const newPickedJobBuffer = Buffer.alloc(4 * 4);
        for(let i = 0; i < 4; i++) {
            const jobId = jobIds[i % jobIds.length];
            newPickedJobBuffer.writeUInt32LE(jobId, i * 4);
        }

        this.replaceBuffer(this.pickedJobBuffer, newPickedJobBuffer);
    }

    saveExe() {
        fs.writeFileSync(path.join(this.gamePath, 'Crystal Project.exe'), this.exeData);
    }
}

module.exports = ExecutableEditor;