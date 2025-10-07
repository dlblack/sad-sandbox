import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

type MenuCallback = (...args: unknown[]) => void;

/**
 * Subscribe to a menu channel from the main process.
 * Returns an unsubscribe function that removes listeners for that channel.
 */
function onMenu(channel: string, callback: MenuCallback): () => void {
  try {
    ipcRenderer.removeAllListeners(channel);
  } catch {
    // ignore
  }

  ipcRenderer.on(channel, (_event: IpcRendererEvent, ...args: unknown[]) => {
    callback(...args);
  });

  return () => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch {
      // ignore
    }
  };
}

const api = { onMenu };

contextBridge.exposeInMainWorld("electronAPI", api);

// Optional: export the API type for use in your renderer typing
export type PreloadAPI = typeof api;
