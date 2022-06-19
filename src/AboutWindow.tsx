import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as fs from 'fs/promises';
import * as path from 'path';

export class AboutWindow {
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

        <div className="container-fluid h-100">
          <div className="row justify-content-center h-100">
            <div className="col-12">

              About:
              This is the about window.

            </div>
          </div>
        </div>

      </React.StrictMode>
    );

    //don't delete. This is IPC channel we
    // RenderThread.send(Events.GetFiles, ["testdata"]);
    // RenderThread.receive((id: string, data: any) => {
    //  console.log("Got " + id + " data:" + data);
    // });
  }

}
