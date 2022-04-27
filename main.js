const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const Randomizer = require('./lib/Randomizer')

const randomizer = new Randomizer(process.env.PORTABLE_EXECUTABLE_DIR || app.getAppPath());

let win = null;

function createWindow () {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        resizable: true,
        autoHideMenuBar: true,
        webPreferences: {
            backgroundThrottling: false,
            minimumFontSize : 12,
            defaultFontSize : 16,
            preload: path.join(__dirname, "preload.js") ,
        }
    })

    win.loadFile('app/index.html');

    win.on('close', (e) => {
        win = null;
    });


    ipcMain.handle('randomize', async (event, options, seed) => {
        return await randomizer.randomize(options, seed);
    })
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});
