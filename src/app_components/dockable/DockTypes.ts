import React from "react";

export type DockZone = "W" | "CENTER" | "E" | "S";

export interface ZoneSize {
    W: number; // px
    E: number; // px
}

export interface DockableFrameProps {
    containers?: any[];
    setContainers?: (next: any[]) => void;
    removeComponent?: (id: string, reason?: any) => void;
    onDragStart?: (id: string, event: MouseEvent) => void;
    messages?: any[];
    messageType?: string;
    setMessageType?: (t: string) => void;
    onSaveAsNode?: any;
    onRenameNode?: any;
    onDeleteNode?: any;
    maps?: any;
    data?: any;
    analyses?: any;
    handleOpenComponent?: (type: string, props?: any) => void;
    onWizardFinish?: (type: string, valuesObj: any, id?: string) => Promise<void>;
    onDataSave?: (category: string, valuesObj: any) => Promise<void>;

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
