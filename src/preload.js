const { contextBridge, ipcRenderer } = require('electron');
//const { send } = require('process');

contextBridge.exposeInMainWorld("api", {
  callSync: (method, ...args) => {
    return ipcRenderer.invoke(method, args);
  },
  // send: (id, data) => {
  //   ipcRenderer.send("toMain", [id, data]);
  // },
  // receive: (func) => {
  //   ipcRenderer.on("fromMain", (event, args) => func(args[0], args[1]));
  // }
});

