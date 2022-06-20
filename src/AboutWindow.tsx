import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";

export class AboutWindow extends ElectronWindow {
  public constructor() {
    super();
  }
  protected title?(): string { return "About"; }
  protected width?(): number { return 400; }
  protected height?(): number { return 400; }
  protected override render(): JSX.Element {
    return (
      <div>
        About: This is the about window.
      </div>
    );
  }
}
