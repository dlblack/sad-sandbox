import { useEffect, useState } from "react";
import { componentMetadata } from "../utils/componentMetadata.js";

function groupAnalysesByType(analysesObj = {}) {
  return analysesObj;
}

export default function useAppData() {
  const [maps, setMaps] = useState([]);
  const [data, setData] = useState({});
  const [analyses, setAnalyses] = useState({});

  useEffect(() => {
    fetch("/api/analyses")
      .then((res) => res.json())
      .then((payload) => setAnalyses(groupAnalysesByType(payload)))
      .catch(() => setAnalyses({}));
    fetch("/api/data")
      .then((res) => res.json())
      .then((payload) => setData(payload))
      .catch(() => setData({}));
  }, []);

  const handleDeleteNode = (section, pathArr) => {
    if (!Array.isArray(pathArr)) return;
    if (section === "maps") {
      const [idx] = pathArr;
      setMaps((prev) => (Array.isArray(prev) ? prev.filter((_, i) => i !== idx) : prev));
      return;
    }
    if (section === "data") {
      const [param, idx] = pathArr;
      setData((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[param]) ? next[param] : [];
        next[param] = list.filter((_, i) => i !== idx);
        if (!next[param].length) delete next[param];
        return next;
      });
      fetch(`/api/data/${encodeURIComponent(param)}/${idx}`, { method: "DELETE" })
        .then(() => fetch("/api/data"))
        .then((res) => res.json())
        .then((payload) => setData(payload))
        .catch(() => {});
      return;
    }
    if (section === "analyses") {
      const [folder, idx] = pathArr;
      setAnalyses((prev) => {
        const next = { ...prev };
        const list = Array.isArray(next[folder]) ? next[folder] : [];
        next[folder] = list.filter((_, i) => i !== idx);
        if (!next[folder].length) delete next[folder];
        return next;
      });
      fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, { method: "DELETE" })
        .then(() => fetch("/api/analyses"))
        .then((res) => res.json())
        .then((payload) => setAnalyses(groupAnalysesByType(payload)))
        .catch(() => {});
    }
  };

  async function handleSaveAsNode(section, pathArr, newName, newDesc, item) {
    if (!Array.isArray(pathArr) || !newName) return;

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
        await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: param, data: payload }),
        });
        const refreshed = await fetch("/api/data").then((r) => r.json());
        setData(refreshed);
      } catch {
        // ignore;
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
        const friendlyType = folder;
        const payload = { ...(item || {}), name: newName, description: newDesc ?? item?.description };
        await fetch("/api/analyses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: friendlyType, data: payload }),
        });
        const refreshed = await fetch("/api/analyses").then((r) => r.json());
        setAnalyses(groupAnalysesByType(refreshed));
      } catch {
        // ignore;
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

  async function handleRenameNode(section, pathArr, newName) {
    if (!Array.isArray(pathArr) || !newName) return;

    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const list = Array.isArray(analyses[folder]) ? analyses[folder] : [];
      const src = list[idx];
      if (!src || src.name === newName) return;

      try {
        const copy = { ...src, name: newName };
        await fetch("/api/analyses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: folder, data: copy })
        });

        await fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, { method: "DELETE" });

        const refreshed = await fetch("/api/analyses").then(r => r.json());
        setAnalyses(groupAnalysesByType(refreshed));
      } catch (e) {
        // optional
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
        await fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: param, data: copy })
        });

        await fetch(`/api/data/${encodeURIComponent(param)}/${idx}`, { method: "DELETE" });

        const refreshed = await fetch("/api/data").then(r => r.json());
        setData(refreshed);
      } catch (e) {
        // optional
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

  const handleWizardFinish = async (type, valuesObj) => {
    const friendlyType = componentMetadata?.[type]?.entityName ?? type;
    await fetch("/api/analyses", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type: friendlyType, data: valuesObj}),
    });
    fetch("/api/analyses")
      .then((res) => res.json())
      .then((payload) => setAnalyses(groupAnalysesByType(payload)));
  };

  // DATA SAVE (bulk) ----------------------------------------------------------
  const handleDataSave = async (category, valuesObj) => {
    await fetch("/api/data", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type: category, data: valuesObj}),
    });
    fetch("/api/data")
      .then((res) => res.json())
      .then((payload) => setData(payload));
  };

  return {
    maps, setMaps, data, setData, analyses, setAnalyses,
    handleSaveAsNode,
    handleRenameNode,
    handleDeleteNode,
    handleWizardFinish,
    handleDataSave,
  };
}
