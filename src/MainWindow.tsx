import React from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Mousetrap from 'mousetrap';
import { Remote } from "./Remote";
import { ElectronWindow } from "./ElectronWindow";
import { Controls } from "./Controls";
import './MaterialIcons.scss';
import { Form, Button, InputGroup, FormControl, FormLabel, ProgressBar, Dropdown, Nav } from 'react-bootstrap';
import 'ts-keycode-enum'
import { Key } from "ts-keycode-enum";

enum State { start, stop };

export class MainWindow extends ElectronWindow {
  private _images: Array<string> = new Array<string>();
  private _curImgIdx: number = 0;
  private _state: State = State.stop;
  private _cycleTime: number = 1000; //millis -  5min
  private _timer: any;
  private _dataRootPath: string = './testdata';
  private _progress: number = 60;

  public constructor() {
    super();
    this.registerKeys();
  }
  public override async init(): Promise<void> {
    let that = this;
    console.log("Main window async init: " + await Remote.process_cwd());
    that.registerInput();
  }
  private registerInput(): void {
    let that = this;
    window.onkeydown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case Key.LeftArrow: that.prevImage(); break;
        case Key.RightArrow: that.nextImage(); break;
      }
      //do not preventDefault to allow f12, etc
    };
  }

  protected title?(): string { return "Main"; }
  protected width?(): number { return 800; }
  protected height?(): number { return 600; }
  protected override render(): JSX.Element {
    let that = this;
    return (
      <Form>
        <Nav activeKey="/home" className="bg-light">
          <Nav.Item className="p-1">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                File
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={that.randomImage}>Random Image <span className="material-icons">face</span></Dropdown.Item>
                <Dropdown.Item onClick={async () => { await Remote.createWindow("SettingsWindow.js"); }}>Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => { Remote.closeWindow(that.winId()); }}>Exit</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav.Item>
          <Nav.Item className="p-1">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                Help
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={async () => { await Remote.createWindow("AboutWindow.js"); }}>About</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav.Item>
        </Nav>

        <img id="theImage" style={{ maxWidth: '100%', height: '100%', width: 'auto', maxHeight: '100%' }}></img>

        <div className="row justify-content-center fixed-bottom">
          <div className="col-12">
            <div className="progress" style={{ height: '.3em' }}>
              {/* @ts-ignore */}
              <div className="progress-bar" style={{ height: '.3em' }} role="progressbar" aria-valuenow={that._progress} aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
      </Form>
    );


  }
  private nextImage(): void {

  }
  private prevImage(): void {
    let that = this;
    //Prev image will stop the timer.
    that.stop();
    that._curImgIdx -= 1;
    if (that._curImgIdx < 0) {
      that._curImgIdx = 0;
    }
    if (that._curImgIdx >= 0 && that._curImgIdx < that._images.length) {
      that.setImage(that._images[that._curImgIdx]);
    }
  }
  private addTime(seconds: number): void {
    let that = this;
    that._cycleTime += seconds * 1000;
    if (that._cycleTime < 5000) {
      that._cycleTime = 5000;
    }
  }
  private registerKeys(): void {
    let that = this;
    //note/windows/cmd key = meta
    Mousetrap.bind('right', () => {
      that.nextImage();
    })
    Mousetrap.bind('left', () => {
      that.prevImage();
    })
    Mousetrap.bind('up', () => {
      that.addTime(30);
    })
    Mousetrap.bind('down', () => {
      that.addTime(-30);
    })
    Mousetrap.bind('space', () => {
      if (that._state == State.start) {
        that.stop();
      }
      else {
        that.start();
      }
    })
  }
  private start(): void {
    var that = this;
    this._state = State.start;
    var i = 100;
    this._timer = setInterval(() => {
      i--;
      if (i > 0) {
        $('.progress-bar').css('width', i + '%');
      } else {
        clearInterval(that._timer);
      }
    }, 1000);
  }
  private stop(): void {
    this._state = State.stop;
    clearInterval(this._timer);
  }
  private randomImage(): void {
    let files: Array<string> = new Array<string>();
    MainWindow.getFiles('/testdata').then(
      (value: Array<string>) => {
        files = value;
      }).then(
        async () => {
          if (files && files.length > 0) {

            let n = Math.floor(Math.random() * files.length);
            let file = files[n];

            let fullPath: string = await Remote.path_join(await Remote.process_cwd(), await Remote.path_join('/testdata', file));

            await Remote.fs_access(fullPath).then(async () => {
              await Remote.fs_readFile(fullPath).then((value: Buffer) => {
                $("#theImage").attr("src", URL.createObjectURL(
                  new Blob([value], { type: 'image/jpg' } /* (1) */)
                ));
              });
            });
          }
        });
  }
  private static async getFiles(dir: string): Promise<Array<string>> {
    let flist: Array<string> = new Array<string>();
    let fq: string = await Remote.path_join(await Remote.process_cwd(), dir);
    return await Remote.fs_readdir(fq);
  }

}
