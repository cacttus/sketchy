//Main process will log out to console -- Render logs out to dev tools
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const { shell } = require('electron')

// If development environment
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  try {
      require('electron-reloader')(module, {
          debug: true,
          watchRenderer: true,
      });
  } catch (_) { console.log('Error'); }    
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });
  mainWindow.loadFile(path.join(__dirname, './index.html'));
  // mainWindow.loadURL("google.com");  // option1: (loading a local app running on a local server)

  //mainWindow.setFullScreen(true);
  var searchdir : string = "./testdata";

  //mainWindow.webContents.openDevTools();
  fs.readdir(searchdir, function (err: any, files: any) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file: any) {
      // Do whatever you want to do with the file
      console.log(file);
    });
  });

};
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
