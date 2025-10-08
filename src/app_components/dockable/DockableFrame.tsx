import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DockableItem from "./DockableItem";
import { componentMetadata } from "../../utils/componentMetadata";
import { dockableContentFactory } from "../../utils/dockableContentFactory";
import {
    Section,
    SaveAsArgs,
    RenameArgs,
    DeleteArgs,
    SaveAsObject,
    RenameObject,
    DeleteObject,
    SaveAsPositional,
    RenamePositional,
    DeletePositional,
    SaveAsHandler,
    RenameHandler,
    DeleteHandler,
} from "../../types/treeActions";

/** ----- Layout constants ----- */
const MIN_WIDTH = 120;
const MAX_WIDTH_W = 800;
const MAX_WIDTH_E = 1000;
const MIN_S_HEIGHT = 120;
const MAX_S_HEIGHT = 800;

type DockZone = "W" | "E" | "S" | "CENTER" | string;
const DOCK_ZONES: DockZone[] = ["W", "CENTER", "E", "S"];

function getZoneMaxWidth(zone: DockZone) {
    if (zone === "W") return MAX_WIDTH_W;
    if (zone === "E") return MAX_WIDTH_E;
    return Infinity;
}

/** ----- Props & helper types ----- */
export interface DockContainer {
    id: string;
    type: string;
    dockZone: DockZone;
    dataset?: any;
    props?: any;
    width?: number;
    height?: number;
}

export interface DockableFrameProps {
    containers: DockContainer[];
    setContainers: React.Dispatch<React.SetStateAction<DockContainer[]>>;
    removeComponent: (id: string) => void;

    // drag
    onDragStart?: (id: string, event: any) => void;

    // messages
    messages: any[];
    messageType?: any;
    setMessageType?: React.Dispatch<React.SetStateAction<any>>;

    // project tree ops
    onSaveAsNode: SaveAsHandler;
    onRenameNode: RenameHandler;
    onDeleteNode: DeleteHandler;

    // data
    maps: any;
    data: any;
    analyses: any;

    // openers and handlers
    handleOpenComponent: (type: string, props?: any) => void;
    onWizardFinish: (type: string, valuesObj: any, id?: string) => Promise<void>;
    onDataSave: (category: string, valuesObj: any) => Promise<void>;

    // zone contents (optional)
    centerContent?: React.ReactNode;
    westContent?: React.ReactNode;
    eastContent?: React.ReactNode;
    southContent?: React.ReactNode;
}

/** ----- Draggable wrapper for a DockableItem ----- */
function DraggableDockableItem({
                                   container,
                                   onRemove,
                                   onResize,
                                   setFocusedId,
                                   focusedId,
                                   setDraggingPanelId,
                                   showHeader = true,
                               }: {
    container: DockContainer & { content?: React.ReactNode };
    onRemove: (id: string) => void;
    onResize: (size: { width: number; height: number }, id: string) => void;
    setFocusedId: (id: string | null) => void;
    focusedId: string | null;
    setDraggingPanelId: (id: string | null) => void;
    showHeader?: boolean;
}) {
    const { id, type } = container;

    const handleDragStart: React.DragEventHandler<HTMLDivElement> = (e) => {
        setDraggingPanelId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/x-dockable-id", id);
    };

    const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => setDraggingPanelId(null);

    const sizeProps =
        showHeader && typeof container.width === "number" && typeof container.height === "number"
            ? { width: container.width, height: container.height }
            : {};

    return (
        <div className="dockable-drag-wrapper" style={{ display: "flex", flex: 1, minWidth: 0, minHeight: 0 }}>
            <DockableItem
                {...container}
                {...sizeProps}
                type={(componentMetadata as any)?.[type]?.entityName ?? type}
                title={container.dataset?.name || ""}
                onRemove={onRemove}
                onResize={(size) => onResize(size, id)}
                onClick={() => setFocusedId(container.id)}
                isFocused={container.id === focusedId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                showHeader={showHeader}
                fill
            >
                {container.content}
            </DockableItem>
        </div>
    );
}

/** ----- Main frame ----- */
const DockableFrame: React.FC<DockableFrameProps> = ({
                                                         containers,
                                                         setContainers,
                                                         removeComponent,
                                                         onWizardFinish,
                                                         onDataSave,
                                                         messages,
                                                         onSaveAsNode,
                                                         onRenameNode,
                                                         onDeleteNode,
                                                         handleOpenComponent,
                                                         maps,
                                                         data,
                                                         analyses,
                                                         centerContent,
                                                         westContent,
                                                         eastContent,
                                                         southContent,
                                                     }) => {
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);

    const [zoneWidths, setZoneWidths] = useState<{ W: number; CENTER?: number; E: number }>({
        W: 240,
        E: 400,
    });

    const initialSouthHeight = useMemo(() => {
        const southItem = containers.find((c) => c.dockZone === "S" && typeof c.height === "number");
        return southItem ? Math.max(southItem.height!, MIN_S_HEIGHT) : 240;
    }, [containers]);

    const [southHeight, setSouthHeight] = useState<number>(initialSouthHeight);

    const dragging = useRef<{
        zone: DockZone | null;
        startX: number;
        startWidth: number;
        startY: number;
        startHeight: number;
    }>({ zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 });

    // ---- Adapters for handlers ----
    const saveAsAdapter = (
        section: Section,
        pathArr: (string | number)[],
        newName: string,
        newDesc?: string,
        item?: any
    ) => {
        const fn = onSaveAsNode as SaveAsHandler;
        return (fn as SaveAsPositional).length >= 3
            ? (fn as SaveAsPositional)(section, pathArr, newName, newDesc, item)
            : (fn as SaveAsObject)({ section, pathArr, newName, newDesc, item } as SaveAsArgs);
    };

    const renameAdapter = (section: Section, pathArr: (string | number)[], newName: string) => {
        const fn = onRenameNode as RenameHandler;
        return (fn as RenamePositional).length >= 3
            ? (fn as RenamePositional)(section, pathArr, newName)
            : (fn as RenameObject)({ section, pathArr, newName } as RenameArgs);
    };

    const deleteAdapter = (section: Section, pathArr: (string | number)[], name?: string) => {
        const fn = onDeleteNode as DeleteHandler;
        return (fn as DeletePositional).length >= 2
            ? (fn as DeletePositional)(section, pathArr, name)
            : (fn as DeleteObject)({ section, pathArr, name } as DeleteArgs);
    };

    // Build container contents
    const containersWithContent = containers.map((c) => {
        const dataset = (c as any).dataset || c;
        const content = dockableContentFactory(c.type, {
            ...c,
            dataset,
            id: c.id,
            type: c.type,
            onFinish: onWizardFinish, // Promise<void>
            onRemove: () => removeComponent(c.id),
            onDataSave,
            messages,
            onSaveAsNode: saveAsAdapter,
            onRenameNode: renameAdapter,
            onDeleteNode: deleteAdapter,
            handleOpenComponent,
            maps,
            data,
            analyses,
        });

        return { ...c, dataset, content };
    });

    // Adjust zone sizes based on current containers
    useEffect(() => {
        DOCK_ZONES.forEach((zone) => {
            if (zone === "CENTER") return;
            const panelsInZone = containers.filter((c) => c.dockZone === zone);
            if (!panelsInZone.length) return;

            if (zone === "S") {
                const maxHeight = Math.max(
                    ...panelsInZone.map((p) => (typeof p.height === "number" ? p.height : 0)),
                    MIN_S_HEIGHT
                );
                setSouthHeight(Math.min(Math.max(maxHeight + 24, MIN_S_HEIGHT), MAX_S_HEIGHT));
            } else {
                const maxWidth = Math.max(
                    ...panelsInZone.map((p) => (typeof p.width === "number" ? p.width : 0)),
                    MIN_WIDTH
                );
                setZoneWidths((w) => {
                    const desired = Math.min(Math.max(maxWidth + 24, MIN_WIDTH), getZoneMaxWidth(zone));
                    return (w as any)[zone] === desired ? w : { ...w, [zone]: desired };
                });
            }
        });
    }, [containers]);

    const handleItemResize = useCallback(
        (zone: DockZone) => (size: { width: number; height: number }, id: string) => {
            if (zone === "S") {
                setSouthHeight(() => Math.max(MIN_S_HEIGHT, Math.min(size.height + 24, MAX_S_HEIGHT)));
            } else {
                setZoneWidths((prev) => {
                    const maxWidth = getZoneMaxWidth(zone);
                    const newWidth = Math.max(MIN_WIDTH, Math.min(size.width + 24, maxWidth));
                    return (prev as any)[zone] !== newWidth ? { ...prev, [zone]: newWidth } : prev;
                });
            }
            setContainers((prev) => prev.map((c) => (c.id === id ? { ...c, width: size.width, height: size.height } : c)));
        },
        [setContainers]
    );

    // Splitter handlers (W/E)
    const onVerticalSplitterDown = (zone: "W" | "E") => (e: React.MouseEvent) => {
        dragging.current = {
            zone,
            startX: e.clientX,
            startWidth: (zoneWidths as any)[zone] || 0,
            startY: 0,
            startHeight: 0,
        };
        document.body.style.cursor = "col-resize";
        window.addEventListener("mousemove", onVerticalMouseMove);
        window.addEventListener("mouseup", onVerticalMouseUp);
    };

    const onVerticalMouseMove = (e: MouseEvent) => {
        const { zone, startX, startWidth } = dragging.current;
        if (!zone || (zone !== "W" && zone !== "E")) return;
        const dx = e.clientX - startX;
        const maxWidth = getZoneMaxWidth(zone);
        let newWidth = startWidth + (zone === "E" ? -dx : dx);
        newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, maxWidth));
        setZoneWidths((prev) => ({ ...prev, [zone]: newWidth } as any));
    };

    const onVerticalMouseUp = () => {
        dragging.current = { zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 };
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", onVerticalMouseMove);
        window.removeEventListener("mouseup", onVerticalMouseUp);
    };

    // Splitter handlers (S)
    const onHorizontalSplitterDown = (e: React.MouseEvent) => {
        dragging.current = {
            zone: "S",
            startY: e.clientY,
            startHeight: southHeight,
            startX: 0,
            startWidth: 0,
        };
        document.body.style.cursor = "row-resize";
        window.addEventListener("mousemove", onHorizontalMouseMove);
        window.addEventListener("mouseup", onHorizontalMouseUp);
    };

    const onHorizontalMouseMove = (e: MouseEvent) => {
        const { startY, startHeight } = dragging.current;
        if (!startHeight) return;
        let newHeight = startHeight - (e.clientY - startY);
        newHeight = Math.max(MIN_S_HEIGHT, Math.min(newHeight, MAX_S_HEIGHT));
        setSouthHeight(newHeight);
    };

    const onHorizontalMouseUp = () => {
        dragging.current = { zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 };
        document.body.style.cursor = "";
        window.removeEventListener("mousemove", onHorizontalMouseMove);
        window.removeEventListener("mouseup", onHorizontalMouseUp);
    };

    const moveToZone = useCallback(
        (id: string, newZone: DockZone) => {
            setContainers((prev) => {
                const moved = prev.find((c) => c.id === id);
                if (!moved) return prev;

                const updated = prev.map((c) => (c.id === id ? { ...c, dockZone: newZone } : c));

                if ((newZone === "W" || newZone === "E") && moved.width) {
                    setZoneWidths((zw) => {
                        const maxWidth = getZoneMaxWidth(newZone);
                        const desiredWidth = Math.min(Math.max(moved.width! + 24, MIN_WIDTH), maxWidth);
                        return !(zw as any)[newZone] || desiredWidth > (zw as any)[newZone] ? { ...zw, [newZone]: desiredWidth } : zw;
                    });
                }
                if (newZone === "S" && moved.height) {
                    setSouthHeight(() => Math.min(Math.max(moved.height! + 24, MIN_S_HEIGHT), MAX_S_HEIGHT));
                }

                setFocusedId(id);
                return updated;
            });
        },
        [setContainers]
    );

    // Collapse zones to minimum when empty
    useEffect(() => {
        DOCK_ZONES.forEach((zone) => {
            if ((zone === "E" || zone === "W") && !containersWithContent.some((c) => c.dockZone === zone)) {
                setZoneWidths((prev) => ((prev as any)[zone] !== MIN_WIDTH ? { ...prev, [zone]: MIN_WIDTH } : prev));
            }
        });
        if (!containersWithContent.some((c) => c.dockZone === "S")) {
            setSouthHeight(MIN_S_HEIGHT);
        }
    }, [containersWithContent]);

    function renderZone(zone: DockZone) {
        const items = containersWithContent.filter((c) => c.dockZone === zone);
        const zoneStyle: React.CSSProperties = {};
        if (zone === "S") {
            zoneStyle.height = southHeight;
        } else if (zone === "W" || zone === "E") {
            zoneStyle.width = (zoneWidths as any)[zone];
        }

        // If explicit content provided for the zone, use it
        if (zone === "CENTER" && centerContent) {
            return (
                <div key={zone} className="dock-zone dock-zone-center" style={{ ...zoneStyle, minWidth: 0, minHeight: 0 }}>
                    {centerContent}
                </div>
            );
        }
        if (zone === "W" && westContent) {
            return (
                <div
                    key="W"
                    className="dock-zone dock-zone-w"
                    style={{ width: zoneWidths.W, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}
                    onDragOver={(e) => draggingPanelId && e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const panelId = e.dataTransfer.getData("application/x-dockable-id");
                        if (panelId) moveToZone(panelId, zone);
                        setDraggingPanelId(null);
                    }}
                >
                    {westContent}
                </div>
            );
        }
        if (zone === "E" && eastContent) {
            return (
                <div
                    key="E"
                    className="dock-zone dock-zone-e"
                    style={{ width: zoneWidths.E, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}
                    onDragOver={(e) => draggingPanelId && e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const panelId = e.dataTransfer.getData("application/x-dockable-id");
                        if (panelId) moveToZone(panelId, zone);
                        setDraggingPanelId(null);
                    }}
                >
                    {eastContent}
                </div>
            );
        }
        if (zone === "S" && southContent) {
            return (
                <div
                    key="S"
                    className="dock-zone dock-zone-s"
                    style={{ ...zoneStyle, minWidth: 0, minHeight: 0, display: "flex" }}
                    onDragOver={(e) => draggingPanelId && e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const panelId = e.dataTransfer.getData("application/x-dockable-id");
                        if (panelId) moveToZone(panelId, zone);
                        setDraggingPanelId(null);
                    }}
                >
                    {southContent}
                </div>
            );
        }

        // Fallback: render the items directly in the zone
        return (
            <div
                key={zone}
                className={`dock-zone dock-zone-${String(zone).toLowerCase()}`}
                style={{ ...zoneStyle, minWidth: 0, minHeight: 0 }}
                onDragOver={(e) => draggingPanelId && e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const panelId = e.dataTransfer.getData("application/x-dockable-id");
                    if (panelId) moveToZone(panelId, zone);
                    setDraggingPanelId(null);
                }}
            >
                {items.map((c) => (
                    <DraggableDockableItem
                        key={c.id}
                        container={c}
                        onRemove={removeComponent}
                        onResize={handleItemResize(zone)}
                        setFocusedId={setFocusedId}
                        focusedId={focusedId}
                        setDraggingPanelId={setDraggingPanelId}
                        showHeader
                    />
                ))}
            </div>
        );
    }

    const renderVerticalSplitter = (zone: "W" | "E") => (
        <div className="dock-splitter" onMouseDown={onVerticalSplitterDown(zone)} />
    );

    const renderHorizontalSplitter = () => (
        <div className="dock-splitter-horizontal" onMouseDown={onHorizontalSplitterDown} />
    );

    return (
        <div className="dockable-frame">
            <div className="dockable-frame-row">
                {renderZone("W")}
                {renderVerticalSplitter("W")}
                {renderZone("CENTER")}
                {renderVerticalSplitter("E")}
                {renderZone("E")}
            </div>
            {renderHorizontalSplitter()}
            {renderZone("S")}
        </div>
    );
};

export default DockableFrame;
