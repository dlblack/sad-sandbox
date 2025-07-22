import React, { useContext, useEffect, useState, useCallback } from "react";
import TreeNode from "./TreeNode";
import { StyleContext } from "../styles/StyleContext";

function usePersistentState(key, initial) {
    const [val, setVal] = React.useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initial;
        } catch {
            return initial;
        }
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(val));
    }, [key, val]);
    return [val, setVal];
}

function makePath(...args) {
    return args.filter(Boolean).join("/");
}

function ComponentContent({
                              analyses = {},
                              data = {},
                              maps = [],
                              onSaveAsNode,
                              onRenameNode,
                              onDeleteNode,
                              handleOpenComponent,
                          }) {
    const { style } = useContext(StyleContext);

    const [expandedMap, setExpandedMap] = usePersistentState("tree-expandedMap", {});
    const [menu, setMenu] = useState(null);
    const [renaming, setRenaming] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(null);

    // Plot listener
    useEffect(() => {
        const listener = (e) => {
            const { dataset } = e.detail;
            if (!dataset || typeof handleOpenComponent !== "function") return;

            if (dataset.structureType === "TimeSeries") {
                handleOpenComponent("TimeSeriesPlot", { dataset });
            } else if (dataset.structureType === "PairedData") {
                handleOpenComponent("PairedDataPlot", { dataset });
            }
        };

        window.addEventListener("plotNodeData", listener);
        return () => window.removeEventListener("plotNodeData", listener);
    }, [handleOpenComponent]);

    const handleToggle = useCallback(
        (path) => setExpandedMap((map) => ({ ...map, [path]: !map[path] })),
        []
    );

    return (
        <div className={`component-content-root component-content-card${style}`}>

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
                            canDelete={true}
                            onDelete={() => onDeleteNode("maps", [idx])}
                            onRename={(newName) => onRenameNode("maps", [idx], newName)}
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
                    <div className="tree-label">(No maps)</div>
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
                                    onSaveAs={(newName, newDesc) =>
                                        onSaveAsNode("data", [parameter, idx], newName, newDesc, item)
                                    }
                                    description={item.description}
                                    onRename={(newName) =>
                                        onRenameNode("data", [parameter, idx], newName)
                                    }
                                    canDelete={true}
                                    onDelete={() => onDeleteNode("data", [parameter, idx])}
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
                    <div className="tree-label">No data</div>
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
                                        onSaveAs={(newName, newDesc) =>
                                            onSaveAsNode("analyses", [folder, idx], newName, newDesc, item)
                                        }
                                        type={folder}
                                        section="analysis"
                                        description={item.description}
                                        onRename={(newName) =>
                                            onRenameNode("analyses", [folder, idx], newName)
                                        }
                                        canDelete={true}
                                        onDelete={() => onDeleteNode("analyses", [folder, idx])}
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
                                <div className="tree-label">No analyses</div>
                            )}
                        </TreeNode>
                    ))
                ) : (
                    <div className="tree-label">No analyses</div>
                )}
            </TreeNode>
        </div>
    );
}

export default ComponentContent;
