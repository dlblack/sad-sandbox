export type RecentProject = { projectName: string; directory: string };

export async function fetchRecent(): Promise<RecentProject[]> {
    try {
        const res = await fetch("/api/recentProjects");
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export async function postRecent(item: RecentProject): Promise<RecentProject[]> {
    try {
        const res = await fetch("/api/recentProjects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}
