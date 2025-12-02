import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "../context/ProjectContext";
import { getComponentLabel, getComponentRegistryEntry } from "../registry/componentRegistry";
import type {
  MapItem,
  DataRecord,
  AnalysesRecord,
  DeleteArgs,
  SaveAsArgs,
  RenameArgs, DataItem,
} from "../types/appData";
import {
  fetchAnalyses,
  fetchData,
  createAnalysis,
  saveDataEntry,
  saveDuplicateEntry,
  deleteDataItem,
  deleteAnalysisItem,
  renameAnalysisOnServer,
  renameDataOnServer,
} from "../api/appDataApi";
import { logSilentError } from "../utils/logSilentError";

/** Helpers */
function groupAnalysesByType(payload: any = {}): AnalysesRecord {
  return payload;
}

export function useAppData() {
  const { apiPrefix } = useProject() as any;
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [data, setData] = useState<DataRecord>({});
  const [analyses, setAnalyses] = useState<AnalysesRecord>({});
  const pollRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  const getLocalName = useCallback(
      (args: DeleteArgs): string | null => {
        if (args.section === "maps") {
          const [idx] = args.pathArr;
          const list = Array.isArray(maps) ? maps : [];
          const item = list[idx];
          return item?.name ?? null;
        }
        if (args.section === "data") {
          const [type, idx] = args.pathArr;
          const list = Array.isArray(data[type]) ? data[type] : [];
          const item = list[idx];
          return item?.name ?? null;
        }
        if (args.section === "analyses") {
          const [type, idx] = args.pathArr;
          const list = Array.isArray(analyses[type]) ? analyses[type] : [];
          const item = list[idx];
          return item?.name ?? null;
        }
        return null;
      },
      [maps, data, analyses]
  );

  const refreshAll = useCallback(async () => {
    if (!apiPrefix) {
      return;
    }

    try {
      const [analysesResult, dataResult] = await Promise.all([
        fetchAnalyses(apiPrefix).catch(() => ({} as AnalysesRecord)),
        fetchData(apiPrefix).catch(() => ({} as DataRecord)),
      ]);
      setAnalyses(groupAnalysesByType(analysesResult));
      setData(dataResult);
    } catch (err) {
      logSilentError(err);
    }
  }, [apiPrefix]);

  useEffect(() => {
    if (!apiPrefix) {
      return;
    }

    mountedRef.current = true;
    void refreshAll();
    return () => {
      mountedRef.current = false;
    };
  }, [apiPrefix, refreshAll]);

  // light polling so external edits are reflected
  useEffect(() => {
    if (!apiPrefix) return;
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      if (mountedRef.current) {
        void refreshAll();
      }
    }, 1500) as unknown as number;
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [apiPrefix, refreshAll]);

  /** Delete */
  async function handleDeleteNode(args: DeleteArgs): Promise<string | null> {
    if (typeof args !== "object" || args === null) return null;
    const localName = getLocalName(args);

    if (args.section === "maps") {
      const [idx] = args.pathArr;
      setMaps((prev) =>
          Array.isArray(prev) ? prev.filter((_item, index) => index !== idx) : prev
      );
      return localName ?? null;
    }

    if (!apiPrefix) return localName ?? null;

    try {
      if (args.section === "data") {
        const [type, idx] = args.pathArr;
        const list = Array.isArray(data[type]) ? data[type] : [];
        const src = list[idx];
        const name = src?.name || localName || null;
        const resp = await deleteDataItem(apiPrefix, type, idx, name);
        await refreshAll();
        return resp?.deletedName || localName || null;
      }

      if (args.section === "analyses") {
        const [type, idx] = args.pathArr;
        const list = Array.isArray(analyses[type]) ? analyses[type] : [];
        const src = list[idx];
        const name = src?.name || localName || null;
        const resp = await deleteAnalysisItem(apiPrefix, type, idx, name);
        await refreshAll();
        return resp?.deletedName || localName || null;
      }
    } catch (err) {
      console.error("Delete failed:", err);
      await refreshAll();
      return localName ?? null;
    }
    return localName ?? null;
  }

  /** Save As (duplicate) */
  async function handleSaveAsNode(args: SaveAsArgs) {
    if (typeof args !== "object" || args === null) return;
    const { section, pathArr, newName, newDesc, item } = args;
    if (!newName || !apiPrefix) return;

    if (section === "data" || section === "analyses") {
      const [type, idx] = pathArr;

      const setFn = section === "data" ? setData : setAnalyses;

      setFn((prev: any) => {
        const next = { ...prev };
        const list = Array.isArray(next[type]) ? next[type] : [];
        const src = list[idx];
        if (!src) return prev;
        const copy = {
          ...src,
          name: newName,
          description: newDesc ?? src.description,
        };
        next[type] = [...list, copy];
        return next;
      });

      try {
        const payload = {
          ...(item || {}),
          name: newName,
          description: newDesc ?? item?.description,
        };
        await saveDuplicateEntry(apiPrefix, section, type, payload);
        await refreshAll();
      } catch (err) {
        logSilentError(err, "handleSaveAsNode");
      }
      return;
    }

    if (section === "maps") {
      const [idx] = pathArr;
      setMaps(prev => {
        const list = Array.isArray(prev) ? prev : [];
        const src = list[idx];
        if (!src) return prev;
        const copy = {
          ...src,
          name: newName,
          description: newDesc ?? src.description,
        };
        return [...list, copy];
      });
    }
  }

  /** Rename */
  async function handleRenameNode(args: RenameArgs) {
    if (typeof args !== "object" || args === null) return;

    const { section, pathArr, newName } = args;
    if (!newName || !apiPrefix) return;

    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const list = Array.isArray(analyses[folder]) ? analyses[folder] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      try {
        await renameAnalysisOnServer(apiPrefix, folder, src, newName);
        await refreshAll();
      } catch (e) {
        console.error("Rename analyses failed:", e);
      }
      return;
    }

    if (section === "data") {
      const [param, idx] = pathArr;
      const list = Array.isArray(data[param]) ? data[param] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      try {
        await renameDataOnServer(apiPrefix, param, src, newName);
        await refreshAll();
      } catch (e) {
        console.error("Rename data failed:", e);
      }
      return;
    }

    if (section === "maps") {
      const [idx] = pathArr;
      setMaps(prev => {
        const list = Array.isArray(prev) ? prev : [];
        if (!list[idx]) return prev;
        const next = [...list];
        next[idx] = { ...next[idx], name: newName };
        return next;
      });
    }
  }

  /** Wizards and Data Save */
  const handleWizardFinish = async (type: string, valuesObj: any) => {
    if (!apiPrefix) {
      return;
    }

    getComponentRegistryEntry(type);
    const friendlyType = getComponentLabel(type);

    try {
      await createAnalysis(apiPrefix, friendlyType, valuesObj);
      await refreshAll();
    } catch (err) {
      logSilentError(err);
    }
  };

  const handleDataSave = async (category: string, valuesObj: DataItem) => {
    if (!apiPrefix) {
      return;
    }

    if (!valuesObj || !category) {
      throw new Error("Missing category or data");
    }

    const payload: any = { ...valuesObj };

    const isDssPaired =
        payload.dataFormat === "DSS" &&
        payload.structureType === "PairedData";

    if (isDssPaired) {
      const existingList = Array.isArray((data as any)[category])
          ? (data as any)[category]
          : [];

      const existing = existingList.find(
          (it: any) =>
              it &&
              it.dataFormat === "DSS" &&
              it.structureType === "PairedData" &&
              typeof it.filepath === "string" &&
              it.filepath.length > 0
      );

      // Always reuse the existing DSS filepath if one exists for this category
      if (existing) {
        payload.filepath = existing.filepath;
      }
    }

    try {
      await saveDataEntry(apiPrefix, category, payload);
      await refreshAll();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  function clearAll() {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setMaps([]);
    setData({});
    setAnalyses({});
  }

  /** Return */
  return {
    maps,
    setMaps,
    data,
    setData,
    analyses,
    setAnalyses,
    handleSaveAsNode,
    handleRenameNode,
    handleDeleteNode,
    handleWizardFinish,
    handleDataSave,
    clearAll,
  };
}
