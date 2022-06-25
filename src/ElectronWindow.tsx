import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { Controls } from "./Controls";

//The purpose of this class is to provide base methods for a client-side window
//And to create the window in the constructor 
export class ElectronWindow {
  public constructor() {
    console.log("ElectronWindow:ctor")

    this.initReactWindow();

    /* @ts-ignore */
    Remote.setTitle(___winID, this.title());
    /* @ts-ignore */
    Remote.setSize(___winID, this.width(), this.height());
    /* @ts-ignore */
    Remote.showWindow(___winID, true);
  }

  protected async init?(): Promise<void>; //Do async stuff here. Called after the constructor.

  protected title?(): string;
  protected width?(): number;
  protected height?(): number;
  protected render?(): JSX.Element;//Window controls here.

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
              {/* {statusbar} */}
            </div>
          </div>
        </div>
      </React.StrictMode>
    );
  }
}
