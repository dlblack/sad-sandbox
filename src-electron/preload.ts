import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

function onMenu(channel: string, handler: (payload: unknown) => void) {
  const listener = (_evt: IpcRendererEvent, payload: unknown) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.off(channel, listener);
}

function readTextFile(filePath: string): Promise<string> {
  return ipcRenderer.invoke("file:readText", filePath);
}

function setProjectMenuState(projectOpen: boolean): void {
  ipcRenderer.send("menu:project-state", projectOpen);
}

// Optional helpers you already typed in global.d.ts
function openFolderDialog(): Promise<string | null> {
  return ipcRenderer.invoke("dialog:openFolder");
}
function openFileDialog(): Promise<string | null> {
  return ipcRenderer.invoke("dialog:openFile");
}

contextBridge.exposeInMainWorld("electronAPI", {
  onMenu,
  readTextFile,
  setProjectMenuState,
  openFolderDialog,
  openFileDialog,
});
