import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";

export class MainWindow {
  public constructor() {
    let that = this;

    //https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
    //https://stackoverflow.com/questions/18083389/ignore-typescript-errors-property-does-not-exist-on-value-of-type
    console.log("INITIALIZING REACT DOM");
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    root.render(
      <React.StrictMode>
        {/* Window base should be an individusl react component */}
        <div className="container-fluid h-100">
          <div className="row justify-content-center h-100">
            <div className="col-12">

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
          </div>
        </div>

      </React.StrictMode>
    );


    Remote.test("a", 0.00001, 3.14).then((val: string) => {
      console.log(val);
    })

    //don't delete. This is IPC channel we
    // RenderThread.send(Events.GetFiles, ["testdata"]);
    // RenderThread.receive((id: string, data: any) => {
    //  console.log("Got " + id + " data:" + data);
    // });
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

          await Remote.fs_access(fullPath).then( async () => {
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

//It would be nice to get rid of this and have the window class automatically created in the Main process.

//Global render thread
let rt: MainWindow;
$(document).ready(() => {
  rt = new MainWindow();
}
);