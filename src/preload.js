const { contextBridge, ipcRenderer, MessageChannelMain  } = require('electron');
//const { send } = require('process');

contextBridge.exposeInMainWorld("api", {
  callSync: (method, ...args) => {
    return ipcRenderer.invoke(method, args);
  },
  send: (event, ...args) => {
    ipcRenderer.send(event, ...args);
  },
  //Note: once  - vs . on - once will deregister the event.
  receiveOnce: (event, callback) => {
    ipcRenderer.once(event, callback);
  },
  receiveBind: (event, callback) => {
    ipcRenderer.on(event, callback);
  }
});

//https://github.com/aws-amplify/amplify-js/issues/678#issuecomment-389106098
contextBridge.exposeInMainWorld("global", window);

