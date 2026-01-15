import React from "react";
import { useParams } from "react-router-dom";
import App from "../App";
import { ProjectProvider, useProject } from "../context/ProjectContext";
import { UnitsProvider } from "../context/UnitsContext";

function ProjectUnitsBoundary({ children }: { children: React.ReactNode }) {
  const { unitSystem } = useProject();
  return <UnitsProvider unitSystem={unitSystem}>{children}</UnitsProvider>;
}

function ProjectShell() {
  const { projectName } = useParams();

  return (
    <ProjectProvider projectName={projectName!}>
      <ProjectUnitsBoundary>
        <App />
      </ProjectUnitsBoundary>
    </ProjectProvider>
  );
}

export default ProjectShell;
