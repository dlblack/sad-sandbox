import { useParams } from "react-router-dom";
import App from "../App";
import { ProjectProvider } from "../context/ProjectContext";

function ProjectShell() {
    const { projectName } = useParams();

    return (
        <ProjectProvider projectName={projectName!}>
            <App />
        </ProjectProvider>
    );
}

export default ProjectShell;
