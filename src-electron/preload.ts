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

function openFolderDialog(): Promise<string | null> {
  return ipcRenderer.invoke("dialog:openFolder");
}
function openFileDialog(): Promise<string | null> {
  return ipcRenderer.invoke("dialog:openFile");
}

function popoutOpen(payload: unknown): Promise<void> {
  return ipcRenderer.invoke("popout:open", payload);
}
function popoutClose(id: string): void {
  ipcRenderer.send("popout:close", id);
}
function popoutSend(channel: string, payload: unknown): void {
  ipcRenderer.send(channel, payload);
}
function popoutOn(channel: string, handler: (payload: unknown) => void) {
  const listener = (_evt: IpcRendererEvent, payload: unknown) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.off(channel, listener);
}
function popoutGetModel(id: string): Promise<unknown> {
  return ipcRenderer.invoke("popout:getModel", id);
}

contextBridge.exposeInMainWorld("electronAPI", {
  onMenu,
  readTextFile,
  setProjectMenuState,
  openFolderDialog,
  openFileDialog,

  popoutOpen,
  popoutClose,
  popoutSend,
  popoutOn,
  popoutGetModel,
});
