import { useEffect, useState } from "react";
import { componentMetadata } from "../utils/componentMetadata";

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
    if (typeof args !== "object" || args === null) return;

    const { section } = args;

    if (section === "maps") {
      const [idx] = args.pathArr;
      setMaps((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((_, i) => i !== idx);
      });
      return;
    }

    if (section === "data") {
      const [param, idx] = args.pathArr;

      setData((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[param]) ? next[param] : [];
        next[param] = list.filter((_, i) => i !== idx);
        if (!next[param].length) delete next[param];
        return next;
      });

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

      setAnalyses((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[folder]) ? next[folder] : [];
        next[folder] = list.filter((_, i) => i !== idx);
        if (!next[folder].length) delete next[folder];
        return next;
      });

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
    if (typeof args !== "object" || args === null) return;

    const { section, pathArr, newName, newDesc, item } = args;
    if (!newName) return;

    if (section === "data") {
      const [param, idx] = pathArr;

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
    if (typeof args !== "object" || args === null) return;

    const { section, pathArr, newName } = args;
    if (!newName) return;

    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const list = Array.isArray(analyses[folder]) ? analyses[folder] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      const signature = JSON.stringify(src);

      try {
        const copy = { ...src, name: newName };

        await postJSON("/api/analyses", { type: folder, data: copy });

        const refreshed = await getJSON<AnalysesRecord>("/api/analyses");

        const refreshedList = Array.isArray(refreshed[folder]) ? refreshed[folder] : [];
        let deleteIndex = refreshedList.findIndex((it) => JSON.stringify(it) === signature);
        if (deleteIndex === -1) {
          deleteIndex = refreshedList.findIndex((it) => it.name === src.name);
        }

        if (deleteIndex !== -1) {
          await del(`/api/analyses/${encodeURIComponent(folder)}/${deleteIndex}`);
        }

        const finalState = await getJSON<AnalysesRecord>("/api/analyses");
        setAnalyses(groupAnalysesByType(finalState));
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

      const signature = JSON.stringify(src);

      try {
        const copy = { ...src, name: newName };

        await postJSON("/api/data", { type: param, data: copy });

        const refreshed = await getJSON<DataRecord>("/api/data");

        const refreshedList = Array.isArray(refreshed[param]) ? refreshed[param] : [];
        let deleteIndex = refreshedList.findIndex((it) => JSON.stringify(it) === signature);
        if (deleteIndex === -1) {
          deleteIndex = refreshedList.findIndex((it) => it.name === src.name);
        }

        if (deleteIndex !== -1) {
          await del(`/api/data/${encodeURIComponent(param)}/${deleteIndex}`);
        }

        const finalState = await getJSON<DataRecord>("/api/data");
        setData(finalState);
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
    try {
      await postJSON("/api/analyses", { type: friendlyType, data: valuesObj });
      const refreshed = await getJSON<AnalysesRecord>("/api/analyses");
      setAnalyses(groupAnalysesByType(refreshed));
    } catch {
      /* ignore */
    }
  };

  const handleDataSave = async (category: string, valuesObj: any) => {
    try {
      await postJSON("/api/data", { type: category, data: valuesObj });
      const refreshed = await getJSON<DataRecord>("/api/data");
      setData(refreshed);
    } catch {
      /* ignore */
    }
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
