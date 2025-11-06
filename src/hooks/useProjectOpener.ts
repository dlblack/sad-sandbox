import { useNavigate } from "react-router-dom";
import { postRecent, type RecentProject } from "../api/recentProjects";
import { openProjectSession } from "../utils/projectSession";

export default function useProjectOpener(setRecent?: (r: RecentProject[]) => void) {
    const navigate = useNavigate();

    return async (meta: RecentProject) => {
        openProjectSession({ projectName: meta.projectName, directory: meta.directory });

        const updated = await postRecent(meta);
        if (setRecent && updated.length) setRecent(updated);

        navigate(`/project/${meta.projectName}`);
    };
}
