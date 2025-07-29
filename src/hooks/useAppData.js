import {useEffect, useState} from "react";
import {dockableTitles} from "@/utils/dockableTitles.js";

function groupAnalysesByType(analysesObj = {}) {
  return analysesObj;
}

export default function useAppData() {
  const [maps, setMaps] = useState({});
  const [data, setData] = useState({});
  const [analyses, setAnalyses] = useState({});

  useEffect(() => {
    fetch("/api/analyses")
      .then(res => res.json())
      .then(data => setAnalyses(groupAnalysesByType(data)))
      .catch(() => setAnalyses({}));
    fetch("/api/data")
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => setData({}));
  }, []);

  const handleDeleteNode = (section, pathArr) => {
    if (!Array.isArray(pathArr)) return;
    if (section === "maps") {
      const [idx] = pathArr;
      setMaps(prev => prev.filter((_, i) => i !== idx));
    }
    if (section === "data") {
      const [param, idx] = pathArr;
      setData(prev => {
        const dataCopy = {...prev};
        dataCopy[param] = dataCopy[param].filter((_, i) => i !== idx);
        if (!dataCopy[param].length) delete dataCopy[param];
        return dataCopy;
      });
      fetch(`/api/data/${encodeURIComponent(param)}/${idx}`, {method: "DELETE"})
        .then(() => fetch("/api/data"))
        .then(res => res.json())
        .then(data => setData(data));
    }
    if (section === "analyses") {
      const [folder, idx] = pathArr;
      setAnalyses(prev => {
        const copy = {...prev};
        copy[folder] = copy[folder].filter((_, i) => i !== idx);
        if (!copy[folder].length) delete copy[folder];
        return copy;
      });
      fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, {method: "DELETE"})
        .then(() => fetch("/api/analyses"))
        .then(res => res.json())
        .then(data => setAnalyses(groupAnalysesByType(data)));
    }
  };

  const handleWizardFinish = async (type, valuesObj) => {
    const friendlyType = dockableTitles[type] || type;
    await fetch("/api/analyses", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type: friendlyType, data: valuesObj}),
    });
    fetch("/api/analyses")
      .then(res => res.json())
      .then(data => setAnalyses(groupAnalysesByType(data)));
  };

  const handleDataSave = async (category, valuesObj) => {
    await fetch("/api/data", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({type: category, data: valuesObj}),
    });
    fetch("/api/data")
      .then(res => res.json())
      .then(data => setData(data));
  };

  return {
    maps, setMaps, data, setData, analyses, setAnalyses,
    handleDeleteNode,
    handleWizardFinish,
    handleDataSave,
  };
}
