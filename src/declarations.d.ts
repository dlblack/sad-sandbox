declare module "*.png" {
  const value: string;
}
declare module "*.jpg" {
  const value: string;
}
declare module "*.jpeg" {
  const value: string;
}
declare module "*.svg" {
  const value: string;
}
declare module "*.gif" {
  const value: string; export default value;
}
declare module "*.webp" {
  const value: string; export default value;
}
declare module "*.css";

declare global {
  interface Window {
    electronAPI?: {
      onMenu?: (channel: string, handler: (payload: unknown) => void) => () => void;
      readTextFile?: (filePath: string) => Promise<string>;
      setProjectMenuState?: (projectOpen: boolean) => void;
      openFolderDialog?: () => Promise<string | null>;
      openFileDialog?: () => Promise<string | null>;

      popoutOpen?: (payload: unknown) => Promise<void>;
      popoutClose?: (id: string) => void;
      popoutSend?: (channel: string, payload: unknown) => void;
      popoutOn?: (channel: string, handler: (payload: unknown) => void) => () => void;
      popoutGetModel?: (id: string) => Promise<unknown>;
    };
  }
}

export {};
