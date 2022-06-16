import React from "react";
import ReactDOM from "react-dom/client";
import './Render.css';
import App from "./App";
import { Events, Gu } from "./Globals";
import $ from 'jquery';

export class RenderThread {
  public constructor() {
    $(document).ready(() => {

      //https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
      //https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron
      //https://stackoverflow.com/questions/18083389/ignore-typescript-errors-property-does-not-exist-on-value-of-type
      console.log("INITIALIZING REACT DOM");
      const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
      );
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );

      RenderThread.send(Events.GetFiles, ["testdata"]);
      RenderThread.receive((id: string, data: any) => {
        console.log("Got " + id + " data:" + data);
      });
    });
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
var rt: RenderThread = new RenderThread();
