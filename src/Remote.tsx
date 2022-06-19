
export class RPCMethods {
  public static test: string = "test";
  public static openFolderDialog: string = "openFolderDialog";
  public static path_join: string = "path_join";
  public static fs_access: string = "fs_access";
  public static fs_readFile: string = "fs_readFile";
  public static fs_readdir: string = "fs_readdir";
  public static process_cwd: string = "process_cwd";

}

export class Remote {
  public constructor() {
    var that = this;
  }
  public static send(event: string, data: any = null): void {
    // Send event to main.
    var api = (window as any).api;
    api.send(event, data);
  }
  public static receive(func: any): void {
    //Receive from main.
    var api = (window as any).api;
    api.receive((id: string, data: any) => {
      func(id, data);
    });
  }
  public static test(a: string, num1: number, num2: number): Promise<string> {
    return (window as any).api.callSync("test", [a, num1, num2]);
  }
  public static openFolderDialog(root: string): Promise<string> {
    return (window as any).api.callSync(RPCMethods.openFolderDialog, root);
  }
  public static path_join(path1: string, path2: string): Promise<string> {
    return (window as any).api.callSync(RPCMethods.path_join, path1, path2);
  }
  public static fs_access(path: string, mode?: number): Promise<boolean> {
    return (window as any).api.callSync(RPCMethods.fs_access, path, mode);
  }
  public static fs_readFile(path1: string): Promise<Buffer> {
    //returns the raw data. .. for some reason there is a parse problem.

    return (window as any).api.callSync(RPCMethods.fs_readFile, path1).then((val: any) => {
      try {
        //Should be a blob
        const buf = (val as Uint8Array).buffer;
        console.log(buf);
        return buf;
      }
      catch (ex) {
        console.log(ex);
        return ex;
      }
    });
  }
  public static fs_readdir(path1: string): Promise<Array<string>> {
    return (window as any).api.callSync(RPCMethods.fs_readdir, path1);
  }
  public static process_cwd(): Promise<string> {
    return (window as any).api.callSync(RPCMethods.process_cwd);
  }


}
