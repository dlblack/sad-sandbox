const { contextBridge, ipcRenderer } = require("electron");

function onMenu(channel, callback) {
  try {
    ipcRenderer.removeAllListeners(channel);
  } catch {}
  ipcRenderer.on(channel, (_event, ...args) => callback(...args));
}

contextBridge.exposeInMainWorld("electronAPI", { onMenu });
