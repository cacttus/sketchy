import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";
import { Controls } from "./Controls";
import { ConfigFile, ConfigFilePair } from "./ConfigFile";
import { Form, Button, InputGroup, FormControl } from 'react-bootstrap';

export class SettingsWindow extends ElectronWindow {
  private _settingsFileName: string = "settings.txt";
  private _configFile: ConfigFile;

  private _nudMinutes = useRef(null);
  private _nudSeconds = useRef(null);


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
  protected title?(): string { return "About"; }
  protected width?(): number { return 400; }
  protected height?(): number { return 400; }
  protected override render(): JSX.Element {
    let that = this;
    return (
      <Form.Group className="m-0">
        <Form.Control
          className="textFeedback"
          as="textarea"
          //@ts-ignore
          rows="3"
          placeholder="feedback"
          type="text"
        />
        <Form.Check
          type="switch"
          id="custom-switch"
          label="Check this switch"
        />
        <Form.Select aria-label="Default select example">
          <option>Open this select menu</option>
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </Form.Select>
        <Form.Label>Range</Form.Label>
        <Form.Range />
        <Button
          className="btnFormSend"
          variant="outline-success"
        >
          Send Feedback
        </Button>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
            <FormControl
              placeholder="Username"
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
            <FormControl
            type="number"
            placeholder="3"
            min="0"
            max="100"
            />

          </InputGroup>

      </Form.Group>

    );
    /*
      <div className="row justify-content-center">
        <div className="vstack gap-2">
          <Controls.Checkbox label="Repeat" defaultChecked={true} ></Controls.Checkbox>
          <div className="hstack gap-1">
            Time
            <Controls.NumericUpDown ref={that._nudMinutes} value={5} />
            <div className="vr"></div>
            <Controls.NumericUpDown ref={that._nudSeconds} value={0} />
          </div>
        </div>
        <div className="m-3 d-flex flex-row fixed-bottom justify-content-center">
          <button className="btn btn-primary" style={{ maxWidth: '8em' }} onClick={() => { that.save(); that.close(); }}>Ok</button>
          <div className="p-3">
          </div>
          <button className="btn btn-primary" style={{ maxWidth: '8em' }} onClick={() => { that.close(); }}>Cancel</button>
        </div>
      </div>
    */
  }
  private async save(): Promise<void> {
    this._configFile.save();
  }
  private async load(): Promise<void> {
    this._configFile.load();
  }
}
