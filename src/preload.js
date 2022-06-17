const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld("api", {
  send: (id, data) => {
    ipcRenderer.send("toMain", [id, data]);
  },
  receive: (func) => {
    ipcRenderer.on("fromMain", (event, args) => func(args[0], args[1]));
  }
});

