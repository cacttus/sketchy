


# Sketchy

This is an example of a desktop only electron app that contains server-side (native) control logic on the client. The application can be packaged
into a single EXE, DEB, RPM or AppImage. This was designed to be an easy way to make desktop apps in JS, which mimicks the .NET framework, but has the awesome power of React, Chromium and Bootstrap/Mui (or, whatever UI you want!).

(Using: Nodejs, Electron, Typescipt, jquery, React, Bootstrap, Webpack)

## Building
Install Nodejs via cURL (Linux) or download (Windows). 

* _Note: The Linux package version of Node may be out of date, depending on your distro._

If you're new to NPM, it installs all the dependencies by simply navigating to this project folder and running

`npm install`

VSCode is set up so that F5 should build and run the project.

The project can also be run manually with `build-dev.sh`, or in node via 

`npm run build-dev`

Electron needs to be invoked in order for the application to run (note the '.')

`npm run electron .`

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

## Bundling  (.exe, .appimage, .rpm, .deb, etc.)

To bundle the application into an .exe, .rpm, .deb, .AppImage, or other standalone format run:

`npx electron-builder`

You can configure electron-builder in the `build` property within `package.json`. 

See the documentation for [electron-builder](https://www.electron.build/) for more info.

_TODO: make a release script that runs electron-builder._


