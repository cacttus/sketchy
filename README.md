


# Sketchy

This is an example of a desktop only electron app that contains server-side (native) control logic on the client. The application can be packaged
into a single EXE, DEB, RPM or AppImage. This was designed to be an easy way to make desktop apps in JS, which mimicks the .NET framework, but has the awesome power of React, Chromium and Bootstrap/Mui (or whatever you want!).

(Using: Nodejs, Electron, Typescipt, jquery, React, Bootstrap, Webpack)

## Building and Installation
Install Nodejs via cURL (Linux) or download (Windows). (I could not get this to work using the Linux package manager version of Node.)

If you're new to NPM, it installs all the dependencies by simply navigating to this project folder and running

`npm install`

VSCode is set up so that F5 should build and run the project, or by running `build-dev.sh` manually in sh (or cygwin/mingw for Windows).

`npm run build-dev`

Electron needs to be invoked in order for the application to run (note the '.')

`npm run electron .`

## Creating an App

To create a new window implement ElectronWindow.tsx and override virtual methods 

`render()` specifically will return the contents of your window as a JSX element.

As of now, you must add a new window .tsx to webpack.config. (make this automatic in the future.)

You can access the filesystem, and other server-side things using `Remote`.

```
import Remote from './Remote';
...
export class MyWindow extends ElectronWindow {
...
  protected override render() : JSX.Element {
    return (
      <div>Hello Window!</div>
    );
  }
...
  private MyCreateChildWindow() : void { 
    Remote.createWindowDetails("MyWindow", "MyWindow.js", 800, 600, true);
  }
}
```



### Building a Standalone: AppImg/RPM/EXE

To build the applciation to an EXE / RPM / AppImage run

`npx electron-builder`

TODO: make a release script that runs electron-builder.
