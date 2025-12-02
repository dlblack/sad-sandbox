import React from "react";
import {
    AnalysesRecord,
    DataRecord,
    DataSaveHandler,
    MapItem,
    RenameHandler,
    SaveAsHandler,
    DeleteHandler
} from "../../types/appData";

export interface ZoneSize {
    W: number; // px
    E: number; // px
}

export interface DockableFrameProps {
    containers: any[];
    setContainers: (next: any[]) => void;
    removeComponent: (id: string, reason?: any) => void;
    onDragStart: (id: string, event: MouseEvent) => void;
    messages: string[];
    messageType: string | null;
    setMessageType: React.Dispatch<React.SetStateAction<string>>;
    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;
    maps: MapItem[];
    data: DataRecord;
    analyses: AnalysesRecord;
    handleOpenComponent: (type: string, props?: Record<string, unknown>) => void;
    onWizardFinish: (type: string, valuesObj: any, id?: string) => Promise<void>;
    onDataSave: DataSaveHandler;

    // --- zone content: render-ready React nodes (required) ---
    centerContent: React.ReactNode;
    westContent: React.ReactNode;
    eastContent: React.ReactNode;
    southContent: React.ReactNode;

    // --- optional initial sizing (px) ---
    initialWestWidth?: number;   // default 360
    initialEastWidth?: number;   // default 100
    initialSouthHeight?: number; // default 200
    minWestWidth?: number;       // default 240
    minEastWidth?: number;       // default 100
    minSouthHeight?: number;     // default 120
}
