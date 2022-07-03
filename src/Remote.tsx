import { IpcRenderer } from "electron";
import { Stats } from "webpack";

export class RPCMethods {
  public static test: string = "test";
  public static showOpenDialog: string = "showOpenDialog";
  public static createWindow: string = "createWindow";
  public static createWindowDetails: string = "createWindowDetails";
  public static path_join: string = "path_join";
  public static fs_access: string = "fs_access";
  public static fs_readFile: string = "fs_readFile";
  public static fs_writeFile: string = "fs_writeFile";
  public static fs_readdir: string = "fs_readdir";
  public static fs_mkdir: string = "fs_mkdir";
  public static fs_stat: string = "fs_stat";
  public static process_cwd: string = "process_cwd";
  public static setTitle: string = "setTitle";
  public static setSize: string = "setSize";
  public static showWindow: string = "showWindow";
  public static closeWindow: string = "closeWindow";
  public static logConsole: string = "logConsole";
  public static isFile: string = "isFile";
  public static isDirectory: string = "isDirectory";
  public static path_resolve: string = "path_resolve";
  public static callWindow: string = "callWindow";
  public static replyWindow: string = "replyWindow";

  public static onResize: string = 'onResize';
}

//This is a copy of ELectron's interface
export class FileFilter {

  // Docs: https://electronjs.org/docs/api/structures/file-filter

  extensions: string[];
  name: string;
}

export class Remote {
  public constructor() {
    var that = this;
  }
  public static send(event: string, ...args: any[]): void {
    // Send event to main.
    (window as any).api.send(event, ...args);
  }
  public static receive(event: string, callback: (...args: any[]) => void): void {
    (window as any).api.receive(event, (event: Electron.IpcRendererEvent, ...args: any[]) => {
      // "spread syntax" (va_args) and just pass it in. Pretty neat.
      callback(...args);
    });
  }
  public static test(a: string, num1: number, num2: number): Promise<string> {
    return (window as any).api.callSync("test", [a, num1, num2]);
  }
  public static showOpenDialog(title: string, defaultDir: string, folder: boolean, multiselect: boolean, filters: Array<FileFilter> = null, showHiddenFiles: boolean = false): Promise<any> {
    return (window as any).api.callSync(RPCMethods.showOpenDialog, title, defaultDir, folder, multiselect, filters, showHiddenFiles);
  }
  public static path_join(path1: string, path2: string): Promise<string> {
    return (window as any).api.callSync(RPCMethods.path_join, path1, path2);
  }
  public static path_resolve(path1: string): Promise<string> {
    //Returns the fully rooted path
    return (window as any).api.callSync(RPCMethods.path_resolve, path1);
  }
  public static fs_access(path: string, mode?: number): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.fs_access, path, mode);
  }
  public static fs_readFile(path1: string): Promise<Buffer> {
    return (window as any).api.callSync(RPCMethods.fs_readFile, path1).then((val: any) => {
      try {
        return val;
      }
      catch (ex) {
        console.log(ex);
        return ex;
      }
    });
  }
  public static fs_writeFile(fileLoc: string, fileContents: string): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.fs_writeFile, fileLoc, fileContents);
  }
  public static fs_mkdir(dir: string): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.fs_mkdir, dir);
  }
  public static fs_readdir(path1: string): Promise<Array<string>> {
    return (window as any).api.callSync(RPCMethods.fs_readdir, path1);
  }
  public static fs_stat(path: string): Promise<Stats> {
    return (window as any).api.callSync(RPCMethods.fs_stat, path);
  }
  public static process_cwd(): Promise<string> {
    return (window as any).api.callSync(RPCMethods.process_cwd);
  }
  public static createWindow2(title: string, jsFile: string, width: number = 800, height: number = 600, fullscreen: boolean = false): Promise<number> {
    //Returns the window id
    return (window as any).api.callSync(RPCMethods.createWindowDetails, title, jsFile, width, height, fullscreen);
  }
  public static createWindow(jsFile: string): Promise<number> {
    //Returns the window id
    return (window as any).api.callSync(RPCMethods.createWindow, jsFile);
  }
  public static setTitle(winID: number, title: string): Promise<void> {
    return (window as any).api.callSync(RPCMethods.setTitle, winID, title);
  }
  public static setSize(winID: number, w: number, h: number): Promise<void> {
    return (window as any).api.callSync(RPCMethods.setSize, winID, w, h);
  }
  public static showWindow(winID: number, show: boolean): Promise<void> {
    return (window as any).api.callSync(RPCMethods.showWindow, winID, show);
  }
  public static closeWindow(winID: number): Promise<void> {
    return (window as any).api.callSync(RPCMethods.closeWindow, winID);
  }
  public static fileExists(file: string): Promise<boolean> {
    return Remote.fs_stat(file).then((value: Stats) => {
      return (value !== null && value !== undefined);
    });
  }
  public static fs_readAllText(file: string): Promise<string> {
    return Remote.fs_readFile(file).then((buf: Buffer) => {
      if (buf.constructor !== Uint8Array) {
        console.log("Warning: input file was not a uin8array, could produce errors.");
        console.log("  buf= " + buf);
      }
      else {
        console.log("buf was uint8array");
      }
      let stringret = String.fromCharCode.apply(null, [...buf]);
      return stringret;
    });
  }
  public static fs_readAllLines(file: string): Promise<string[]> {
    return Remote.fs_readAllText(file).then((text: string) => {
      let lines: string[] = text.toString().split(/(?:\r\n|\r|\n)/g);
      return lines;
    });
  }
  public static logConsole(str: string): Promise<void> {
    return (window as any).api.callSync(RPCMethods.logConsole, str)
  }
  public static isFile(path: string): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.isFile, path)
  }
  public static isDirectory(path: string): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.isDirectory, path)
  }

}
