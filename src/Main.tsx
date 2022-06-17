import { LoadURLOptions, app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as ReactDOMServer from 'react-dom/server';
import { Events, Gu } from './Globals';

// class Window {
//  public browserWindow : BrowserWindow ;
//  public constructor(bw:BrowserWindow){
//    this.browserWindow=bw;
//  }
// }

class MainProcess {
  private static _windows: Array<BrowserWindow> = new Array<BrowserWindow>();

  public static mainWindow(): BrowserWindow { return this._windows[0]; }

  public constructor() {
    var that = this;

    //Main event handling code.
    MainProcess.receive((id: string, args: any) => {
      that.handleEvents(id, args);
    });

    MainProcess._windows.push(that.createWindow('MainWindow.js', 800, 600, false, false));

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

  public ExitApp(): void {
    app.quit();
  }
  private static send(event: string, data: any = null): void {
    MainProcess.mainWindow().webContents.send("fromMain", [event, data]);
  }
  private static receive(func: any): void {
    ipcMain.on("toMain", (event: Electron.IpcMainEvent, args: any) => {

      var sys_id: string = args[0];
      var actual_args: any = args[1];

      console.log("Main:" + sys_id);

      func(sys_id, actual_args);
    });
  }
  private handleEvents(id: string, args: any): void {
    if (MainProcess.checkEvent(Events.GetFiles, 1, id, args)) {
      var f = MainProcess.getFiles(args[0]).then((value: Array<string>) => {
        MainProcess.send(Events.GetFiles, value);
      });
    }
    else if (MainProcess.checkEvent(Events.ExitApp, 0, id, args)) {
      MainProcess.mainWindow().close();
    }
  }
  private static checkEvent(check_id: string, argcount: number, got_id: string, got_args: any): boolean {
    var b: boolean = false;
    if (check_id.localeCompare(got_id) == 0) {
      b = true;
      if (((got_args === null || got_args === undefined) && argcount > 0) || (got_args && got_args.length !== argcount)) {
        throw new Error("Event " + got_id + " had " + got_args.length + " args, needed " + argcount);
      }
    }
    return b;
  }
  private createWindow(jsFile: string, width: number = 800, height: number = 600, fullscreen: boolean = false, is_modal: boolean = false): BrowserWindow {
    var that = this;
    var bw: BrowserWindow;

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
        //preload: path.join(MainProcess.appPath(), 'preload.js'),
        nodeIntegration: true, //Access node on rendering thread. IPC is for more secure apps. This is a destkop app. Disable this for server or web apps.
        contextIsolation: false,
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


var m: MainProcess;


app.on('ready', () => {
  m = new MainProcess();
});
app.on('window-all-closed', () => {
  if (m) {
    m.ExitApp();
  }
});
