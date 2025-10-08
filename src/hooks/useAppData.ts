import {useEffect, useState} from "react";
import {componentMetadata} from "../utils/componentMetadata";

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
  // Currently just passthrough; keep the function for future grouping logic
  return payload;
}

async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
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

async function del(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

/** ----------------------- Hook ----------------------- */

export default function useAppData() {
  const [maps, setMaps] = useState<any[]>([]);
  const [data, setData] = useState<DataRecord>({});
  const [analyses, setAnalyses] = useState<AnalysesRecord>({});

  // initial loads
  useEffect(() => {
    getJSON<AnalysesRecord>("/api/analyses")
        .then((payload) => setAnalyses(groupAnalysesByType(payload)))
        .catch(() => setAnalyses({}));

    getJSON<DataRecord>("/api/data")
        .then((payload) => setData(payload))
        .catch(() => setData({}));
  }, []);

  /** ----------------------- Delete ----------------------- */
  async function handleDeleteNode(args: DeleteArgs) {
    const { section } = args;

    if (section === "maps") {
      const [idx] = args.pathArr;
      setMaps((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : prev));
      return;
    }

    if (section === "data") {
      const [param, idx] = args.pathArr;
      // optimistic update
      setData((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[param]) ? next[param] : [];
        next[param] = list.filter((_, i) => i !== idx);
        if (!next[param].length) delete next[param];
        return next;
      });

      // persist + refresh
      try {
        await del(`/api/data/${encodeURIComponent(param)}/${idx}`);
        const refreshed = await getJSON<DataRecord>("/api/data");
        setData(refreshed);
      } catch {
        /* ignore */
      }
      return;
    }

    if (section === "analyses") {
      const [folder, idx] = args.pathArr;
      // optimistic update
      setAnalyses((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[folder]) ? next[folder] : [];
        next[folder] = list.filter((_, i) => i !== idx);
        if (!next[folder].length) delete next[folder];
        return next;
      });

      // persist + refresh
      try {
        await del(`/api/analyses/${encodeURIComponent(folder)}/${idx}`);
        const refreshed = await getJSON<AnalysesRecord>("/api/analyses");
        setAnalyses(groupAnalysesByType(refreshed));
      } catch {
        /* ignore */
      }
    }
  }

  /** ----------------------- Save As (duplicate) ----------------------- */
  async function handleSaveAsNode(args: SaveAsArgs) {
    const { section, pathArr, newName, newDesc, item } = args;
    if (!newName) return;

    if (section === "data") {
      const [param, idx] = pathArr;

      // optimistic append
      setData((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[param]) ? next[param] : [];
        const src = list[idx];
        if (!src) return prev;
        const copy = { ...src, name: newName, description: newDesc ?? src.description };
        next[param] = [...list, copy];
        return next;
      });

      try {
        const payload = { ...(item || {}), name: newName, description: newDesc ?? item?.description };
        await postJSON("/api/data", { type: param, data: payload });
        const refreshed = await getJSON<DataRecord>("/api/data");
        setData(refreshed);
      } catch {
        /* ignore */
      }
      return;
    }

    if (section === "analyses") {
      const [folder, idx] = pathArr;

      // optimistic append
      setAnalyses((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[folder]) ? next[folder] : [];
        const src = list[idx];
        if (!src) return prev;
        const copy = { ...src, name: newName, description: newDesc ?? src.description };
        next[folder] = [...list, copy];
        return next;
      });

      try {
        const payload = { ...(item || {}), name: newName, description: newDesc ?? item?.description };
        await postJSON("/api/analyses", { type: folder, data: payload });
        const refreshed = await getJSON<AnalysesRecord>("/api/analyses");
        setAnalyses(groupAnalysesByType(refreshed));
      } catch {
        /* ignore */
      }
      return;
    }

    if (section === "maps") {
      const [idx] = pathArr;
      setMaps((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const src = list[idx];
        if (!src) return prev;
        const copy = { ...src, name: newName, description: newDesc ?? src.description };
        return [...list, copy];
      });
    }
  }

  /** ----------------------- Rename ----------------------- */
  async function handleRenameNode(args: RenameArgs) {
    const { section, pathArr, newName } = args;
    if (!newName) return;

    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const list = Array.isArray(analyses[folder]) ? analyses[folder] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      try {
        const copy = { ...src, name: newName };
        await postJSON("/api/analyses", { type: folder, data: copy });
        await del(`/api/analyses/${encodeURIComponent(folder)}/${idx}`);
        const refreshed = await getJSON<AnalysesRecord>("/api/analyses");
        setAnalyses(groupAnalysesByType(refreshed));
      } catch {
        /* ignore */
      }
      return;
    }

    if (section === "data") {
      const [param, idx] = pathArr;
      const list = Array.isArray(data[param]) ? data[param] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      try {
        const copy = { ...src, name: newName };
        await postJSON("/api/data", { type: param, data: copy });
        await del(`/api/data/${encodeURIComponent(param)}/${idx}`);
        const refreshed = await getJSON<DataRecord>("/api/data");
        setData(refreshed);
      } catch {
        /* ignore */
      }
      return;
    }

    if (section === "maps") {
      const [idx] = pathArr;
      setMaps((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (!list[idx]) return prev;
        const next = [...list];
        next[idx] = { ...next[idx], name: newName };
        return next;
      });
    }
  }

  /** ----------------------- Wizards & Data Save ----------------------- */
  const handleWizardFinish = async (type: string, valuesObj: any) => {
    const friendlyType = componentMetadata?.[type]?.entityName ?? type;
    await postJSON("/api/analyses", { type: friendlyType, data: valuesObj });
    const refreshed = await getJSON<AnalysesRecord>("/api/analyses");
    setAnalyses(groupAnalysesByType(refreshed));
  };

  const handleDataSave = async (category: string, valuesObj: any) => {
    await postJSON("/api/data", { type: category, data: valuesObj });
    const refreshed = await getJSON<DataRecord>("/api/data");
    setData(refreshed);
  };

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
  };
}
