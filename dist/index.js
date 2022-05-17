"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var path = require("path");
var fs = require('fs');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
var createWindow = function () {
    var mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
    //mainWindow.webContents.openDevTools();
};
electron_1.app.on('ready', createWindow);
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=index.js.map