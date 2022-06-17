
### Install, build, run
npm install
npm run build
npm run start

## AppImg/RPM/EXE build
in main folder .. 
* npx electron-builder

TODO: make a release script that runs electron-builder.

### Additional Info
npx electron .
npx webpack-cli build --c main.webpack.js 
npx webpack-cli build --c render.webpack.js 
npx webpack-dev-server
npm start

We are not using the create-raect-app thing so no react-scripts are used
instead we are using webpack manually to compile typescript and then electron-forge to bundle electron into an exe
We bundle everything with webpack which, of course, uses ts-loader (i.e. tsc) to compile the typescript tsx files.
WP bundles it all into /dist  NOTE the webpack config file defines development or production - this will determine if code is minified.
Electron uses the package.json 's main configuration to locate the bundle we compiled with webpack.
It simply encloses it in the electron container and we're good to go - for dev.
For release builds electron-forge uses the same to push everything into a .deb, or, .exe

### Extra Install Instructions
Note install nodejs from CURL on linux
Install NPM
DL this
run npm install