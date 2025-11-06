import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, TextInput, Group, Select } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolderOpen } from "@tabler/icons-react";
import TextStore from "../utils/TextStore";
import { registerFileMenu } from "../utils/fileMenuBus";
import useProjectOpener from "../hooks/useProjectOpener";
import useFolderPicker from "../hooks/useFolderPicker";
import useNeptuneProjectPicker from "../hooks/useNeptuneProjectPicker";
import { fetchRecent, type RecentProject } from "../api/recentProjects";
import { closeProjectSession } from "../utils/projectSession";
import { useNavigate } from "react-router-dom";

type UnitSystem = "US" | "SI";

export default function GlobalFileModals() {
    // New / Open modal state
    const [openedNew, newCtrls] = useDisclosure(false);
    const [openedOpen, openCtrls] = useDisclosure(false);

    // New Project form state
    const [projectName, setProjectName] = useState("");
    const [projectDirectory, setProjectDirectory] = useState("");
    const [unitSystem, setUnitSystem] = useState<UnitSystem>("US");

    // Recents used in the Open modal (optional)
    const [recent, setRecent] = useState<RecentProject[]>([]);
    useEffect(() => { fetchRecent().then(setRecent).catch(() => {}); }, []);

    const navigate = useNavigate();
    const bumpAndNavigate = useProjectOpener(setRecent);

    // Folder picker (for New modal)
    const {
        browse: handleBrowseFolder,
        fallbackRef: folderInputRef,
        onFallbackChange: onDirectoryPickedFromInput,
    } = useFolderPicker(setProjectDirectory);

    // Neptune file picker (for Open modal)
    const {
        browseProjectFile,
        onPickedFromInput,
    } = useNeptuneProjectPicker(bumpAndNavigate);

    const projectFileInputRef = useRef<HTMLInputElement | null>(null);

    // Create project
    const canCreate = useMemo(
        () => projectName.trim() && projectDirectory.trim(),
        [projectName, projectDirectory]
    );

    const handleCreateProject = async () => {
        if (!canCreate) {
            alert(TextStore.alert("Navbar_File_New_RequireNameDir") || "Project name and directory are required.");
            return;
        }
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectName,
                    directory: projectDirectory,
                    unitSystem,
                    created_at: new Date().toISOString(),
                    last_modified: new Date().toISOString(),
                }),
            });
            const data = await res.json();
            if (data?.success) {
                const meta = { projectName, directory: data.directory as string };
                await bumpAndNavigate(meta);
                newCtrls.close();
            } else {
                alert(data?.error || "Failed to create project");
            }
        } catch {
            alert("Failed to create project");
        }
    };

    // Register handlers so Electron menu can open/close these
    useEffect(() => {
        registerFileMenu({
            openNew: () => newCtrls.open(),
            openOpen: () => openCtrls.open(),
            closeProject: () => {
                try { closeProjectSession(); } catch {}
                navigate("/");
            },
        });
    }, [navigate, newCtrls, openCtrls]);

    return (
        <>
            {/* Hidden fallbacks for pickers */}
            <input
                ref={folderInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={onDirectoryPickedFromInput}
                style={{ display: "none" }}
            />
            <input
                ref={projectFileInputRef}
                type="file"
                accept=".neptune,application/x-neptune"
                onChange={onPickedFromInput}
                style={{ display: "none" }}
            />

            {/* New Project Modal */}
            <Modal opened={openedNew} onClose={newCtrls.close} title={TextStore.interface("Navbar_File_New_L")}>
                <TextInput
                    label={TextStore.interface("Navbar_File_New_ProjectName")}
                    placeholder={TextStore.interface("Navbar_File_New_ProjectName_D")}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
                <Group mt="md" align="flex-end">
                    <TextInput
                        label={TextStore.interface("Navbar_File_New_DirectoryLocation")}
                        placeholder={TextStore.interface("Navbar_File_New_DirectoryLocation_D")}
                        value={projectDirectory}
                        onChange={(e) => setProjectDirectory(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    <Button onClick={handleBrowseFolder} variant="outline" p={6} radius="sm" aria-label="Browse folder">
                        <IconFolderOpen size={18} />
                    </Button>
                </Group>
                <Select
                    mt="md"
                    label={TextStore.interface("Navbar_File_New_UnitSystem") || "Unit system"}
                    data={[
                        { value: "US", label: "U.S. Customary" },
                        { value: "SI", label: "SI" },
                    ]}
                    value={unitSystem}
                    onChange={(v) => setUnitSystem((v as UnitSystem) || "US")}
                    allowDeselect={false}
                    checkIconPosition="right"
                />
                <Group mt="md">
                    <Button onClick={handleCreateProject} disabled={!canCreate}>Create</Button>
                    <Button variant="outline" onClick={newCtrls.close}>Cancel</Button>
                </Group>
            </Modal>

            {/* Open Project Modal */}
            <Modal opened={openedOpen} onClose={openCtrls.close} title={TextStore.interface("Navbar_File_Open")}>
                <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 8, marginBottom: 8 }}>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            const ok = await browseProjectFile();
                            if (ok) openCtrls.close();
                            if (ok === null) projectFileInputRef.current?.click();
                        }}
                        style={{ width: 260 }}
                    >
                        {TextStore.interface("HomePage_ButtonBrowseForProject") || "Browse for Project"}
                    </Button>
                </div>

                {/* Recent list */}
                <div style={{ marginTop: 8 }}>
                    {recent.map((p, i) => (
                        <div key={`${p.projectName}-${i}`}>
                            <Button
                                variant="subtle"
                                onClick={async () => {
                                    await bumpAndNavigate(p);
                                    openCtrls.close();
                                }}
                            >
                                {p.projectName} {p.directory}
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
}
