export type ProjectMeta = {
    projectName: string;
    directory: string;
};

export function openProjectSession(meta: ProjectMeta): void {
    try {
        localStorage.setItem("lastProject", meta.projectName);
        localStorage.setItem("lastProjectDir", meta.directory);
    } catch {}
    try {
        window.electronAPI?.setProjectMenuState?.(true);
    } catch {}
}

export function closeProjectSession(): void {
    try {
        localStorage.removeItem("lastProject");
        localStorage.removeItem("lastProjectDir");
    } catch {}
    try {
        window.electronAPI?.setProjectMenuState?.(false);
    } catch {}
}

export function isProjectOpen(): boolean {
    try {
        return !!localStorage.getItem("lastProject");
    } catch {
        return false;
    }
}
