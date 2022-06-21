import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";
import { Controls } from "./Controls";

export class SettingsWindow extends ElectronWindow {
  private _settingsFile: string = "./settings.txt";

  public constructor() {
    super();
    this.load();
  }
  protected title?(): string { return "About"; }
  protected width?(): number { return 400; }
  protected height?(): number { return 400; }
  protected override render(): JSX.Element {
    let that = this;
    return (
      <div>
        <Controls.Checkbox id="Settings_Repeat" label="Repeat" defaultChecked={true} onChange={that.save()}></Controls.Checkbox>
        <Controls.TimePicker id="Settings_Time" value='5:00' onChange={that.save()} />
      </div>
    );
  }
  private save(): void {
    let that = this;
    console.log("saving settings " + that._settingsFile);
    let settings: string = "";
    settings += "time" + "=" + $('#Settings_Time').val();
    Remote.fs_writeFile(that._settingsFile, settings).then(() => { },
      (reason: any) => {
        console.log(reason);
      });
  }
  private async load(): Promise<void> {
    let that = this;
    let stats = await Remote.fs_stat(that._settingsFile);
    if (stats !== null) {
      console.log(stats);
      console.log("loading settings");
      const value: Buffer = await Remote.fs_readFile(that._settingsFile);
      console.log(value);
      let settings = '' + value;
      console.log(settings);
      let lines = settings.toString().split(/(?:\r\n|\r|\n)/g);
      console.log(lines);
      lines.forEach((val, i, arr) => {
        console.log(val);
      });
    }
    else {
      console.log("No settings file exists.");
    }



  }
}
