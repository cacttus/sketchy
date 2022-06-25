import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { RPCMethods } from "./Remote"

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

    MainProcess._windows.push(MainProcess.createWindowDetails('Sketchy', 'MainWindow.js', 800, 600, false, false));

    //Register RPC callbacks
    MainProcess.registerCallbacks();

    that.createMenu();
  }

  public static createWindowDetails(titlef: string, jsFile: string, width: number = 800, height: number = 600, fullscreen: boolean = false, is_modal: boolean = false): BrowserWindow {
    let bw: BrowserWindow;

    console.log("New window: " + jsFile);

    bw = new BrowserWindow({
      title: titlef,
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
      show: true, //Initially hide the window. This is for setting the window's custom properties or else it would animate.
      //frame:false,//hides frame.
      webPreferences: {
        devTools: true,
        preload: path.join(MainProcess.appPath(), 'preload.js'), // only if nodeintegration is false.
        nodeIntegration: false, //Access node on rendering thread. IPC is for more secure apps. This is a destkop app. Disable this for server or web apps.
        contextIsolation: true, //set to false for desktop only when nodeintegration=true
        //enableRemoteModule: false /*  */
      }
    });
    const fname = path.basename(jsFile);
    const ext = path.extname(jsFile);
    const className = path.basename(fname, ext);

    //Dynamcially load the index file,then dynamically load the script.
    //Simply sending text/html to the window doesn't work in Electron. If it did, we could get rid of the HTML file alltogther.
    let indexFileName = "index.html";
    let indexFileloc = path.join(MainProcess.appPath(), indexFileName);
    console.log(indexFileName + " location: " + indexFileloc);
    bw.loadFile(indexFileloc);

    //Dynamically create the window js file.
    var nl = "\n";
    bw.webContents.once('dom-ready', () => {
      console.log("Server:Creating window: " + jsFile + " class: " + className + " id: " + bw.id);
      bw.webContents.executeJavaScript(
        " console.log(\"Window: " + jsFile + "\"); " + nl +
        " var ___winTypeStr = '" + className + "';" + nl +
        " var ___winID = " + bw.id + ";" + nl +
        " var ___win = undefined; " + nl +
        " var s = document.createElement('script'); " + nl +
        " s.type = 'text/javascript'; " + nl +
        " s.src = '" + jsFile + "';  " + nl +
        " document.body.appendChild(s); " + nl +
        " s.onload = function(){" + nl +
        "   console.log(\"Exported Webpack App is: \"); " + nl +
        "   console.log(ElectronApp); " + nl +
        "   ___win = new ElectronApp." + className + ";" + nl +
        "   ___win.init();" + nl +
        " }; " + nl +
        ""
      );
    });

    return bw;
  };
  public ExitApp(): void {
    app.quit();
  }

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
        // {
        //   // label: 'About',
        //   // role: 'about',
        //   // accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
        //   // click: () => {
        //   //   MainProcess.createWindow('AboutWindow.js', 800, 600, false, false)
        //   // }
        // },
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
        const  buffer = await fs.readFile(arg[0]);
        //In order to passa buffer to/from the main process you either need to serialize or use electron.remote .. ugh
        //https://github.com/electron/electron/issues/2104
        //https://github.com/electron/electron/issues/9509  
        //        console.log(buffer);
        var xy = Buffer.from(buffer);//what the actual
        return xy;
      }
      catch (ex) {
        console.log(ex);
        return null;
      }
    });
    ipcMain.handle(RPCMethods.fs_writeFile, async (event, arg) => {
      try {
        await fs.writeFile(arg[0], arg[1]).then((value: void) => {
          return true;
        }, (reason: any) => {
          console.log(reason);
          return false;
        });
      }
      catch (ex) {
        console.log(ex);
        return false;
      }
    });
    ipcMain.handle(RPCMethods.fs_mkdir, async (event, arg) => {
      try {
        await fs.mkdir(arg[0]).then(
          (value: void) => { 
            return true;
          }, 
          (reason:any)=>{console.log(reason); 
            return false;
          });
      }
      catch (ex) {
        console.log(ex);
        return false;
      }
    });
    ipcMain.handle(RPCMethods.fs_stat, async (event, arg) => {
      //returns Stats, or null if DNE
      try {
        return await fs.stat(arg[0]);
      }
      catch (ex) {
        console.log(ex);
        return null;
      }
    });
    ipcMain.handle(RPCMethods.fs_readdir, async (event, arg) => {
      try {
        const files : any = await fs.readdir(arg[0]);
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
    ipcMain.handle(RPCMethods.createWindowDetails, async (event, arg) => {
      let bw: BrowserWindow = MainProcess.createWindowDetails(arg[0], arg[1], arg[2], arg[3], arg[4], false);
      return bw.id;
    });
    ipcMain.handle(RPCMethods.createWindow, async (event, arg) => {
      let bw: BrowserWindow = MainProcess.createWindowDetails("no-title", arg[0], 10, 10, false, false);
      return bw.id;
    });
    ipcMain.handle(RPCMethods.setTitle, async (event, arg) => {
      try {
        console.log("Setting window " + arg[0] + " title " + arg[1]);
        var bw = BrowserWindow.fromId(arg[0]);
        bw.setTitle(arg[1]);
      }
      catch (ex) {
        console.log(ex);
      }
    });
    ipcMain.handle(RPCMethods.setSize, async (event, arg) => {
      try {
        console.log("Setting window " + arg[0] + " size " + arg[1] + "," + arg[2]);
        var bw = BrowserWindow.fromId(arg[0]);
        bw.setSize(arg[1], arg[2]);
      }
      catch (ex) {
        console.log(ex);
      }
    });
    ipcMain.handle(RPCMethods.showWindow, async (event, arg) => {
      try {
        console.log("Show window " + arg[0] + " : " + arg[1]);
        var bw = BrowserWindow.fromId(arg[0]);
        if (arg[1]) {
          bw.show();
        }
        else {
          bw.hide();
        }
      }
      catch (ex) {
        console.log(ex);
      }
    });
    ipcMain.handle(RPCMethods.closeWindow, async (event, arg) => {
      //returns Stats, or null if DNE
      try {
        console.log("Closing window " + arg[0]);
        var bw = BrowserWindow.fromId(arg[0]);
        bw.close();
      }
      catch (ex) {
        console.log(ex);
        return null;
      }
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