import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Remote } from "./Remote";
import { ElectronWindow, WindowCreateInfo } from "./ElectronWindow";
import { Controls } from "./Controls";
import { ConfigFile, ConfigFilePair } from "./ConfigFile";
import { Form, Button, InputGroup, FormControl, FormLabel, Row, Col } from 'react-bootstrap';
import { Log } from './Log';
import { json } from "stream/consumers";

export class SettingsWindow extends ElectronWindow {
  private _settingsFileName: string = "settings.txt";
  private _configFile: ConfigFile;

  private async settingsFilePath(): Promise<string> {
    let str = Remote.path_join(await Remote.process_cwd(), this._settingsFileName);
    return str;
  }
  private _timeMinutesCtl: string = "time_minutes";
  private _timeSecondsCtl: string = "time_seconds";
  private _repeatCtl: string = "repeat";
  private _directoryCtl: string = "directory";
  private _cacheCtl: string = "cache_size";
  private _imageApp: string = "image_app";

  public constructor() {
    super();
  }
  public override async init(): Promise<void> {
    let that = this;
    //It would be interesting to tie all this together to react to make it seamless
    Log.info("Settings init");
    this._configFile = new ConfigFile(await this.settingsFilePath(), {
      //Numeric UPdown
      "time_minutes": new ConfigFilePair(
        (val: string) => { $('#' + that._timeMinutesCtl).val(val); },
        (key: string) => { return $('#' + that._timeMinutesCtl).val().toString(); })
      //Numeric Updown
      , "time_seconds": new ConfigFilePair(
        (val: string) => { $('#' + that._timeSecondsCtl).val(val); },
        (key: string) => { return $('#' + that._timeSecondsCtl).val().toString(); })
      //Checkbox
      , "repeat": new ConfigFilePair(
        (val: string) => { $('#' + that._repeatCtl).prop("checked", val); },
        (key: string) => { return $('#' + that._repeatCtl).prop("checked"); })
      //Textbox
      , "directory": new ConfigFilePair(
        (val: string) => { $('#' + that._directoryCtl).val(val); },
        (key: string) => { return $('#' + that._directoryCtl).prop("value"); })
      , "cache_size": new ConfigFilePair(
        (val: string) => { $('#' + that._cacheCtl).val(val); },
        (key: string) => { return $('#' + that._cacheCtl).val().toString(); })
      , "image_app": new ConfigFilePair(
        (val: string) => { $('#' + that._imageApp).val(val); },
        (key: string) => { return $('#' + that._imageApp).prop("value"); })
    });
    await this.load();
  }
  public timeMinutes(): number {
    return $('#' + this._timeMinutesCtl).val() as number;
  }
  public timeSeconds(): number {
    return $('#' + this._timeSecondsCtl).val() as number;
  }
  public repeat(): boolean {
    return $('#' + this._repeatCtl).prop("checked") as boolean;
  }
  public directory(): string {
    return $('#' + this._directoryCtl).val() as string;
  }
  public cache(): string {
    return $('#' + this._cacheCtl).val() as string;
  }
  public imageApp(): string {
    return $('#' + this._imageApp).val() as string;
  }
  protected override getCreateInfo?(): WindowCreateInfo {
    let x = new WindowCreateInfo();
    x._title = "Settings";
    x._height = 600;
    x._width = 400;
    return x;
  }
  protected override render(): JSX.Element {
    let that = this;
    //No class properties are defined when render() is called
    //I still need to learn this.. duplicating strings no good
    return (
      <Form>
        <Form.Group className="m-3">
          <Row>
            <Col xs={12} sm={2} md={2} lg={2}>
              <Form.Label>Dir:</Form.Label>
            </Col>
            <Col xs={12} sm={10} md={10} lg={10}>
              <InputGroup className="mb-3">
                <Form.Control id="directory" defaultValue="./" type="text" onChange={() => { that.save(); }} />
                < Button id="selectDirectory" onClick={async () => {
                  let cv = $('#directory').text();
                  let ret = await Remote.showOpenDialog("Select Folder", cv, true, false, null, false);
                  console.log("cancel=" + ret.canceled + " filepath=" + ret.filePaths + "  ret=" + JSON.stringify(ret));
                  if (ret.canceled === false) {
                    $('#directory').val(ret.filePaths[0]);
                    await that.save();
                  }
                }}>...</Button>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={1} md={1} lg={1}>
              <Form.Label>Time:</Form.Label>
            </Col>
            <Col xs={12} sm={11} md={11} lg={11}>
              <InputGroup className="mb-3">
                <Form.Control id="time_minutes" defaultValue={3} type="number" min="0" max="100" onChange={() => { that.save(); }} />
                <Form.Control id="time_seconds" defaultValue={0} type="number" min="0" max="100" onChange={() => { that.save(); }} />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={1} md={1} lg={1}>
              <Form.Label>Cache Size:</Form.Label>
            </Col>
            <Col xs={12} sm={11} md={11} lg={11}>
              <InputGroup className="mb-3">
                <Form.Control id="cache_size" defaultValue={100} type="number" min="1" max="10000" onChange={() => { that.save(); }} />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={1} md={1} lg={1}>
              <Form.Label>Repeat:</Form.Label>
            </Col>
            <Col xs={12} sm={11} md={11} lg={11}>
              <InputGroup className="mb-3">
                <Form.Check id="repeat" defaultChecked={false} onChange={() => { that.save(); }} />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} sm={1} md={1} lg={1}>
              <Form.Label>External Image App (app name, no spaces):</Form.Label>
            </Col>
            <Col xs={12} sm={11} md={11} lg={11}>
              <InputGroup className="mb-3">
                <Form.Control id="image_app"
                type="text"
                defaultValue="xviewer" 
                onChange={() => { that.save(); }} />
              </InputGroup>
            </Col>
          </Row>
          {/* Test controls */}
          <div style={{ display: 'none' }}>
            <div style={{ minHeight: '2rem' }} ></div>
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
          </div>
        </Form.Group>

        <Form.Group>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => { that.hide(); }}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => { that.save(); that.hide(); }}>OK</button>
          </div>
        </Form.Group>


      </Form>
    );
  }
  private async save(): Promise<void> {
    await this._configFile.save();
  }
  private async load(): Promise<void> {
    await this._configFile.load();
  }
  protected override onClose(): void {
    this.hide();
  }
}
