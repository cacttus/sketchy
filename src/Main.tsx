import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RPCMethods } from "./Remote"
import {Blob} from 'buffer';

/**
 This is the main process code, which can be moved into the rendering thread.
 If you enable node integration in electron, you don't need a Main process, or, IPC. 
 This is useful for quick desktop apps that run on localhost, and don't require internet security.
*/
class MainProcess {
  private static _windows: Array<BrowserWindow> = new Array<BrowserWindow>();
  public static mainWindow(): BrowserWindow { return this._windows[0]; }

  public constructor() {
    let that = this;

    MainProcess._windows.push(that.createWindow('MainWindow.js', 800, 600, false, false));

    //Register RPC callbacks
    MainProcess.registerCallbacks();

    that.createMenu();
  }

  public ExitApp(): void {
    app.quit();
  }
  // private send(event: string, data: any = null): void {
  //   MainProcess.mainWindow().webContents.send("fromMain", [event, data]);
  // }
  // private receive(func: any): void {
  //   ipcMain.on("toMain", (event: Electron.IpcMainEvent, args: any) => {

  //     var rpcName: string = args[0]; // The name of the RPC method
  //     var rpcArgs: any = args[1]; // The arguments

  //     console.log("Main:" + rpcName);

  //     func(rpcName, rpcArgs);
  //   });
  // }
  // private handleEvents(rpcName: string, rpcArgs: any): void {
  //   var that = this;

  //   /* @ts-ignore */
  //   var fid: any = that[rpcName];
  //   fid(rpcArgs);

  //   if (MainProcess.checkEvent(Events.GetFiles, 1, rpcName, rpcArgs)) {
  //     var f = MainProcess.getFiles(rpcArgs[0]).then((value: Array<string>) => {
  //       that.send(Events.GetFiles, value);
  //     });
  //   }
  //   else if (MainProcess.checkEvent(Events.ExitApp, 0, rpcName, rpcArgs)) {
  //     MainProcess.mainWindow().close();
  //   }
  // }
  // private static checkEvent(rpcName: string, argcount: number, got_name: string, got_args: any): boolean {
  //   var b: boolean = false;
  //   if (rpcName.localeCompare(got_name) == 0) {
  //     b = true;
  //     if (((got_args === null || got_args === undefined) && argcount > 0) || (got_args && got_args.length !== argcount)) {
  //       throw new Error("Event " + got_name + " had " + got_args.length + " args, needed " + argcount);
  //     }
  //   }
  //   return b;
  // }
  private createWindow(jsFile: string, width: number = 800, height: number = 600, fullscreen: boolean = false, is_modal: boolean = false): BrowserWindow {
    let that = this;
    let bw: BrowserWindow;

    bw = new BrowserWindow({
      height: height,
      width: width,
      fullscreen: fullscreen,
      autoHideMenuBar: true, //hide menu bar
      titleBarStyle: 'hidden',
      icon: './icon.png',
      modal: is_modal ? true : false,
      minimizable: is_modal ? true : false,
      maximizable: is_modal ? true : false,
      fullscreenable: is_modal ? true : false,
      //frame:false,//hides frame.
      webPreferences: {
        devTools: true,
        preload: path.join(MainProcess.appPath(), 'preload.js'), // only if nodeintegration is false.
        nodeIntegration: false, //Access node on rendering thread. IPC is for more secure apps. This is a destkop app. Disable this for server or web apps.
        contextIsolation: true, //set to false for desktop only when nodeintegration=true
        //enableRemoteModule: false /*  */
      }
    });

    //Dynamcially load the index file,then dynamically load the script.
    //Simply sending text/html to the window doesn't work in Electron. If it did, we could get rid of the HTML file alltogther.
    bw.loadFile(path.join(MainProcess.appPath(), "index.html"));
    bw.webContents.once('dom-ready', () => {
      bw.webContents.executeJavaScript(
        " var s = document.createElement('script'); " +
        " s.type = 'text/javascript'; " +
        " s.src = '" + jsFile + "';  " +
        " document.body.appendChild(s); " +
        ""
      );
    });

    return bw;
  };
  private createMenu(): void {
    let that = this;
    const menu = new Menu()
    menu.append(new MenuItem({
      label: 'File',
      submenu: [
        {
          label: 'Fullscreen',
          accelerator: 'F11',
          click: () => {
            MainProcess.mainWindow().setFullScreenable(true);
            MainProcess.mainWindow().setFullScreen(!MainProcess.mainWindow().isFullScreen());
          }
        },

        {
          label: 'Devtools',
          role: 'toggleDevTools',
          accelerator: 'F12',
          click: () => { MainProcess.mainWindow().webContents.openDevTools(); }
        },
        {
          label: 'About',
          role: 'about',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
          click: () => {
            that.createWindow('AboutWindow.js', 800, 600, false, false)

          }
        },
        {
          label: 'Exit',
          role: 'quit',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+I' : 'Ctrl+W',
          click: () => { that.ExitApp(); }
        },
      ]
    }))
    Menu.setApplicationMenu(menu)
  }

  private static async getFiles(dir: string): Promise<Array<string>> {
    let flist: Array<string> = new Array<string>();
    let fq: string = path.join(MainProcess.appPath(), dir);
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
  private static registerCallbacks(): void {
    ipcMain.handle(RPCMethods.openFolderDialog, async (event, arg) => {
      const { canceled, filePaths } = await dialog.showOpenDialog(MainProcess.mainWindow());
      if (canceled) {
        return;
      } else {
        return filePaths[0]
      }
    });
    ipcMain.handle(RPCMethods.path_join, async (event, arg) => {
      return path.join(arg[0], arg[1]);
    });
    ipcMain.handle(RPCMethods.fs_access, async (event, arg) => {
      try {
        await fs.access(arg[0], arg[1]);
        return true;
      }
      catch {
        return false;
      }
    });
    ipcMain.handle(RPCMethods.fs_readFile, async (event, arg) => {
      try {
        const { buffer } = await fs.readFile(arg[0]);
        //In order to passa buffer to/from the main process you either need to serialize or use electron.remote .. ugh
        //https://github.com/electron/electron/issues/2104
        //https://github.com/electron/electron/issues/9509  
//        console.log(buffer);
        var xy = Buffer.from(buffer);//what the actual
        // console.log(xy);
        // var x2 = (xy as Uint8Array).buffer;//what the actual
        // console.log(x2);

        return xy;
      }
      catch (ex){
        console.log(ex);
        return null;
      }
    });
    ipcMain.handle(RPCMethods.fs_readdir, async (event, arg) => {
      try {
        const files = await fs.readdir(arg[0]);
        return files;
      }
      catch (err) {
        console.log(err);
        return []; //no files.
      }
    });
    ipcMain.handle(RPCMethods.process_cwd, async (event, arg) => {
      return process.cwd();
    });
  }

}

let _mainProcess: MainProcess;

app.on('ready', () => {
  _mainProcess = new MainProcess();
});
app.on('window-all-closed', () => {
  if (_mainProcess) {
    _mainProcess.ExitApp();
  }
});

export { _mainProcess };