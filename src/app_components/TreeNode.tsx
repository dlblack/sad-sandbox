import React, { useEffect, useRef } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { Box, Group, Text, Paper, TextInput, Image, Stack, Divider } from "@mantine/core";
import SaveAsDialog from "../dialogs/SaveAsDialog";
import { TextStore } from "../utils/TextStore";

const dssIcon = "/assets/images/dss.gif";

/* --------------------------------- Types --------------------------------- */

type ContextMenuState = {
    x: number;
    y: number;
    path: string;
} | null;

export interface TreeNodeProps {
    label: string;
    children?: React.ReactNode;
    isTopLevel?: boolean;

    onSaveAs?: (newName: string, newDesc?: string) => void;
    type?: string;
    section?: "data" | "analysis" | (string & {});
    description?: string;
    onRename?: (newName: string) => void;
    onDelete?: () => void;
    canDelete?: boolean;

    parentLabel?: string;

    expanded?: boolean;
    onToggle?: (path: string) => void;
    path: string;

    menu?: ContextMenuState;
    setMenu?: (m: ContextMenuState) => void;

    renaming?: string | null;
    setRenaming?: (path: string | null) => void;

    renameValue?: string;
    setRenameValue?: (v: string) => void;

    saveAsDialogOpen?: string | null;
    setSaveAsDialogOpen?: (path: string | null) => void;

    dataset?: unknown;
}

/* -------------------------------- Helpers -------------------------------- */

function hasRealChildren(children: React.ReactNode): boolean {
    if (!children) return false;
    const arr = React.Children.toArray(children);
    const noAnalysesText = TextStore.interface("Tree_NoAnalyses");
    return arr.some((child) => {
        if (React.isValidElement(child)) {
            const label = (child.props as any)?.label;
            if (label && label !== noAnalysesText) return true;
            return true;
        }
        return Boolean(child);
    });
}

function getNodeBadgeOrIcon(
    parentLabel: string | undefined,
    isLeaf: boolean,
    section: TreeNodeProps["section"]
): React.ReactNode {
    if (isLeaf && section === "data") {
        return (
            <Image
                src={dssIcon}
                alt={TextStore.interface("Tree_Alt_DataIcon")}
                w={14}
                h={14}
                fit="contain"
            />
        );
    }
    if (isLeaf && section === "analysis") {
        const b17Label = TextStore.interface("ComponentMetadata_Wizard_Bulletin17AnalysisWizard");
        const ftcLabel = TextStore.interface("ComponentMetadata_Wizard_FloodTypeClassAnalysisWizard");
        const pffLabel = TextStore.interface("ComponentMetadata_Wizard_PeakFlowFreqWizard");

        if (parentLabel === b17Label) {
            return (
                <Paper
                    shadow="none"
                    withBorder={false}
                    p={0}
                    radius="xs"
                    style={{
                        fontSize: 10,
                        paddingInline: 6,
                        paddingBlock: 2,
                        background: "#3b82f6",
                        color: "white",
                    }}
                >
                    B17
                </Paper>
            );
        }
        if (parentLabel === ftcLabel) {
            return (
                <Paper
                    shadow="none"
                    withBorder={false}
                    p={0}
                    radius="xs"
                    style={{
                        fontSize: 10,
                        paddingInline: 6,
                        paddingBlock: 2,
                        background: "#fdbb84",
                        color: "white",
                    }}
                >
                    FTC
                </Paper>
            );
        }
        if (parentLabel === pffLabel) {
            return (
                <Paper
                    shadow="none"
                    withBorder={false}
                    p={0}
                    radius="xs"
                    style={{
                        fontSize: 10,
                        paddingInline: 6,
                        paddingBlock: 2,
                        background: "#10b981",
                        color: "white",
                    }}
                >
                    PFF
                </Paper>
            );
        }
    }
    return null;
}

function MenuItem({
                      children,
                      onClick,
                      disabled,
                  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <Box
            onClick={disabled ? undefined : onClick}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            style={{
                fontSize: 12,
                padding: "6px 10px",
                color: disabled ? "rgba(255,255,255,0.4)" : "inherit",
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
            }}
            onMouseEnter={(e) => {
                if (disabled) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
            }}
        >
            {children}
        </Box>
    );
}

/* ------------------------------- Component -------------------------------- */

const TreeNode: React.FC<TreeNodeProps> = ({
                                               label,
                                               children,
                                               isTopLevel = false,
                                               onSaveAs,
                                               type,
                                               section,
                                               description,
                                               onRename,
                                               onDelete,
                                               canDelete = false,
                                               parentLabel,
                                               expanded,
                                               onToggle,
                                               path,
                                               menu,
                                               setMenu,
                                               renaming,
                                               setRenaming,
                                               renameValue = "",
                                               setRenameValue,
                                               saveAsDialogOpen,
                                               setSaveAsDialogOpen,
                                               dataset,
                                           }) => {
    const hasContent = hasRealChildren(children);
    const isLeaf = !hasContent;
    const isBottomLevel = isLeaf && canDelete;
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setMenu?.(null);
        };
        if (menu) document.addEventListener("click", handle);
        return () => document.removeEventListener("click", handle);
    }, [menu, setMenu]);

    const handleContextMenu = (e: React.MouseEvent) => {
        if (!isBottomLevel) return;
        e.preventDefault();
        setMenu?.({ x: e.clientX, y: e.clientY, path });
    };

    const handleSaveAs = () => {
        setMenu?.(null);
        setSaveAsDialogOpen?.(path);
    };

    const handleSaveAsConfirm = (newName: string, newDesc?: string) => {
        setSaveAsDialogOpen?.(null);
        onSaveAs?.(newName, newDesc);
    };

    const handleSaveAsCancel = () => setSaveAsDialogOpen?.(null);

    const handleRename = () => {
        setMenu?.(null);
        setRenaming?.(path);
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRenaming?.(null);
        if (renameValue !== label && onRename) {
            onRename(renameValue);
        }
    };

    const handleRenameBlur = () => setRenaming?.(null);

    const handleDelete = () => {
        setMenu?.(null);
        onDelete?.();
    };

    const handlePlot = () => {
        setMenu?.(null);
        if (section === "data" && dataset) {
            window.dispatchEvent(new CustomEvent("plotNodeData", { detail: { dataset } }));
        }
    };

    const badge = getNodeBadgeOrIcon(parentLabel, isLeaf, section);

    return (
        <Box ref={ref} style={{ paddingInline: 8, paddingBlock: isTopLevel ? 6 : 2 }}>
            <Group wrap="nowrap" gap={6} align="center" onContextMenu={handleContextMenu}>
                {hasContent ? (
                    expanded ? <FaFolderOpen color="#f6b73c" /> : <FaFolder color="#f6b73c" />
                ) : null}

                {badge}

                {renaming === path ? (
                    <form onSubmit={handleRenameSubmit}>
                        <TextInput
                            size="xs"
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue?.(e.target.value)}
                            onBlur={handleRenameBlur}
                            styles={{ input: { width: 180, paddingBlock: 4, paddingInline: 6 } }}
                        />
                    </form>
                ) : (
                    <Text
                        onClick={hasContent ? () => onToggle?.(path) : undefined}
                        style={{ cursor: hasContent ? "pointer" : "default", userSelect: "none" }}
                    >
                        {label}
                    </Text>
                )}
            </Group>

            {menu && menu.path === path && isBottomLevel && (
                <Paper
                    shadow="md"
                    withBorder
                    radius="xs"
                    p={0}
                    style={{
                        position: "fixed",
                        top: menu.y,
                        left: menu.x,
                        zIndex: 1000,
                        width: "auto",
                        minWidth: 120,
                        maxWidth: 260,
                        overflow: "hidden",
                    }}
                >
                    <Stack gap={0} style={{ fontSize: 12, lineHeight: 1.25 }}>
                        <MenuItem onClick={handleSaveAs}>{TextStore.interface("Tree_Menu_SaveAs")}</MenuItem>
                        <Divider opacity={0.08} />
                        <MenuItem onClick={handleRename}>{TextStore.interface("Tree_Menu_Rename")}</MenuItem>
                        <Divider opacity={0.08} />
                        <MenuItem onClick={handleDelete} disabled={!canDelete}>
                            {TextStore.interface("Tree_Menu_Delete")}
                        </MenuItem>
                        {section === "data" && (
                            <>
                                <Divider opacity={0.08} />
                                <MenuItem onClick={handlePlot}>{TextStore.interface("Tree_Menu_Plot")}</MenuItem>
                            </>
                        )}
                    </Stack>
                </Paper>
            )}

            {saveAsDialogOpen === path && isBottomLevel && (
                <SaveAsDialog
                    type={type}
                    oldName={label}
                    oldDescription={description}
                    onConfirm={handleSaveAsConfirm}
                    onCancel={handleSaveAsCancel}
                />
            )}

            {expanded && hasContent && <Box style={{ paddingLeft: 18, marginTop: 4 }}>{children}</Box>}
        </Box>
    );
};

TreeNode.displayName = "TreeNode";

export default TreeNode;
