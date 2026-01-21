import React from "react";
import { DockContainer } from "../../types/dock";
import { AppMessage, AppMessageType } from "../../types/messages";
import { SaveAsHandler, RenameHandler, DeleteHandler, DataSaveHandler } from "../../types/appData";

export type ZoneSize = { W: number; E: number };

export type DockableFrameProps = {
    containers: DockContainer[];
    setContainers: React.Dispatch<React.SetStateAction<DockContainer[]>>;
    removeComponent: (id: string) => void;
    onDragStart: (id: string, event: MouseEvent) => void;

    messages: AppMessage[];
    messageType: AppMessageType;
    setMessageType: React.Dispatch<React.SetStateAction<AppMessageType>>;

    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;

    maps: unknown;
    data: unknown;
    analyses: unknown;

    handleOpenComponent: (type: string, props?: Record<string, unknown>) => void;
    onWizardFinish: (type: string, valuesObj: unknown, id?: string) => Promise<void>;
    onDataSave: DataSaveHandler;

    centerContent?: React.ReactNode;
    westContent?: React.ReactNode;
    eastContent?: React.ReactNode;
    southContent?: React.ReactNode;

    initialWestWidth?: number;
    initialEastWidth?: number;
    initialSouthHeight?: number;

    minWestWidth?: number;
    minEastWidth?: number;
    minSouthHeight?: number;
};
