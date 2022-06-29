const { contextBridge, ipcRenderer } = require('electron');
//const { send } = require('process');

contextBridge.exposeInMainWorld("api", {
  callSync: (method, ...args) => {
    return ipcRenderer.invoke(method, args);
  },
  // send: (id, data) => {
  //   ipcRenderer.send("toMain", [id, data]);
  // },
  receive: (event, callback) => {
    ipcRenderer.on(event, callback);
  }
});

//https://github.com/aws-amplify/amplify-js/issues/678#issuecomment-389106098
contextBridge.exposeInMainWorld("global", window);

