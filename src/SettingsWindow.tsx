import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";
import { Controls } from "./Controls";
import { ConfigFile, ConfigFilePair } from "./ConfigFile";
import { Form, Button, InputGroup, FormControl, FormLabel } from 'react-bootstrap';

export class SettingsWindow extends ElectronWindow {
  private _settingsFileName: string = "settings.txt";
  private _configFile: ConfigFile;

  private async settingsFilePath(): Promise<string> {
    let str = Remote.path_join(await Remote.process_cwd(), this._settingsFileName);
    return str;
  }

  public constructor() {
    super();
  }
  public override async init(): Promise<void> {
    console.log("Settings init");
    this._configFile = new ConfigFile(await this.settingsFilePath(), {
      "time_minutes": new ConfigFilePair(
        (val: string) => { $('#time_minutes').html(val) },
        (key: string) => { return $('#time_minutes').val().toString(); }),
      "time_seconds": new ConfigFilePair(
        (val: string) => { $('#time_seconds').html(val) },
        (key: string) => { return $('#time_seconds').val().toString(); })
    });
    this.load();
  }
  protected title?(): string { return "Settings"; }
  protected width?(): number { return 400; }
  protected height?(): number { return 400; }
  protected override render(): JSX.Element {
    let that = this;
    return (
      <Form>
        <Form.Group className="m-3">
          <Form.Label>Time</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control id="time_minutes" type="number" placeholder="3" min="0" max="100" />
            <Form.Control id="time_seconds" type="number" placeholder="3" min="0" max="100" />
          </InputGroup>
          <Form.Control className="m-3 textFeedback" as="textarea"
            //@ts-ignore
            rows="3"
            placeholder="feedback" type="text" />
          <Form.Check type="switch" id="custom-switch" label="Check this switch" />
          <Form.Select aria-label="Default select example">
            <option>Open this select menu</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">f</option>
          </Form.Select>
          <Form.Label>Range</Form.Label>
          <Form.Range />
          <Button className="m-3 btnFormSend" variant="outline-success" >
            Send Feedback
          </Button>
          <br />

          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
            <Form.Control placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
            <Form.Control type="number" placeholder="3" min="0" max="100" />
          </InputGroup>

        </Form.Group>
        <Form.Group>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => { that.close(); }}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => { that.save(); that.close(); }}>OK</button>
          </div>
        </Form.Group>
      </Form>
    );
  }
  private async save(): Promise<void> {
    this._configFile.save();
  }
  private async load(): Promise<void> {
    this._configFile.load();
  }
}
