import React, { useCallback, useEffect, useState } from "react";
import TreeNode from "./TreeNode";
import { Box, Text } from "@mantine/core";

/** ---------- Helpers ---------- */

function makePath(...args: Array<string | number | null | undefined>): string {
    return args.filter(Boolean).join("/");
}

function usePersistentState<T>(key: string, initial: T) {
    const [val, setVal] = React.useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(val));
        } catch {
            /* ignore */
        }
    }, [key, val]);
    return [val, setVal] as const;
}

/** ---------- Types ---------- */

type MapItem = {
    id?: string;
    name: string;
    description?: string;
};

type AnalysisItem = {
    name: string;
    description?: string;
    [k: string]: unknown;
};

type Analyses = Record<string, AnalysisItem[]>;

type DataItem = {
    name: string;
    description?: string;
    __tempKey?: string;
    [k: string]: unknown;
};
type DataDictionary = Record<string, DataItem[]>;

type SaveAsArgs =
    | {
    section: "maps";
    pathArr: [number];
    newName: string;
    newDesc?: string;
    item?: unknown;
}
    | {
    section: "data";
    pathArr: [string, number];
    newName: string;
    newDesc?: string;
    item?: unknown;
}
    | {
    section: "analyses";
    pathArr: [string, number];
    newName: string;
    newDesc?: string;
    item?: unknown;
};

type RenameArgs =
    | { section: "maps"; pathArr: [number]; newName: string }
    | { section: "data"; pathArr: [string, number]; newName: string }
    | { section: "analyses"; pathArr: [string, number]; newName: string };

/** Match the shape expected by useAppData */
type DeleteArgs =
    | { section: "maps"; pathArr: [number] }
    | { section: "data"; pathArr: [string, number] }
    | { section: "analyses"; pathArr: [string, number] };

export interface ComponentProjectProps {
    analyses?: Analyses;
    data?: DataDictionary;
    maps?: MapItem[];

    onSaveAsNode?: (args: SaveAsArgs) => void;
    onRenameNode?: (args: RenameArgs) => void;

    /** CHANGED: now pass a single object matching DeleteArgs */
    onDeleteNode?: (args: DeleteArgs) => void;

    handleOpenComponent?: (componentName: string, props?: Record<string, unknown>) => void;
}

/** ---------- Component ---------- */

export default function ComponentProject({
                                             analyses = {},
                                             data = {},
                                             maps = [],
                                             onSaveAsNode,
                                             onRenameNode,
                                             onDeleteNode,
                                             handleOpenComponent,
                                         }: ComponentProjectProps) {
    const [expandedMap, setExpandedMap] = usePersistentState<Record<string, boolean>>(
        "tree-expandedMap",
        {}
    );

    const [menu, setMenu] = useState<any>(null);
    const [renaming, setRenaming] = useState<any>(null);
    const [renameValue, setRenameValue] = useState<string>("");
    const [saveAsDialogOpen, setSaveAsDialogOpen] = useState<any>(null);

    useEffect(() => {
        const isAnalysisMulti = (d: any) =>
            d &&
            typeof d.filepath === "string" &&
            Array.isArray(d.pathname) &&
            Array.isArray(d.frequencies);

        const listener = (e: Event) => {
            const detail = (e as CustomEvent)?.detail as any;
            const dataset = detail?.dataset;
            if (!dataset || typeof handleOpenComponent !== "function") return;

            if (dataset.structureType === "TimeSeries") {
                handleOpenComponent("TimeSeriesPlot", { dataset });
                return;
            }
            if (dataset.structureType === "PairedData") {
                handleOpenComponent("PairedDataPlot", { dataset });
                return;
            }
            if (isAnalysisMulti(dataset)) {
                // analysis object: open a PairedDataPlot tab
                handleOpenComponent("PairedDataPlot", { dataset });
            }
        };

        window.addEventListener("plotNodeData", listener as EventListener);
        return () => window.removeEventListener("plotNodeData", listener as EventListener);
    }, [handleOpenComponent]);

    const handleToggle = useCallback(
        (path: string) =>
            setExpandedMap((map) => ({
                ...map,
                [path]: !map[path],
            })),
        [setExpandedMap]
    );

    const handleSaveAs = useCallback(
        (
            sectionKey: "data" | "analyses" | "maps",
            pathArr: Array<string | number>,
            newName: string,
            newDesc?: string,
            item?: unknown
        ) => {
            if (typeof onSaveAsNode !== "function") {
                return;
            }

            if (sectionKey === "maps") {
                const idx = pathArr[0] as number;
                onSaveAsNode({
                    section: "maps",
                    pathArr: [idx],
                    newName,
                    newDesc,
                    item,
                });
                return;
            }

            if (sectionKey === "data") {
                const param = pathArr[0] as string;
                const idx = pathArr[1] as number;
                onSaveAsNode({
                    section: "data",
                    pathArr: [param, idx],
                    newName,
                    newDesc,
                    item,
                });
                return;
            }

            if (sectionKey === "analyses") {
                const folder = pathArr[0] as string;
                const idx = pathArr[1] as number;
                onSaveAsNode({
                    section: "analyses",
                    pathArr: [folder, idx],
                    newName,
                    newDesc,
                    item,
                });
                return;
            }
        },
        [onSaveAsNode]
    );

    const handleRename = useCallback(
        (sectionKey: "data" | "analyses" | "maps", pathArr: Array<string | number>, newName: string) => {
            if (typeof onRenameNode !== "function") {
                return;
            }

            if (sectionKey === "maps") {
                const idx = pathArr[0] as number;
                onRenameNode({
                    section: "maps",
                    pathArr: [idx],
                    newName,
                });
                return;
            }

            if (sectionKey === "data") {
                const param = pathArr[0] as string;
                const idx = pathArr[1] as number;
                onRenameNode({
                    section: "data",
                    pathArr: [param, idx],
                    newName,
                });
                return;
            }

            if (sectionKey === "analyses") {
                const folder = pathArr[0] as string;
                const idx = pathArr[1] as number;
                onRenameNode({
                    section: "analyses",
                    pathArr: [folder, idx],
                    newName,
                });
                return;
            }
        },
        [onRenameNode]
    );

    return (
        <Box>
            <div className="project-tree-fill" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                {/* MAPS */}
                <TreeNode
                    label="Maps"
                    isTopLevel
                    expanded={Boolean(expandedMap["Maps"])}
                    onToggle={handleToggle}
                    path="Maps"
                    menu={menu}
                    setMenu={setMenu}
                    renaming={renaming}
                    setRenaming={setRenaming}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    saveAsDialogOpen={saveAsDialogOpen}
                    setSaveAsDialogOpen={setSaveAsDialogOpen}
                >
                    {Array.isArray(maps) && maps.length > 0 ? (
                        maps.map((mapObj, idx) => (
                            <TreeNode
                                key={mapObj.id || mapObj.name || String(idx)}
                                label={mapObj.name}
                                parentLabel="Maps"
                                canDelete
                                onDelete={() => onDeleteNode?.({ section: "maps", pathArr: [idx] })}
                                onRename={(newName: string) => handleRename("maps", [idx], newName)}
                                expanded={Boolean(expandedMap[makePath("Maps", mapObj.name)])}
                                onToggle={handleToggle}
                                path={makePath("Maps", mapObj.name)}
                                menu={menu}
                                setMenu={setMenu}
                                renaming={renaming}
                                setRenaming={setRenaming}
                                renameValue={renameValue}
                                setRenameValue={setRenameValue}
                                saveAsDialogOpen={saveAsDialogOpen}
                                setSaveAsDialogOpen={setSaveAsDialogOpen}
                            />
                        ))
                    ) : (
                        <Text size="xs" className="tree-label">
                            (No maps)
                        </Text>
                    )}
                </TreeNode>

                {/* DATA */}
                <TreeNode
                    label="Data"
                    isTopLevel
                    expanded={Boolean(expandedMap["Data"])}
                    onToggle={handleToggle}
                    path="Data"
                    menu={menu}
                    setMenu={setMenu}
                    renaming={renaming}
                    setRenaming={setRenaming}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    saveAsDialogOpen={saveAsDialogOpen}
                    setSaveAsDialogOpen={setSaveAsDialogOpen}
                >
                    {Object.keys(data).length > 0 ? (
                        Object.entries(data).map(([parameter, datasets]) => (
                            <TreeNode
                                key={parameter}
                                label={parameter}
                                section="data"
                                expanded={Boolean(expandedMap[makePath("Data", parameter)])}
                                onToggle={handleToggle}
                                path={makePath("Data", parameter)}
                                menu={menu}
                                setMenu={setMenu}
                                renaming={renaming}
                                setRenaming={setRenaming}
                                renameValue={renameValue}
                                setRenameValue={setRenameValue}
                                saveAsDialogOpen={saveAsDialogOpen}
                                setSaveAsDialogOpen={setSaveAsDialogOpen}
                            >
                                {(datasets || []).map((item, idx) => (
                                    <TreeNode
                                        key={item.__tempKey || `${item.name}-${String(idx)}`}
                                        label={item.name}
                                        type={parameter}
                                        section="data"
                                        dataset={item}
                                        onSaveAs={(newName: string, newDesc?: string) =>
                                            handleSaveAs("data", [parameter, idx], newName, newDesc, item)
                                        }
                                        description={item.description}
                                        onRename={(newName: string) => handleRename("data", [parameter, idx], newName)}
                                        canDelete
                                        onDelete={() => onDeleteNode?.({ section: "data", pathArr: [parameter, idx] })}
                                        expanded={Boolean(expandedMap[makePath("Data", parameter, item.name)])}
                                        onToggle={handleToggle}
                                        path={makePath("Data", parameter, item.name)}
                                        menu={menu}
                                        setMenu={setMenu}
                                        renaming={renaming}
                                        setRenaming={setRenaming}
                                        renameValue={renameValue}
                                        setRenameValue={setRenameValue}
                                        saveAsDialogOpen={saveAsDialogOpen}
                                        setSaveAsDialogOpen={setSaveAsDialogOpen}
                                    />
                                ))}
                            </TreeNode>
                        ))
                    ) : (
                        <Text size="xs" className="tree-label">
                            No data
                        </Text>
                    )}
                </TreeNode>

                {/* ANALYSIS */}
                <TreeNode
                    label="Analysis"
                    isTopLevel
                    section="analysis"
                    expanded={Boolean(expandedMap["Analysis"])}
                    onToggle={handleToggle}
                    path="Analysis"
                    menu={menu}
                    setMenu={setMenu}
                    renaming={renaming}
                    setRenaming={setRenaming}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    saveAsDialogOpen={saveAsDialogOpen}
                    setSaveAsDialogOpen={setSaveAsDialogOpen}
                >
                    {Object.keys(analyses).length > 0 ? (
                        Object.entries(analyses).map(([folder, items]) => (
                            <TreeNode
                                key={folder}
                                label={folder}
                                section="analysis"
                                expanded={Boolean(expandedMap[makePath("Analysis", folder)])}
                                onToggle={handleToggle}
                                path={makePath("Analysis", folder)}
                                menu={menu}
                                setMenu={setMenu}
                                renaming={renaming}
                                setRenaming={setRenaming}
                                renameValue={renameValue}
                                setRenameValue={setRenameValue}
                                saveAsDialogOpen={saveAsDialogOpen}
                                setSaveAsDialogOpen={setSaveAsDialogOpen}
                            >
                                {Array.isArray(items) && items.length > 0 ? (
                                    items.map((item, idx) => (
                                        <TreeNode
                                            key={`${item.name}-${String(idx)}`}
                                            label={item.name}
                                            parentLabel={folder}
                                            onSaveAs={(newName: string, newDesc?: string) =>
                                                handleSaveAs("analyses", [folder, idx], newName, newDesc, item)
                                            }
                                            type={folder}
                                            section="analysis"
                                            description={item.description}
                                            onRename={(newName: string) => handleRename("analyses", [folder, idx], newName)}
                                            canDelete
                                            onDelete={() => onDeleteNode?.({ section: "analyses", pathArr: [folder, idx] })}
                                            expanded={Boolean(expandedMap[makePath("Analysis", folder, item.name)])}
                                            onToggle={handleToggle}
                                            path={makePath("Analysis", folder, item.name)}
                                            menu={menu}
                                            setMenu={setMenu}
                                            renaming={renaming}
                                            setRenaming={setRenaming}
                                            renameValue={renameValue}
                                            setRenameValue={setRenameValue}
                                            saveAsDialogOpen={saveAsDialogOpen}
                                            setSaveAsDialogOpen={setSaveAsDialogOpen}
                                            dataset={item}
                                        />
                                    ))
                                ) : (
                                    <Text size="xs" className="tree-label">No analyses</Text>
                                )}
                            </TreeNode>
                        ))
                    ) : (
                        <Text size="xs" className="tree-label">No analyses</Text>
                    )}
                </TreeNode>
            </div>
        </Box>
    );
}
