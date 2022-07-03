import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as Mousetrap from 'mousetrap';
import { Remote, WindowEvent } from "./Remote";
import { ElectronWindow, WindowCreateInfo } from "./ElectronWindow";
import { Controls } from "./Controls";
import './MaterialIcons.scss';
import { Form, Button, InputGroup, FormControl, FormLabel, ProgressBar, Dropdown, Nav, Toast } from 'react-bootstrap';
import 'ts-keycode-enum'
import { Key } from "ts-keycode-enum";
import { clear } from "console";
import { Globals } from './Globals';
import { vec2 } from "./Math";
import { isUint16Array } from "util/types";
import { isForStatement } from "typescript";
import './MainWindow.css';
import { ConfigFile } from "./ConfigFile";

enum State { start, stop, pause };

export class MainWindow extends ElectronWindow {
  private _state: State = State.stop;
  private _maxTime: number = 5000; //millis -  5min
  private _curTime: number = this._maxTime; //millis -  5min
  private _imageTimer: NodeJS.Timer = null;
  private _dataRootPath: string = './testdata';
  private _progress: number = 60;
  private _fileCount: number = -1;
  private _history: Array<string> = new Array<string>(); //image history 
  private _historyFileIndexes: Array<number> = new Array<number>();
  private _historyIndex: number = 0;
  private _progressBar = () => { return $('#progressbar') };
  private _showNavTimer: NodeJS.Timer = null;
  private _showMsgTimer: NodeJS.Timer = null;
  private _imgSize: vec2 = new vec2();
  private _settingsWindow: number = -1;

  public constructor() {
    super();
  }
  public override async init(): Promise<void> {
    let that = this;
    console.log("Main window `" + this.constructor.name + "` async init, cwd: " + await Remote.process_cwd());
    that.registerKeys();

    that._settingsWindow = await Remote.createWindow("SettingsWindow.js");
    // await Remote.onWindow(that._settingsWindow, WindowEvent.onClose, async () => {
    //   await that.updateSettings();
    // });

    //For some reason updateSettings() here is invalid. Most likely it has to do with how the init() method is injected on the server().
    //await this.updateSettings();
  }
  private async updateSettings(): Promise<void> {
    let that = this;
    console.log("Update settings...");

    let mins: number = await this.callWindow(this._settingsWindow, "timeMinutes");
    let secs: number = await this.callWindow(this._settingsWindow, "timeSeconds");
    that._maxTime = mins * 60 * 1000 + secs * 1000;
    let root = await this.callWindow(this._settingsWindow, "directory");
    //TODO: repeat;

    console.log("Got mins=" + mins + " secs=" + secs + " dir=" + root);

    if (that._dataRootPath !== root) {
      that._dataRootPath = root;

      console.log("..rootpath = " + that._dataRootPath);

      let fc = { val: that._fileCount };
      await MainWindow.traverseDirectory(that._dataRootPath, true, 0, fc, { val: null });
      that._fileCount = fc.val;

      this.message("..File count = " + that._fileCount);
    }
  }
  protected override  receiveEvent(winId: number, winEvent: string, ...args: any[]): void {
    //TODO:
    switch (winId) {
      case this._settingsWindow:
        switch (winEvent) {
          case WindowEvent.onClose:
            this.updateSettings();
            break;
          case WindowEvent.onShow:
            if(args && args.length && args[0] === false){
              this.updateSettings();
            }
            break;
        }
        console.log("Got settings window event " + winEvent + " args: " + args);
        break;
    }

  }
  protected override getCreateInfo?(): WindowCreateInfo {
    let x = new WindowCreateInfo();
    x._height = 800;
    x._width = 600;
    x._title = "Sketchy";
    return x;
  }
  protected message(msg: string, duration: number = 2000): void {
    //Emit a message, and show the nav
    $('#infoMessage').html(msg);
    console.log(msg);
    this.showMsg(duration);
  }
  protected showNav(duration: number = 2000): void {
    //Pop up the nav, hide after a few seconds
    let nav = $('#mainNav');
    if (!nav.is(':visible')) {
      nav.fadeIn(100);
    }
    clearInterval(this._showNavTimer);
    this._showNavTimer = null;
    this._showNavTimer = setInterval(() => {
      nav.fadeOut(100);
    }, duration);
  }
  protected showMsg(duration: number = 2000): void {
    //Pop up the nav, hide after a few seconds
    let mnsg = $('#infoMessage');
    if (!mnsg.is(':visible')) {
      mnsg.fadeIn(100);
    }
    clearInterval(this._showMsgTimer);
    this._showMsgTimer = null;
    this._showMsgTimer = setInterval(() => {
      mnsg.fadeOut(100);
    }, duration);
  }
  protected override render(): JSX.Element {
    let that = this;
    //Note: the super class is not constructed when render() is run

    return (
      <div style={{ maxHeight: '100vh', margin: '0', padding: '0' }} className="">
        <Form className="align-items-center" style={{ maxHeight: '100vh', margin: '0', padding: '0', textAlign: 'center' }}>
          <div style={{ position: 'absolute', width: '100%' }} id="mainNav" >
            <Nav activeKey="/home" className="bg-dark p-1">
              <Nav.Item className="p-0">
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                    File
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => { that.randomImage(); }}>Random Image <span className="material-icons">face</span></Dropdown.Item>
                    <Dropdown.Item onClick={async () => {
                      await Remote.showWindow(that._settingsWindow, true);


                    }}>Settings</Dropdown.Item>
                    <Dropdown.Item onClick={() => { Remote.closeWindow(that.winId()); }}>Exit</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav.Item>
              <Nav.Item className="p-0">
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic" size="sm">
                    Help
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={async () => {
                      let aw = await Remote.createWindow("AboutWindow.js");
                      Remote.showWindow(aw, true);
                    }}>About</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav.Item>
            </Nav>
            <FormLabel id="infoMessage" className="labelMessage" ></FormLabel>
          </div>

          <img id="theImage" className="  " style={{ width: 'auto' }}></img>
          <div className="row justify-content-center fixed-bottom">
            <div className="col-12">
              <div id="timelabel" style={{ color: '#F9F9F9', opacity: 0.5, display: 'none', backgroundColor: '#212121' }}>time</div>
              <div id="progressbar" style={{ height: '.3em', backgroundColor: '#770000', opacity: 0.5 }} role="progressbar" aria-valuemin={0} aria-valuemax={100}></div>
            </div>
          </div>
        </Form>
      </div>
    );
  }
  protected override onResize(w: number, h: number): void {
    console.log("Window Resize:" + w + " " + h);
    this.scaleImage();
  }
  protected override onMouseMove(curPos: vec2, delta: vec2): void {
    this.showNav(2000);
    this.showMsg(2000);
  }
  private clearHistory(): void {
    this._history = new Array<string>(); //image history 
    this._historyFileIndexes = new Array<number>();
    this._historyIndex = 0;
    this.message("Cleared history.")
  }
  private async nextImage(): Promise<void> {
    let img: string = "";
    this._progressBar().css('width', '100%');

    this._historyIndex += 1;

    console.log("history:" + this._history.length + " index:" + this._historyIndex)

    if (this._historyIndex >= this._history.length) {
      img = await this.randomImage();

      if (img === "") {
        this.message("No files remain");
        this.stop();
      }
      else {
        console.log("next image: " + img);
        this._history.push(img);
        this._historyIndex = this._history.length - 1;
      }
    }
    else {
      img = this._history[this._historyIndex];
    }

    if (await Remote.fileExists(img)) {
      await this.setImageFromFile(img);
    }
  }
  private async prevImage() {
    this.pause();
    this._historyIndex -= 1;

    if (this._historyIndex < 0) {
      this._historyIndex = 0;
    }
    if (this._historyIndex < this._history.length) {
      await this.setImageFromFile(this._history[this._historyIndex]);
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

    that.parseMilliseconds(that._maxTime, h, m, s, u);//millis*1000=micros

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

    $('#timelabel').show().html(str).delay(1000).fadeOut(400);
  }
  private registerKeys(): void {
    let that = this;
    //note: win/cmd key = 'meta'
    Mousetrap.bind('esc', () => {
      that.close();
    })
    Mousetrap.bind('n', () => {
      that.nextImage();
      that.reset();
    })
    Mousetrap.bind('right', async () => {
      await that.nextImage();
      that.reset();
    })
    Mousetrap.bind('left', async () => {
      await that.prevImage();
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
    Mousetrap.bind('c', () => {
      that.clearHistory();
    })
    Mousetrap.bind('space', async () => {
      if (that._state === State.start) {
        that.pause();
      }
      else {
        //Only update when we start/stop.
        that.start();
      }
    })
  }
  private start(): void {
    var that = this;

    that._progressBar().css('background-color', '#007700');

    let stepms: number = 50;

    if (that._state === State.start) {
    }
    else if (that._state === State.stop) {
      console.log("starting");
      that.nextImage();

      that._curTime = that._maxTime;

      if (that._imageTimer !== null) {
        clearInterval(that._imageTimer);
        that._imageTimer = null;
      }

      that._state = State.start;
      that._imageTimer = setInterval(() => {
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
    clearInterval(that._imageTimer);
    that._imageTimer = null;
    that._progressBar().css('width', '0%');
    that._progressBar().css('background-color', '#770000');
  }
  private pause(): void {
    let that = this;
    that._state = State.pause;
    that._progressBar().css('background-color', '#AAAAAA');
  }
  private scaleImage(): void {
    //Image "Fill" algorithm, note we use maxWidth=100vh for the form to make sure there's no scrollbar.
    let that = this;
    let img = $("#theImage");
    img.ready(() => {
      let iw = that._imgSize.x;
      let ih = that._imgSize.y;
      let pw = $(window).width();
      let ph = $(window).height();

      console.log('iw=' + iw + ',ih=' + ih + ',pw=' + pw + ',ph=' + ph);

      let wr = iw / pw;
      let hr = ih / ph;

      let h = 0;
      let w = 0;
      if (wr > hr) {
        w = pw;
        h = ih * (pw / iw);
      }
      else {
        h = ph;
        w = iw * (ph / ih);
      }

      img.css({
        width: w,
        height: h
      });

    });
  }
  private async setImageFromFile(fullPath: string): Promise<void> {
    let that = this;
    console.log(this._history)
    //open a file and set the image tag.
    await Remote.fs_access(fullPath).then(async () => {
      await Remote.fs_readFile(fullPath).then((value: Buffer) => {

        //Create a raw image object to get the actual w/h
        let img2 = new Image();
        img2.src = URL.createObjectURL(new Blob([value], { type: 'image/jpg' }));
        img2.onload = () => {
          that._imgSize.x = img2.width;
          that._imgSize.y = img2.height;

          $("#theImage").attr("src", img2.src);

          that.scaleImage();

          this.message(fullPath, 100); //TODO: Settings.ShowImageName.

        };
      });
    });
  }
  private async randomImage(): Promise<string> {
    let that = this;

    //TODO: if Settings.Repeat == true


    let selected = { val: '' };

    if (that._historyFileIndexes.length === that._fileCount) {
      this.message("No files remain");
    }
    else {

      //Dumb algorithm which would approach O(infinity). The correct approach would be to
      //divide the search space into a btree, and prune nodes that have been selected. Then we can use a random
      //binary value to search each level of the tree. Honestly, I don't intend on running this on millions of images, so this will suffice for now

      let rfile = 0;
      while (true) {
        rfile = Math.floor(Math.random() * that._fileCount);
        if (that._historyFileIndexes.indexOf(rfile) === -1) {
          that._historyFileIndexes.push(rfile);
          break;
        }
      }

      await MainWindow.traverseDirectory(that._dataRootPath, false, rfile, { val: that._fileCount }, selected);

      if (selected.val === '') {
        console.log("selected was empty, index = " + rfile)
      }
    }
    return selected.val;
  }
  // private static async getFiles(dir: string): Promise<Array<string>> {
  //   let flist: Array<string> = new Array<string>();
  //   let fq: string = await Remote.path_join(await Remote.process_cwd(), dir);
  //   return await Remote.fs_readdir(fq);
  // }
  private static async traverseDirectory(dir: string, countFilesOnly: boolean, selectedFileIndex: number,
    fileCount: { val: number }, selectedFile: { val: string }, curFileIndex: { val: number } = null): Promise<void> {
    //CountFilesOnly : true = count the files, fileCount must be zero
    //               : false = select a file given the selected index
    if (dir === undefined) {
      console.log("Dir was undefined");
    }
    if (curFileIndex === null || curFileIndex === undefined) {
      curFileIndex = { val: 0 };
    }
    //Check if we already selected something.
    if ((countFilesOnly === false) && Globals.isNotNull(selectedFile.val) && (selectedFile.val !== '')) {
      return;
    }

    if (dir === null || dir === undefined) {
      console.log("dir was null");
    }
    else {
      //Get fully qualified rooted path
      let root_dir: string = await Remote.path_resolve(dir);
      let files = await Remote.fs_readdir(root_dir);

      for (let xi = 0; xi < files.length; xi++) {
        let file_or_dir = files[xi];

        //console.log(root_dir + "   " + file_or_dir);

        let path = await Remote.path_join(root_dir, file_or_dir);

        if (await Remote.isFile(path) === true) {
          if (countFilesOnly) {
            if (fileCount.val === -1) {
              fileCount.val = 0;
            }
            fileCount.val++;
          }
          else if (curFileIndex.val === selectedFileIndex) {
            selectedFile.val = path;
            return;
          }
          else {
            curFileIndex.val++;
          }
        }

        if (await Remote.isDirectory(path) === true) {
          await MainWindow.traverseDirectory(path, countFilesOnly, selectedFileIndex, fileCount, selectedFile, curFileIndex);

          //Check if we already selected something.
          if ((countFilesOnly === false) && Globals.isNotNull(selectedFile.val) && (selectedFile.val !== '')) {
            return;
          }
        }
      }
    }
  }
}
