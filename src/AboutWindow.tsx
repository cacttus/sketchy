import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow, WindowCreateInfo } from "./ElectronWindow";
import { Form, Button, InputGroup, FormControl, FormLabel } from 'react-bootstrap';

export class AboutWindow extends ElectronWindow {
  public constructor() {
    super();
  }
  protected override getCreateInfo?(): WindowCreateInfo {
    let x = new WindowCreateInfo();
    x._title = "About";
    x._height = 400;
    x._width = 400;
    return x;
  }
  protected override render(): JSX.Element {
    let that=this;
    return (
      <Form>
        <h2><i>Sketchy</i></h2>
        <h3>Controls</h3>
        <ul>
          <b>Left Arrow</b><br/>
          <p>Previous Image</p>
          <b>Right Arrow</b><br/>
          <p>Next Image (random), or next image if in history.</p>
          <b>Spacebar</b><br/>
          <p>Stop/Start timer.</p>
        </ul>
        <Form.Group>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => {  that.close(); }}>OK</button>
          </div>
        </Form.Group>
      </Form>
    );
  }
}
