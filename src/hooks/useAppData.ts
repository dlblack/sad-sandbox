import { useCallback, useEffect, useRef, useState } from "react";
import { useProject } from "../context/ProjectContext";
import { getComponentLabel, getComponentRegistryEntry } from "../registry/componentRegistry";
import { logSilentError } from "../utils/logSilentError";

/** ----------------------- Types ----------------------- */
type MapsSection = "maps";
type DataSection = "data";
type AnalysesSection = "analyses";
type DataRecord = Record<string, any[]>;
type AnalysesRecord = Record<string, any[]>;

type DeleteArgs =
    | { section: MapsSection; pathArr: [number] }
    | { section: DataSection; pathArr: [string, number] }
    | { section: AnalysesSection; pathArr: [string, number] };

type SaveAsArgs =
    | {
  section: MapsSection;
  pathArr: [number];
  newName: string;
  newDesc?: string;
  item?: any;
}
    | {
  section: DataSection;
  pathArr: [string, number];
  newName: string;
  newDesc?: string;
  item?: any;
}
    | {
  section: AnalysesSection;
  pathArr: [string, number];
  newName: string;
  newDesc?: string;
  item?: any;
};

type RenameArgs =
    | { section: MapsSection; pathArr: [number]; newName: string }
    | { section: DataSection; pathArr: [string, number]; newName: string }
    | { section: AnalysesSection; pathArr: [string, number]; newName: string };

/** ----------------------- Helpers ----------------------- */
function groupAnalysesByType(payload: any = {}): AnalysesRecord {
  return payload;
}

async function safeJson<T>(res: Response): Promise<T> {
  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} ${raw ? raw : ""}`.trim());
  }
  const parsed = raw ? JSON.parse(raw) : {};
  return parsed as T;
}

async function getJSON<T>(url: string): Promise<T> {
  return safeJson<T>(await fetch(url));
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  return safeJson<T>(
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
  );
}

async function delJSON<T = any>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} ${raw ? raw : ""}`.trim());
  }
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed as T;
  } catch {
    return {} as T;
  }
}

// Always append ?dir=<absolute path> to API URLs
function withDir(url: string): string {
  const dir = localStorage.getItem("lastProjectDir") || "";
  return dir
      ? `${url}${url.includes("?") ? "&" : "?"}dir=${encodeURIComponent(dir)}`
      : url;
}

export function useAppData() {
  const { apiPrefix } = useProject() as any;
  const [maps, setMaps] = useState<any[]>([]);
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
      const aUrl = withDir(`${apiPrefix}/analyses`);
      const dUrl = withDir(`${apiPrefix}/data`);
      const [a, d] = await Promise.all([
        getJSON<AnalysesRecord>(aUrl).catch(() => ({} as AnalysesRecord)),
        getJSON<DataRecord>(dUrl).catch(() => ({} as DataRecord)),
      ]);
      setAnalyses(groupAnalysesByType(a));
      setData(d);
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

  /** ----------------------- Delete ----------------------- */
  async function handleDeleteNode(args: DeleteArgs): Promise<string | null> {
    if (typeof args !== "object" || args === null) return null;
    const localName = getLocalName(args);

    if (args.section === "maps") {
      const [idx] = args.pathArr;
      setMaps((prev) =>
          Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : prev
      );
      return localName ?? null;
    }

    if (!apiPrefix) return localName ?? null;

    try {
      if (args.section === "data") {
        const [type, idx] = args.pathArr;
        const list = Array.isArray(data[type]) ? data[type] : [];
        const src = list[idx];
        const url = withDir(
            `${apiPrefix}/data/${encodeURIComponent(type)}/${idx}`
        );
        const resp = await delJSON<{ success: boolean; deletedName?: string }>(
            url,
            {name: src?.name || localName || null}
        );
        await refreshAll();
        return resp?.deletedName || localName || null;
      }

      if (args.section === "analyses") {
        const [type, idx] = args.pathArr;
        const list = Array.isArray(analyses[type]) ? analyses[type] : [];
        const src = list[idx];
        const url = withDir(
            `${apiPrefix}/analyses/${encodeURIComponent(type)}/${idx}`
        );
        const resp = await delJSON<{ success: boolean; deletedName?: string }>(
            url,
            {name: src?.name || localName || null}
        );
        await refreshAll();
        return resp?.deletedName || localName || null;
      }
    } catch {
      await refreshAll();
      return localName ?? null;
    }
    return localName ?? null;
  }

  /** ----------------------- Save As (duplicate) ----------------------- */
  async function handleSaveAsNode(args: SaveAsArgs) {
    if (typeof args !== "object" || args === null) return;
    const { section, pathArr, newName, newDesc, item } = args;
    if (!newName || !apiPrefix) return;

    if (section === "data" || section === "analyses") {
      const [type, idx] = pathArr;

      const setFn = section === "data" ? setData : setAnalyses;
      const endpoint =
          section === "data"
              ? `${apiPrefix}/data`
              : `${apiPrefix}/analyses`;

      setFn(prev => {
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
        await postJSON(withDir(endpoint), { type, data: payload });
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

  /** ----------------------- Rename ----------------------- */
  async function handleRenameNode(args: RenameArgs) {
    if (typeof args !== "object" || args === null) return;

    const {section, pathArr, newName} = args;
    if (!newName || !apiPrefix) return;

    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const list = Array.isArray(analyses[folder]) ? analyses[folder] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      const signature = JSON.stringify(src);

      try {
        const copy = { ...src, name: newName };
        await postJSON(withDir(`${apiPrefix}/analyses`), {
          type: folder,
          data: copy,
        });
        const refreshed = await getJSON<AnalysesRecord>(
            withDir(`${apiPrefix}/analyses`)
        );
        const refreshedList = Array.isArray(refreshed[folder])
            ? refreshed[folder]
            : [];
        let deleteIndex = refreshedList.findIndex(
            (it) => JSON.stringify(it) === signature
        );
        if (deleteIndex === -1) {
          deleteIndex = refreshedList.findIndex(
              (it) => it.name === src.name
          );
        }

        if (deleteIndex !== -1) {
          await delJSON(
              withDir(
                  `${apiPrefix}/analyses/${encodeURIComponent(folder)}/${deleteIndex}`
              )
          );
        }

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

      const signature = JSON.stringify(src);

      try {
        const copy = {...src, name: newName};

        await postJSON(withDir(`${apiPrefix}/data`), {
          type: param,
          data: copy,
        });

        const refreshed = await getJSON<DataRecord>(
            withDir(`${apiPrefix}/data`)
        );
        const refreshedList = Array.isArray(refreshed[param])
            ? refreshed[param]
            : [];
        let deleteIndex = refreshedList.findIndex(
            (it) => JSON.stringify(it) === signature
        );
        if (deleteIndex === -1) {
          deleteIndex = refreshedList.findIndex(
              (it) => it.name === src.name
          );
        }

        if (deleteIndex !== -1) {
          await delJSON(
              withDir(
                  `${apiPrefix}/data/${encodeURIComponent(param)}/${deleteIndex}`
              )
          );
        }

        await refreshAll();
      } catch (e) {
        console.error("Rename data failed:", e);
      }
      return;
    }

    if (section === "maps") {
      const [idx] = pathArr;
      setMaps((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (!list[idx]) return prev;
        const next = [...list];
        next[idx] = {...next[idx], name: newName};
        return next;
      });
    }
  }

  /** ----------------------- Wizards and Data Save ----------------------- */
  const handleWizardFinish = async (type: string, valuesObj: any) => {
    if (!apiPrefix) {
      return;
    }

    getComponentRegistryEntry(type);
    const friendlyType = getComponentLabel(type);

    try {
      await postJSON(withDir(`${apiPrefix}/analyses`), {
        type: friendlyType,
        data: valuesObj,
      });
      await refreshAll();
    } catch (err) {
      logSilentError(err);
    }
  };

  const handleDataSave = async (category: string, valuesObj: any) => {
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

      // Always inherit the existing DSS filepath if one exists for this category
      if (existing) {
        payload.filepath = existing.filepath;
      }
    }

    try {
      await postJSON(withDir(`${apiPrefix}/data`), {
        type: category,
        data: payload,
      });
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

  /** ----------------------- Return ----------------------- */
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
