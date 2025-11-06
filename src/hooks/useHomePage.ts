import { useEffect, useMemo, useState } from "react";
import TextStore from "../utils/TextStore";
import { fetchRecent, type RecentProject } from "../api/recentProjects";
import useProjectOpener from "./useProjectOpener";
import useFolderPicker from "./useFolderPicker";
import useNeptuneProjectPicker from "./useNeptuneProjectPicker";

type UnitSystem = "US" | "SI";

export default function useHomePage() {
    const [projectName, setProjectName] = useState("");
    const [directory, setDirectory] = useState("");
    const [unitSystem, setUnitSystem] = useState<UnitSystem>("US");
    const [activeTab, setActiveTab] = useState<string>("open");
    const [recent, setRecent] = useState<RecentProject[]>([]);

    useEffect(() => { fetchRecent().then(setRecent); }, []);

    const canCreate = useMemo(() => projectName.trim() && directory.trim(), [projectName, directory]);
    const bumpAndNavigate = useProjectOpener(setRecent);

    const {
        browse: handleDirectorySelect,
        fallbackRef: folderInputRef,
        onFallbackChange: onDirectoryPickedFromInput
    } = useFolderPicker(setDirectory);

    const { browseProjectFile, onPickedFromInput } =
        useNeptuneProjectPicker(bumpAndNavigate);

    const handleCreateProject = async () => {
        if (!canCreate) {
            alert(TextStore.alert("HomePage_MissingNameOrDirectory"));
            return;
        }
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectName,
                    directory,
                    unitSystem,
                    created_at: new Date().toISOString(),
                    last_modified: new Date().toISOString(),
                }),
            });
            const data = await res.json();
            if (data?.success) {
                await bumpAndNavigate({ projectName, directory: data.directory });
            } else {
                alert(data?.error || "Failed to create project.");
            }
        } catch {
            alert("Failed to create project.");
        }
    };

    return {
        state: { projectName, directory, unitSystem, activeTab, recent },
        setProjectName,
        setDirectory,
        setUnitSystem,
        setActiveTab,
        canCreate,
        handleCreateProject,
        handleDirectorySelect,
        onDirectoryPickedFromInput,
        folderInputRef,
        handleOpenProject: async (fallback?: HTMLInputElement | null) => {
            const ok = await browseProjectFile();
            if (ok === null && fallback) fallback.click();
        },
        onProjectFilePicked: onPickedFromInput,

        openRecent: async (p: RecentProject) => bumpAndNavigate(p),
    };
}
