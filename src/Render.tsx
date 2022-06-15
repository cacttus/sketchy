import React from "react";
import ReactDOM from "react-dom/client";
import './Render.css';
import App from "./App";
import $ from 'jquery';
import { ipcRenderer } from "electron";

$(document).ready(function() {
  console.log("INITIALIZING REACT DOM");
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  ipcRenderer.invoke('get-files', './testdata').then((res : Array<string> )=>{
    res.forEach((x : string)=>{
      console.log("booger: " + x);
    })
  });
  
});
export class GuRender {
  public static exitApp() : void { 
    console.log("uh..")
  }
}