import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext<{ apiPrefix: string | null } | null>(null);

const isElectron = () =>
    typeof window !== 'undefined' && !!(window as any).electronAPI;

export const ProjectProvider = ({ children, projectName }: { children: React.ReactNode, projectName: string }) => {
    const [apiPrefix, setApiPrefix] = useState<string | null>(null);

    useEffect(() => {
        if (!projectName) return;
        const base = isElectron() ? 'http://localhost:5001' : '';
        setApiPrefix(`${base}/api/${encodeURIComponent(projectName)}`);
    }, [projectName]);

    return (
        <ProjectContext.Provider value={{ apiPrefix }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProject must be used within a ProjectProvider");
    }
    return context;
};
