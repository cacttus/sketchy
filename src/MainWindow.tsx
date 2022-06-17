import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Events, Gu } from "./Globals";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import {Tray, clipboard} from 'electron';
//const fs = require('fs');
//const path = require('path');
import * as fs from 'fs/promises';
import * as path from 'path';
import { BrowserWindow } from 'electron';
import { Stats } from "webpack";

export class RenderThread {
  public constructor() {
    var that = this;

    //var api = (window as any).api;
    // const image = clipboard.readImage()
    // const appIcon = new Tray(image)
    // console.log(appIcon)

    //https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
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

              <div className="row justify-content-center flex-grow-1">
                  <button className="btn btn-primary" style={{ maxWidth: '10em' }} onClick={that.randomImage}>Random Image</button>
                  <img id="theImage" style={{ border: 'none', display: 'block' }}></img>
              </div>  

              <div className="row justify-content-center fixed-bottom">
                <div className="progress" style={{ height: '.3em' }}>
                  {/* @ts-expect-error */}
                  <div className="progress-bar w-75" style={{ height: '.3em' }} role="progressbar" aria-valuenow="34" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>


            </div>

          </div>
        </div>

      </React.StrictMode>
    );

    // RenderThread.send(Events.GetFiles, ["testdata"]);
    // RenderThread.receive((id: string, data: any) => {
    //  console.log("Got " + id + " data:" + data);
    // });
  }
  private randomImage(): void {

    var files: Array<string> = new Array<string>();
    RenderThread.getFiles('/testdata').then(
      (value: Array<string>) => {
        files = value;
        //value.forEach((value,index,array)=>{
        //  console.log(value);
        //});
      }).then(() => {
        if (files && files.length > 0) {

          var n = Math.floor(Math.random() * files.length);
          var file = files[n];

          var fullPath: string = path.join(__dirname, path.join('/testdata', file));

          fs.access(fullPath).then(() => {
            fs.readFile(fullPath).then((value: Buffer) => {
              var valueString = value.toString('base64');
              $("#theImage").attr("src", "data:image/png;base64," + valueString + "");
              //$('#theImage').html('<img style="display:inline-block" width="100%" height="100%" src="data:image/png;base64,' + valueString + '" />');
            });
          });
        }
      });
  }
  private static async getFiles(dir: string): Promise<Array<string>> {
    var flist: Array<string> = new Array<string>();
    var fq: string = path.join(__dirname, dir);
    return fs.readdir(fq);
    //const files: any = await ;
    //for (const file of files) {
    //  flist.push(file);
    //}
    //return flist;
  }
  public static send(event: string, data: any = null): void {
    //Send event to main.
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
  public static exitApp(): void {
    this.send(Events.ExitApp);
  }
}

//Global render thread
var rt: RenderThread;
$(document).ready(() => {
  rt = new RenderThread();
}
);