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
    let that = this;
    return (
      <Form>
        <h2><i>Sketchy</i></h2>
        <h3>Controls</h3>
        <ul>
          <p>Space = Stop/Start timer.</p >
          <p>Left = Previous Image</p>
          <p>Right, n = Next Image (random), or next image if in history.</p>
          <p>Up = Add 30s.</p>
          <p>Down = Remove 30s.</p>
          <p>r = Reset timer</p>
          <p>c = Clear History</p>
        </ul>
        <Form.Group>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={() => { that.close(); }}>OK</button>
          </div>
        </Form.Group>
      </Form>
    );
  }
}
