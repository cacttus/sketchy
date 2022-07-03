
/*
  Nifty little config file that allows us to save/load settings.
  6/24/2022
*/
import { Remote } from "./Remote";

type ConfigFilePairSetter = (val: string) => void;
type ConfigFilePairGetter = (key: string) => string;
export class ConfigFilePair {
  public _getter: any;
  public _setter: any;
  public constructor(setter: ConfigFilePairSetter, getter: ConfigFilePairGetter) {
    this._getter = getter;
    this._setter = setter;
  }
}
interface ConfigFilePairEntry {
  [key: string]: ConfigFilePair;
}
export class ConfigFile {
  private _filepath: string = '';
  private _pairs: ConfigFilePairEntry;
  public constructor(filepath: string, pairs: ConfigFilePairEntry) {
    this._pairs = pairs;
    this._filepath = filepath;
  }
  public async load(): Promise<void> {
    let that = this;
    let filepath: string = that._filepath;
    if (await Remote.fileExists(filepath)) {
      console.log("Loading settings " + filepath);
      let lines = await Remote.fs_readAllLines(filepath);
      lines.forEach((line, i, arr) => {
        let index = line.indexOf("=");
        let key = line.substring(0, index);
        let val = line.substring(index + 1);
        if (that._pairs[key] !== undefined) {
          console.log('k = ' + key + ' v = ' + val);
          that._pairs[key]._setter(val);
        }
        else {
          console.log("key '" + key + "' was not found " );
        }
      });
    }
  }
  public async save(): Promise<void> {
    let filepath: string = this._filepath;

    console.log("Saving settings " + filepath);
    let settings: string = "";

    for (var key in this._pairs) {
      let val = this._pairs[key]._getter();
      settings += key + "=" + val + "\n";
    }

    Remote.fs_writeFile(filepath, settings).then(() => { },
      (reason: any) => {
        console.log(reason);
      });
  }
}
