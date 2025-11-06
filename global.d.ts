/// <reference lib="dom" />

import React from "react";

declare global {
    interface Window {
        electronAPI: {
            onMenu: (channel: string, handler: (payload: unknown) => void) => void | (() => void);
            readTextFile: (filePath: string) => Promise<string>;
            setProjectMenuState: (projectOpen: boolean) => void;
            openFolderDialog: () => Promise<string | null>;
            openFileDialog: () => Promise<string | null>;
        };
    }
}

declare module "react" {
    interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
        webkitdirectory?: string;
        directory?: string;
    }
}

export {};
