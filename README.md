
# Sketchy

A desktop only electron app that functions somewhat like .NET. 

## Building

Install Nodejs via cURL (Linux) or download (Windows). 

* _Note: The Linux package version of Node may be out of date, depending on your distro._

Then simply navigate to the project folder and run:

`npm install`

In a terminal window, in the sketchy folder run: 

`npx webpack -w --mode=development --config=./webpack.config.js`

* _Note: webpack is optimized to run in watch (-w) mode._

To run use `F5` in vscode, or `npm run electron .` in a terminal window.

Note that since windows are dynamic modules, closing, and re-opening a window will effectively re-load it.

## Creating an App

To create a new window, implement `ElectronWindow` and override the virtual methods in that class. 

`render()` specifically will return the contents of your window as a JSX element.

* _Note: make sure to add any new *.tsx windows to webpack.config.js_

```

import ElectronWindow from './ElectronWindow';
import Remote from './Remote';

export class MyWindow extends ElectronWindow {
  public constructor() {
    super();
  }
  public override async init() : Promise<void>{
    //on initialize
  }
  protected override onResize(w:number,h:number){
    //resize event
  }
  //Get events from this, or other windows
  protected override receiveEvent(winId: number, winEvent: string, ...args: any[]): void { 
    // Get events from windows
  }
  //This is the information that the window will be created with
  protected override getCreateInfo?(): WindowCreateInfo {
    let x = new WindowCreateInfo();
    x._height = 800;
    x._width = 600;
    x._title = "Sketchy";
    return x;
  }
  // Main React render
  protected override render() : JSX.Element {
    return (
      <div>Hello Window!</div>
    );
  }
  //Other stuff this API can do:
  private myCreateChildWindow() : void { 
    let win = Remote.createWindow("MyChildWindow.js");
    Remote.showWindow(win, true)
  }
  private myReadFile() : Promise<Buffer> { 
    return Remote.fs_readFile("myFile.txt");
  }
}
```

As of now, you must add your `Window.tsx` to `webpack.config.js` 

_TODO: make this automatic in the future._

```
//webpack.config.js..
..
render.entry = {
  MyWindow: path.resolve(__dirname, "./src/YourWindow.tsx"),
  //...other windows
};
..
```

## Bundling  (.exe, .rpm, .deb, appimage,  etc.)

1. In Linux run `bundle.sh` to create a production build and bundle.

2. or, after a build, run:

  `npx electron-builder`

  After building this application. (Make sure `build-dev.sh` is run first so contents are copied.)

Binary is placed in `/dist/`.

You can configure electron-builder in the `build` property within `package.json`. 
_Note: the extends:'null' is required to prevent electron-builder from looking at /public/electron.js_

See the documentation for [electron-builder](https://www.electron.build/) for more info.
