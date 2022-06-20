import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";


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

  protected title?(): string;
  protected width?(): number;
  protected height?(): number;
  protected render?(): JSX.Element;//Window controls here.

  private initReactWindow(): void {
    console.log("Initializing React");
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    var ctl = this.render();
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
// let rt: ElectronWindow;
// $(document).ready(() => {
//    /* @ts-ignore */
//    console.log("Document ready, creating window of type " + ___winTypeStr)  
//   /* @ts-ignore */
//   rt = eval("new " + ___winTypeStr + "()");
// });

// let rt: ElectronWindow;
// /* @ts-ignore */
// window.createNewBoii = function(){
//   //The window type is set as a global variable on the server.
//   /* @ts-ignore */
//   console.log("Document ready, creating window of type " + ___winTypeStr)
//   /* @ts-ignore */
//   //rt = eval(`new ${___winTypeStr}()`);
//   rt = new window[___winTypeStr]();//eval(`new ${___winTypeStr}()`);
// };
