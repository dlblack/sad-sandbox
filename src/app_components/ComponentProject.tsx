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
            // ignore storage failures
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

export interface ComponentProjectProps {
    analyses?: Analyses;
    data?: DataDictionary;
    maps?: MapItem[];
    onSaveAsNode?: (
        sectionKey: "data" | "analyses" | "maps",
        pathArr: Array<string | number>,
        newName: string,
        newDesc?: string,
        item?: unknown
    ) => void;
    onRenameNode?: (
        sectionKey: "data" | "analyses" | "maps",
        pathArr: Array<string | number>,
        newName: string
    ) => void;
    onDeleteNode?: (
        sectionKey: "data" | "analyses" | "maps",
        pathArr: Array<string | number>,
        itemName?: string
    ) => void;
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

    // These are UI state objects used by TreeNode; keep them flexible (any).
    const [menu, setMenu] = useState<any>(null);
    const [renaming, setRenaming] = useState<any>(null);
    const [renameValue, setRenameValue] = useState<string>("");
    const [saveAsDialogOpen, setSaveAsDialogOpen] = useState<any>(null);

    // Plot listener (for external "plotNodeData" CustomEvents)
    useEffect(() => {
        const listener = (e: Event) => {
            const detail = (e as CustomEvent)?.detail as any;
            const dataset = detail?.dataset;
            if (!dataset || typeof handleOpenComponent !== "function") return;

            if (dataset.structureType === "TimeSeries") {
                handleOpenComponent("TimeSeriesPlot", { dataset });
            } else if (dataset.structureType === "PairedData") {
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
                console.warn("ComponentProject: onSaveAsNode missing");
                return;
            }
            onSaveAsNode(sectionKey, pathArr, newName, newDesc, item);
        },
        [onSaveAsNode]
    );

    return (
        <Box className="component-content-root">
            <div className="project-tree-fill" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                {/* MAPS */}
                <TreeNode
                    label="Maps"
                    isTopLevel
                    expanded={!!expandedMap["Maps"]}
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
                                key={mapObj.id || mapObj.name || idx}
                                label={mapObj.name}
                                parentLabel="Maps"
                                canDelete
                                onDelete={() => onDeleteNode?.("maps", [idx], mapObj.name)}
                                onRename={(newName: string) => onRenameNode?.("maps", [idx], newName)}
                                expanded={!!expandedMap[makePath("Maps", mapObj.name)]}
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
                    expanded={!!expandedMap["Data"]}
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
                                expanded={!!expandedMap[makePath("Data", parameter)]}
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
                                        key={item.__tempKey || `${item.name}-${idx}`}
                                        label={item.name}
                                        type={parameter}
                                        section="data"
                                        dataset={item}
                                        onSaveAs={(newName: string, newDesc?: string) =>
                                            handleSaveAs("data", [parameter, idx], newName, newDesc, item)
                                        }
                                        description={item.description}
                                        onRename={(newName: string) => onRenameNode?.("data", [parameter, idx], newName)}
                                        canDelete
                                        onDelete={() => onDeleteNode?.("data", [parameter, idx], item.name)}
                                        expanded={!!expandedMap[makePath("Data", parameter, item.name)]}
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
                    expanded={!!expandedMap["Analysis"]}
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
                                expanded={!!expandedMap[makePath("Analysis", folder)]}
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
                                            key={`${item.name}-${idx}`}
                                            label={item.name}
                                            parentLabel={folder}
                                            onSaveAs={(newName: string, newDesc?: string) =>
                                                handleSaveAs("analyses", [folder, idx], newName, newDesc, item)
                                            }
                                            type={folder}
                                            section="analysis"
                                            description={item.description}
                                            onRename={(newName: string) => onRenameNode?.("analyses", [folder, idx], newName)}
                                            canDelete
                                            onDelete={() => onDeleteNode?.("analyses", [folder, idx], item.name)}
                                            expanded={!!expandedMap[makePath("Analysis", folder, item.name)]}
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
                                        />
                                    ))
                                ) : (
                                    <Text size="xs" className="tree-label">
                                        No analyses
                                    </Text>
                                )}
                            </TreeNode>
                        ))
                    ) : (
                        <Text size="xs" className="tree-label">
                            No analyses
                        </Text>
                    )}
                </TreeNode>
            </div>
        </Box>
    );
}
