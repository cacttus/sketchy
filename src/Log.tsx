import { Remote } from "./Remote";


//@class Log
//@purpose Client+Server logger class. Logs messages between both client and server (when available).
export class Log {
  public static debug(str: string) {
    str = "[debug] " + str;
    console.log(str);
    Remote.logConsole(str);
  }
  public static info(str: string) {
    str = "[info] " + str;
    console.log(str);
    Remote.logConsole(str);
  }
  public static warn(str: string) {
    str = "[warn] " + str;
    console.log(str);
    Remote.logConsole(str);
  }
  public static error(str: string) {
    str = "[error] " + str;
    console.log(str);
    Remote.logConsole(str);
  }
}