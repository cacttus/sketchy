
//Communicate with render thread.
// /https://www.electronjs.org/docs/latest/tutorial/ipc

//Main process will log out to console -- Render logs out to dev tools
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
// import { MailOutlineTwoTone } from '@mui/icons-material';
// const { shell } = require('electron')

class Gu { 
  public static appPath(): string {
    //This might need to change vs debug / release
    return path.join(app.getAppPath(), '/dist');
  }
  public static getFiles(dir: string) : Array<string> {
    var that = this;

    var flist: Array<string> = new Array<string>();
  
    var fq: string = path.join(that.appPath(), dir);
  
    console.log("FULL PATH : " + fq);
  
    fs.readdir(fq, function (err: any, files: any) {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      //listing all files using forEach
      files.forEach(function (file: string) {
        // Do whatever you want to do with the file
        flist.push(file);
      });
    });
  
    return flist;
  }  
}

class MainProcess {
  private mainWindow!: BrowserWindow;

  public constructor() {
    var that = this;

    ipcMain.handle('get-files', async (event, dir) => {
      const result = await Gu.getFiles(dir);
      return result
    })
    app.on('ready', that.createWindow);
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        that.createWindow();
      }
    });
  }

  private createWindow () :void {
    var that = this;

    that.mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      webPreferences: {
        preload: path.join(Gu.appPath(), 'preload.js'),
        nodeIntegration: true, 
        contextIsolation: true, //"contextBridge API can only be used when contextIsolation is enabled"
      }
    });
    //__dirname

    var x : string = path.join(Gu.appPath(), 'index.html');

    that.mainWindow.loadFile(x);
    // mainWindow.loadURL("google.com");  // option1: (loading a local app running on a local server)
    // mainWindow.setFullScreen(true);
    that.mainWindow.webContents.openDevTools();
  };  

}


var m : MainProcess  = new MainProcess();




