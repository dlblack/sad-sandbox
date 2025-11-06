import React, { useCallback } from "react";
import { TextStore } from "../utils/TextStore";
import { tryParseProjectFile, isNeptuneFile, type ParseErrorCode } from "../utils/projectFiles";
import isElectron from "../utils/isElectron";

function alertFor(code: ParseErrorCode) {
    switch (code) {
        case "NEPTUNE_REQUIRED":
            alert(TextStore.alert("HomePage_NeptuneFileRequired"));
            break;
        case "INVALID_FORMAT":
            alert(TextStore.alert("HomePage_InvalidFormat"));
            break;
        case "MISSING_FIELDS":
            alert(TextStore.alert("HomePage_MissingFields"));
            break;
    }
}

export default function useNeptuneProjectPicker(
    onOpenMeta: (meta: { projectName: string; directory: string }) => Promise<void>
) {
    const openFromFileLike = useCallback(async (fileLike: { name: string; text: () => Promise<string> }) => {
        const raw = await fileLike.text();
        const result = tryParseProjectFile(fileLike.name, raw);
        if (!result.ok) {
            alertFor(result.code);
            return false;
        }
        await onOpenMeta(result.meta);
        return true;
    }, [onOpenMeta]);

    const browseProjectFile = useCallback(async () => {
        if (isElectron()) {
            const filePath = await (window as any).electronAPI.openFileDialog();
            if (!filePath) return false;
            if (!isNeptuneFile(filePath)) {
                alert(TextStore.alert("HomePage_NeptuneFileRequired"));
                return false;
            }
            const raw = await (window as any).electronAPI.readTextFile(filePath);
            return openFromFileLike({ name: filePath, text: async () => raw });
        }

        if ("showOpenFilePicker" in window) {
            const [handle] = await (window as any).showOpenFilePicker({
                types: [{ description: "Neptune Project", accept: { "application/x-neptune": [".neptune"] } }],
                multiple: false,
            });
            const file = await handle.getFile();
            return openFromFileLike(file);
        }

        return null;
    }, [openFromFileLike]);

    const onPickedFromInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return false;
        return openFromFileLike(file);
    }, [openFromFileLike]);

    return { browseProjectFile, onPickedFromInput };
}
