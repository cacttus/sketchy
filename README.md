


TODO:
1. Back/forward
2. Settings for folder.
3. Get AppImage to work.

# Sketchy

This is an example of a desktop only electron app that contains server-side (native) control logic on the client. The application can be packaged
into a single EXE, DEB, RPM or AppImage. 
This was designed to be an easy way to make desktop apps in JS. It attempts to be like the .NET framework, but is completely cross-platform, and has the awesome power of React and Chromium.


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

* _Note that the ElectronWindow actually wraps the window contents inside a react Root element and bootstrap element. The bootstrap flex box has full-screen width, zero padding, and sizes proportionally to the window._

```
import ElectronWindow from './ElectronWindow';
import Remote from './Remote';

export class MyWindow extends ElectronWindow {
  
  public constructor() {
    super();
  }
  
  protected override title() : string { return "MyWindow!"; }
  protected override width() : number { return "800"; }
  protected override height() : number { return "600"; }
  protected override render() : JSX.Element {
    return (
      <div>Hello Window!</div>
    );
  }
  
  private myCreateChildWindow() : void { 
    Remote.createWindow("MyChildWindow.js");
    //Another way
    Remote.createWindowDetails("MyWindow", "MyWindow.js", 800, 600, true);
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

To bundle the application into an .exe, .rpm, .deb, AppImage, or other standalone format run:

`npx electron-builder`

After building this application. (Make sure `build-dev.sh` is run first so contents are copied.)

Binary is placed in `/dist/`.

You can configure electron-builder in the `build` property within `package.json`. 
_Note: the extends:'null' is required to prevent electron-builder from looking at /public/electron.js_

See the documentation for [electron-builder](https://www.electron.build/) for more info.

_TODO: make a release script that runs electron-builder._

(Using: Nodejs, Electron, Typescipt, jquery, React, Bootstrap, Webpack)
