import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote, RPCMethods } from "./Remote";
import { Controls } from "./Controls";
import { Log } from "./Log";
import internal from "stream";
import { throwDeprecation } from "process";
import { vec2 } from './Math'

export class WindowCreateInfo {
  public _title: string = "unset-title";
  public _width: number = 10;
  public _height: number = 10;
}

//The purpose of this class is to provide base methods for a client-side window
//And to create the window in the constructor 
export class ElectronWindow {
  public constructor() {
    let that = this;
    console.log("ElectronWindow:ctor")

    this.initReactWindow();

    let inf: WindowCreateInfo = this.getCreateInfo();
    if (inf === undefined || inf === null) {
      Log.info("Error: Window create info was not defined.");
    }
    //___winID is manually injected on the server via eval(), so TS will not know it exists.
    /* @ts-ignore */
    Remote.setTitle(___winID, inf._title);
    /* @ts-ignore */
    Remote.setSize(___winID, inf._width, inf._height);
    /* @ts-ignore */
    Remote.showWindow(___winID, true);

    //Window events...
    Remote.receive(RPCMethods.onResize, (json:any) => {
      that.onResize(json.width, json.height);
    });
    document.addEventListener('mousemove',(e:MouseEvent)=>{
      let cp : vec2 = new vec2();
      cp.x = e.clientX;
      cp.y = e.clientY;
      let delta : vec2 = new vec2();
      delta.x = e.movementX;
      delta.y = e.movementY;
      that.onMouseMove(cp,delta);
    });
    //...
  }
  protected async init?(): Promise<void>; //Do async stuff here. Called after the constructor.
  protected winId() {
    //This is an automatic constant that the main process appends to the loaded .js file.
    /* @ts-ignore */
    return ___winID;
  }
  protected onMouseMove?(curPos:vec2, delta:vec2) { }
  protected onResize?(width:number, height:number) { }
  protected getCreateInfo?(): WindowCreateInfo;
  protected render?(): JSX.Element;//Window controls here.
  protected viewportWidth(): number {
    //Width of window viewport, "client width" in Windows. 
    return $(window).width();
  }
  protected viewportHeight(): number {
    //Height of window viewport, "client height" in Windows. 
    return $(window).height();
  }
  public close(): void {
    /*@ts-ignore*/
    Remote.closeWindow(___winID);
  }
  private initReactWindow(): void {
    console.log("Initializing React");
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    var ctl = this.render();
    //var statusbar = Controls.StatusBar();

    root.render(
      <React.StrictMode>
        <div className="container-fluid h-100">
          <div className="row justify-content-center h-100">
            <div className="col-12">
              {/* Your Window Controls here. */}
              {ctl}
            </div>
          </div>
        </div>
      </React.StrictMode>
    );
  }
}
