import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Mousetrap from 'mousetrap';
import { Remote } from "./Remote";
import { ElectronWindow, WindowCreateInfo } from "./ElectronWindow";
import { Controls } from "./Controls";
import './MaterialIcons.scss';
import { Form, Button, InputGroup, FormControl, FormLabel, ProgressBar, Dropdown, Nav } from 'react-bootstrap';
import 'ts-keycode-enum'
import { Key } from "ts-keycode-enum";
import { clear } from "console";

enum State { start, stop, pause };
//import * as fs from 'fs/promises'

export class MainWindow extends ElectronWindow {
  private _state: State = State.stop;
  private _maxTime: number = 5000; //millis -  5min
  private _curTime: number = this._maxTime; //millis -  5min
  private _timer: NodeJS.Timer = null;
  private _dataRootPath: string = './testdata';
  private _progress: number = 60;
  private _fileCount: number = -1;
  private _history: Array<string> = new Array<string>(); //image history 
  private _historyIndex: number = -1;
  private _progressBar = () => { return $('#progressbar') };

  public constructor() {
    super();
  }
  public override async init(): Promise<void> {
    let that = this;
    console.log('that = ' + this.constructor.name);
    console.log("Main window async init: " + await Remote.process_cwd());
    that.registerKeys();

    console.log("rootpath = " + that._dataRootPath);

    let fc = { val: that._fileCount };
    await MainWindow.traverseDirectory(that._dataRootPath, true, 0, fc, { val: null });
    that._fileCount = fc.val;
    console.log("File count = " + that._fileCount);
  }
  protected override getCreateInfo?(): WindowCreateInfo {
    let x = new WindowCreateInfo();
    x._height = 800;
    x._width = 600;
    x._title = "Sketchy";
    return x;
  }
  protected override render(): JSX.Element {
    let that = this;
    //Note: the super class is not constructed when render() is run

    return (
      <Form>
        <Nav activeKey="/home" className="bg-light">
          <Nav.Item className="p-1">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                File
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => { that.randomImage(); }}>Random Image <span className="material-icons">face</span></Dropdown.Item>
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
            <div id="timelabel" style={{ color: '#212121', opacity: 0.5, display: 'none' }}>time</div>
            <div id="progressbar" style={{ height: '.14em', backgroundColor: '#FF0000' }} role="progressbar" aria-valuemin={0} aria-valuemax={100}></div>
          </div>
        </div>
      </Form>
    ); 
  }
  protected override onResize(w:number,h:number) : void { 
    console.log("Got the on resize avent yay : " +w + " " + h);

    //TODO: resize image to fit viewport.

  }
  private async nextImage(): Promise<void> {
    let img: string = "";
    this._progressBar().css('width', '100%');

    if (this._historyIndex === this._history.length - 1 || this._historyIndex === -1) {
      img = await this.randomImage();
      this._history.push(img);
      this._historyIndex = this._history.length - 1;
    }
    else {
      img = this._history[this._historyIndex + 1];
    }

    this.setImageFromFile(img);
  }
  private prevImage(): void {
    this.stop();
    this._historyIndex -= 1;
    if (this._historyIndex < 0) {
      this._historyIndex = 0;
    }
    if (this._historyIndex < this._history.length) {
      this.setImageFromFile(this._history[this._historyIndex]);
    }
  }
  private parseMilliseconds(millis: number, h: { val: number }, m: { val: number }, s: { val: number }, u: { val: number }): void {
    //Copied from https://github.com/cacttus/strainer/blob/master/src/Trainer.cpp
    millis = Math.round(millis);
    h.val = m.val = s.val = u.val = 0;
    h.val = Math.trunc(millis / (60 * 60 * 1000));
    millis %= (60 * 60 * 1000);
    m.val = Math.trunc(millis / (60 * 1000));
    millis %= (60 * 1000);
    s.val = Math.trunc(millis / (1000));
    millis %= (1000);
    u.val = millis;
  }
  private addTime(seconds: number): void {
    let that = this;
    that._maxTime += seconds * 1000;
    if (that._maxTime < 5000) {
      that._maxTime = 5000;
    }
    if (that._maxTime <= that._curTime) {
      that._curTime = that._maxTime;
    }
    let h = { val: 0 }, m = { val: 0 }, s = { val: 0 }, u = { val: 0 };

    that.parseMilliseconds(that._maxTime , h, m, s, u);//millis*1000=micros

    let str: string = "";
    if (h.val > 0) {
      str += h.val + "h";
    }
    if (m.val > 0) {
      str += m.val + "m";
    }
    if (s.val > 0) {
      str += s.val + "s";
    }
    if (m.val > 0) {
      str += u.val + "u";
    }

    $('#timelabel').show().html(str).delay(3000).fadeOut(500);
  }
  private registerKeys(): void {
    let that = this;
    //note: win/cmd key = 'meta'
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
    Mousetrap.bind('ctrl+up', () => {
      that.addTime(60);
    })
    Mousetrap.bind('ctrl+down', () => {
      that.addTime(-60);
    })
    Mousetrap.bind('r', () => {
      that.reset();
    })
    Mousetrap.bind('space', () => {
      if (that._state === State.start) {
        that.pause();
      }
      else {
        that.start();
      }
    })
  }
  private start(): void {
    var that = this;

    that._progressBar().css('background-color', '#00FF00');

    let stepms: number = 50;

    if (that._state === State.start) {
    }
    else if (that._state === State.stop) {
      that.nextImage();

      if (that._timer !== null) {
        clearInterval(that._timer);
        that._timer = null;
      }

      that._state = State.start;
      that._timer = setInterval(() => {
        if (that._state !== State.pause) {
          that._curTime -= stepms;

          if (that._curTime <= 0) {
            that._curTime = 0;
          }

          let pct: number = (that._curTime / that._maxTime * 100);
          that._progressBar().css('width', pct + '%');

          if (that._curTime <= 0) {
            that.stop();
            that.start();
          }
        }

      }, stepms);
    }
    else if (that._state === State.pause) {
      //Paused. Just start.
      that._state = State.start;
    }
    else {
      console.log("Invalid state " + that._state);
    }
  }
  private reset(): void {
    var that = this;
    that._curTime = that._maxTime;
    that._progressBar().css('width', '100%');
  }
  private stop(): void {
    let that = this;
    that._state = State.stop;
    that.reset();
    clearInterval(that._timer);
    that._timer = null;
    that._progressBar().css('width', '0%');
    that._progressBar().css('background-color', '#FF0000');
  }
  private pause(): void {
    let that = this;
    that._state = State.pause;
    that._progressBar().css('background-color', '#AAAAAA');
  }
  private async setImageFromFile(fullPath: string): Promise<void> {
    //open a file and set the image tag.
    await Remote.fs_access(fullPath).then(async () => {
      await Remote.fs_readFile(fullPath).then((value: Buffer) => {
        $("#theImage").attr("src", URL.createObjectURL(
          new Blob([value], { type: 'image/jpg' } /* (1) */)
        ));
      });
    });
  }
  private async randomImage(): Promise<string> {
    let that = this;
    let rfile = Math.floor(Math.random() * that._fileCount);
    let selected = { val: '' };
    console.log("rfile = " + rfile);
    await MainWindow.traverseDirectory(that._dataRootPath, false, rfile, { val: that._fileCount }, selected);
    return selected.val;
  }
  private static async getFiles(dir: string): Promise<Array<string>> {
    let flist: Array<string> = new Array<string>();
    let fq: string = await Remote.path_join(await Remote.process_cwd(), dir);
    return await Remote.fs_readdir(fq);
  }
  private static async traverseDirectory(dir: string, countFilesOnly: boolean, selectedFileIndex: number, fileCount: { val: number }, selectedFile: { val: string }, curFileIndex: { val: number } = null): Promise<void> {
    //CountFilesOnly : true = count the files, fileCount must be zero
    //               : false = select a file given the selected index
    if (dir === undefined) {
      console.log("Dir was undefined");
    }
    if (curFileIndex === null || curFileIndex === undefined) {
      curFileIndex = { val: 0 };
    }

    //console.log(await Remote.process_cwd() + "   " + dir);
    let root_dir: string = await Remote.path_join(await Remote.process_cwd(), dir);
    let files = await Remote.fs_readdir(root_dir);

    for (let xi = 0; xi < files.length; xi++) {
      let file_or_dir = files[xi];

      // console.log(root_dir + "   " + file_or_dir);

      let path = await Remote.path_join(root_dir, file_or_dir);

      if (countFilesOnly) {
        if (fileCount.val === -1) {
          fileCount.val = 0;
        }
        if (await Remote.isFile(path) === true) {
          fileCount.val++;
        }
      }
      else {
        //Select file.
        //console.log("CFI = " + curFileIndex.val)
        if (curFileIndex.val === selectedFileIndex) {
          selectedFile.val = path;
          break;
        }

        curFileIndex.val++;
      }

      if (await Remote.isDirectory(path) === true) {
        await MainWindow.traverseDirectory(path, countFilesOnly, selectedFileIndex, fileCount, selectedFile, curFileIndex);
      }
    }
  }

}
