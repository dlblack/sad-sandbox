export {};

declare global {
    interface Window {
        electronAPI?: {
            onMenu: (channel: string, callback: (...args: any[]) => void) => void;
        };
    }
}
