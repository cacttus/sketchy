import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";

export class MainWindow extends ElectronWindow {
  public constructor() {
    super();
  }
  protected title?(): string { return "Main"; }
  protected width?(): number { return 800; }
  protected height?(): number { return 600; }
  protected override render(): JSX.Element {
    let that = this;
    return (
      
      <div>
        {/* <div className="row justify-content-left">

            <strong id="filePath">(none yet..)</strong>
            <button className="btn" type="button" onClick={
              async () => {
                let x = await Remote.openFolderDialog("./");
                $('#filePath').html(x);
              }}>Open folder</button>
            <button className="btn" type="button" onClick={() => { }}>Exit</button>
            <div className="dropdown">
              <button className="btn btn-dark btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Dropdown button
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a className="dropdown-item" href="#">Action</a>
                <a className="dropdown-item" href="#">Another action</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#">Something else here</a>
              </div>
            </div>
          </div> */}

        <div className="row justify-content-center">
          <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={async () => { await Remote.createWindow("AboutWindow.js"); }}>CWD:<span id="CWD"></span></button>
          <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={async () => { $('#CWD').html(await Remote.process_cwd()); }}>CWD:<span id="CWD"></span></button>
          <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={async () => {
            let fq: string = await Remote.path_join(await Remote.process_cwd(), '/testdata');
            let xx = await Remote.fs_readdir(fq);
            $('#FILES').html(xx.join('<br/>'));
          }}></button>
          <div id="FILES"></div>
          <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={that.randomImage}>Random Image</button>
          {/* <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={that.start}>Start</button>
            <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={that.stop}>Stop</button> */}
          <img id="theImage" style={{ maxWidth: '100%', height: '100%', width: 'auto', maxHeight: '100%' }}></img>
        </div>

        <div className="row justify-content-center fixed-bottom">
          <div className="col-12">
            <div className="progress" style={{ height: '.3em' }}>
              {/* @ts-expect-error */}
              <div className="progress-bar" style={{ height: '.3em' }} role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // private _cycleTime: number = 1000; // 5min
  // private _timer: any;

  // private start(): void {
  //   var that = this;
  //   var i = 100;
  //   this._timer = setInterval(() => {
  //     i--;
  //     if (i > 0) {
  //       $('.progress-bar').css('width', i + '%');
  //     } else {
  //       clearInterval(that._timer);
  //     }
  //   }, 1000);
  // }
  // private stop(): void {
  //   clearInterval(this._timer);
  // }
  private randomImage(): void {
    let files: Array<string> = new Array<string>();
    MainWindow.getFiles('/testdata').then(
      (value: Array<string>) => {
        files = value;
      }).then(async () => {
        if (files && files.length > 0) {

          let n = Math.floor(Math.random() * files.length);
          let file = files[n];

          let fullPath: string = await Remote.path_join(await Remote.process_cwd(), await Remote.path_join('/testdata', file));

          await Remote.fs_access(fullPath).then(async () => {
            await Remote.fs_readFile(fullPath).then((value: Buffer) => {
              $("#theImage").attr("src", URL.createObjectURL(
                new Blob([value], { type: 'image/jpg' } /* (1) */)
              ));
            });
          });
        }
      });
  }
  private static async getFiles(dir: string): Promise<Array<string>> {
    let flist: Array<string> = new Array<string>();
    let fq: string = await Remote.path_join(await Remote.process_cwd(), dir);
    return await Remote.fs_readdir(fq);
  }

}
