import React, { useRef, useCallback } from "react";
import isElectron from "../utils/isElectron";

export default function useFolderPicker(onPicked: (dir: string) => void) {
    const fallbackRef = useRef<HTMLInputElement | null>(null);

    const browse = useCallback(async () => {
        if (isElectron()) {
            try {
                const directoryPath = await (window as any).electronAPI.openFolderDialog();
                if (directoryPath) onPicked(directoryPath);
            } catch {}
            return;
        }
        if ("showDirectoryPicker" in window) {
            try {
                const directoryHandle = await (window as any).showDirectoryPicker();
                onPicked(directoryHandle.name);
            } catch {}
            return;
        }
        fallbackRef.current?.click();
    }, [onPicked]);

    const onFallbackChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const rel = (files[0] as any)?.webkitRelativePath || "";
        const folder = rel.split("/")[0] || files[0].name;
        onPicked(folder);
    }, [onPicked]);

    return { browse, fallbackRef, onFallbackChange };
}
