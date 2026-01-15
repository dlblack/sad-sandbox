import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchProjectMetadata, coerceUnitSystem, type ProjectMetadata } from "../api/projectMetadata";
import type { UnitSystem } from "../units/types";

export type ProjectContextValue = {
  apiPrefix: string | null;
  unitSystem: UnitSystem;
  metadata: ProjectMetadata | null;
  metadataLoading: boolean;
  refreshMetadata: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

const isElectron = () => typeof window !== "undefined" && !!(window as any).electronAPI;

export function ProjectProvider(props: { children: React.ReactNode; projectName: string }) {
  const [apiPrefix, setApiPrefix] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("US");
  const [metadataLoading, setMetadataLoading] = useState(false);

  useEffect(() => {
    if (!props.projectName) return;
    const base = isElectron() ? "http://localhost:5001" : "";
    setApiPrefix(`${base}/api/${encodeURIComponent(props.projectName)}`);
  }, [props.projectName]);

  const refreshMetadata = useCallback(async () => {
    if (!apiPrefix) return;
    setMetadataLoading(true);
    try {
      const meta = await fetchProjectMetadata(apiPrefix);
      setMetadata(meta);
      setUnitSystem(coerceUnitSystem(meta.unitSystem, "US"));
    } catch (err) {
      console.error("Failed to fetch project metadata:", err);
      setMetadata(null);
      setUnitSystem("US");
    } finally {
      setMetadataLoading(false);
    }
  }, [apiPrefix]);

  useEffect(() => {
    void refreshMetadata();
  }, [refreshMetadata]);

  const value = useMemo<ProjectContextValue>(
    () => ({ apiPrefix, unitSystem, metadata, metadataLoading, refreshMetadata }),
    [apiPrefix, unitSystem, metadata, metadataLoading, refreshMetadata]
  );

  return <ProjectContext.Provider value={value}>{props.children}</ProjectContext.Provider>;
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
