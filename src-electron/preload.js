import { contextBridge, ipcRenderer } from 'electron';

function onMenu(channel, callback) {
  ipcRenderer.removeAllListeners(channel);
  ipcRenderer.on(channel, (_event, ...args) => callback(...args));
}

contextBridge.exposeInMainWorld('electronAPI', {
  onMenu,
});
