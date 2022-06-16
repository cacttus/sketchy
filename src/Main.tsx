import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
//import * as fs from 'fs';
import * as fs from 'fs/promises';

import { Events, Gu } from './Globals';

class MainProcess {
  private static mainWindow: BrowserWindow;

  public constructor() {
    var that = this;

    MainProcess.receive((id: string, args: any) => {
      if (MainProcess.checkEvent(Events.GetFiles, 1, id, args)) {
        var f = MainProcess.getFiles(args[0]).then((value: Array<string>) => {
          MainProcess.send(Events.GetFiles, value);
        })
      }
    });

    app.on('ready', () => { that.createWindow(800, 600, false); });
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }

  public static send(event: string, data: any = null): void {
    this.mainWindow.webContents.send("fromMain", [event, data]);
  }
  public static receive(func: any): void {
    ipcMain.on("toMain", (event: Electron.IpcMainEvent, args: any) => {
      var sys_id: string = args[0];
      var actual_args: any = args[1];
      func(sys_id, actual_args);
    });
  }
  
  private static checkEvent(check_id: string, argcount: number, got_id: string, got_args: any): boolean {
    var b: boolean = false;
    if (check_id.localeCompare(got_id) == 0) {
      b = true;
      if (got_args.length != argcount) {
        throw new Error("Event " + got_id + " had " + got_args.length + " args, needed " + argcount);
      }
    }
    return b;
  }
  private createWindow(width: number = 800, height: number = 600, fullscreen: boolean = false): void {
    var that = this;
    var preload = path.join(MainProcess.appPath(), 'preload.js');
    MainProcess.mainWindow = new BrowserWindow({
      height: height,
      width: width,
      fullscreen: fullscreen,
      webPreferences: {
        preload: path.join(MainProcess.appPath(), 'preload.js'),
        //https://stackoverflow.com/questions/37994441/how-to-use-fs-module-inside-electron-atom-webpack-application
        nodeIntegration: true, //This is for the rendering thread. Allow node.
        contextIsolation: true,
        //enableRemoteModule: false 
      }
    });

    MainProcess.mainWindow.loadFile(path.join(MainProcess.appPath(), 'index.html'));

    if (Gu.IsDebug()) {
      MainProcess.mainWindow.webContents.openDevTools();
    }

    //Nifties
    // mainWindow.loadURL("google.com");  // option1: (loading a local app running on a local server)
    // mainWindow.setFullScreen(true);
    //   if (BrowserWindow.getAllWindows().length === 0) {
  };
  private static async getFiles(dir: string): Promise<Array<string>> {
    var flist: Array<string> = new Array<string>();
    var fq: string = path.join(MainProcess.appPath(), dir);
    const files: any = await fs.readdir(fq);
    for (const file of files) {
      flist.push(file);
    }
    return flist;
  }
  private static appPath(): string {
    //This will need to change vs debug / release
    //also __dirname
    return path.join(app.getAppPath(), '/dist');
  }
}


var m: MainProcess = new MainProcess();




