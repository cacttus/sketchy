import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote, RPCMethods, ErrorCode } from "./Remote";
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
  private _rpcPromise: Promise<any> = null;

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
    // /* @ts-ignore */
    // Remote.showWindow(___winID, true); //window must be manually shown

    //Window events...
    Remote.receiveBind(RPCMethods.onResize, (...args: any[]) => {
      //This is the onResize event for THIS window
      //Technically this can go away.
      console.log("Renderer:onResize: " + args);
      that.onResize(args[0], args[1]);
    });
    Remote.receiveBind(RPCMethods.callWindow, (...args: any[]) => {
      //Call a method on THIS window from ANTOHER window
      //window-window communication is: callWindow -> replyWindow
      console.log("Renderer:CallWindow:args:" + args)

      let from: number = args[0];
      let to: number = args[1];
      let func: string = args[2];
      args.splice(0, 3);

      //console.log("Calling: from:'" + from + "' to:'" + to + "' func:'" + func + "' '" + fargs + "'");
      let res = Object.getPrototypeOf(that)[func].bind(that)(args)

      Remote.send(RPCMethods.replyWindow, to, from, func, res);
    });
    Remote.receiveBind(RPCMethods.windowEvent, (...args: any[]) => {
      //Window events from other windows
      console.log("Renderer:WindowEvent:" + args)

      let winId: number = args[0];
      let eventName: string = args[1];
      args.splice(0, 2);

      that.receiveEvent(winId, eventName, ...args);
    });
    document.addEventListener('mousemove', (e: MouseEvent) => {
      let cp: vec2 = new vec2();
      cp.x = e.clientX;
      cp.y = e.clientY;
      let delta: vec2 = new vec2();
      delta.x = e.movementX;
      delta.y = e.movementY;

      that.onMouseMove(cp, delta);
    });
  }
  protected async callWindow(winId: number, func: string, ...args: []): Promise<any> {
    // @fn callWindow
    // @details Window-Window communication
    // @note callWindow only works if the given input window ID has been created
    console.log("CallWindow:" + winId + "," + func + "," + args)
    Remote.send(RPCMethods.callWindow, this.winId(), winId, func, args);

    return new Promise<any>((resolve: any, reject: any) => {
      Remote.receiveOnce(RPCMethods.replyWindow, (...args: any[]) => {
        console.log("Renderer:ReplyWindow:" + args);
        let error: number = args[0];
        let from: number = args[1];
        let to: number = args[2];
        let func: string = args[3];
        let res: string = args[4];

        if (error !== ErrorCode.Success) {
          reject();
        }
        else {
          resolve(res);
        }
      });
    });
  }
  protected async init?(): Promise<void>; //Do async stuff here. Called after the constructor.
  protected winId() {
    //This is an automatic constant that the main process appends to the loaded .js file.
    /* @ts-ignore */
    return ___winID;
  }
  protected onMouseMove?(curPos: vec2, delta: vec2) { }
  protected onResize?(width: number, height: number) { }
  protected getCreateInfo?(): WindowCreateInfo;
  protected render?(): JSX.Element;//Window controls here.
  protected receiveEvent?(winId: number, externalWindowEvent: string, ...args: any[]) {
    //Override this method in subclass to get close/show/open events from other windows.
  }
  protected sendEvent(event: string, ...args: any[]): void {
    //Broadcast a close/show/open event to toher windows
  }
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
  public show(): void {
    /*@ts-ignore*/
    Remote.showWindow(___winID, true);
  }
  public hide(): void {
    /*@ts-ignore*/
    Remote.showWindow(___winID, false);
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
          <div className="row h-100  align-items-center justify-content-center">
            {/* Your Window Controls here. */}
            {ctl}
          </div>
        </div>
      </React.StrictMode>
    );
  }
}
