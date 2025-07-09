import { useState, useEffect } from "react";
import { componentDisplayNames } from "../utils/componentDisplayNames";
import { makeMessage } from "../utils/messageUtils";

function groupAnalysesByType(analysesObj = {}) {
  return analysesObj;
}

export default function useAppData() {
  const [maps, setMaps] = useState({});
  const [data, setData] = useState({});
  const [analyses, setAnalyses] = useState({});

  // Load
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

  // Save As
  const handleSaveAsNode = (section, pathArr, newName, newDesc, itemObj) => {
    if (section === "data") {
      const [category, idx] = pathArr;
      const itemObj = data[category][idx];
      const newItem = { ...itemObj, name: newName, description: newDesc };
      fetch(`/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: category, data: newItem }),
      })
        .then(() => fetch("/api/data"))
        .then(res => res.json())
        .then(data => setData(data));
    }
    if (section === "analyses") {
      const [folder, idx] = pathArr;
      const itemObj = analyses[folder][idx];
      const newItem = { ...itemObj, name: newName, description: newDesc };
      fetch(`/api/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: folder, data: newItem }),
      })
        .then(() => fetch("/api/analyses"))
        .then(res => res.json())
        .then(data => setAnalyses(groupAnalysesByType(data)));
    }
  };

  // Rename
  const handleRenameNode = (section, pathArr, newName) => {
    if (section === "maps") {
      const [category, idx] = pathArr;
      setMaps(prev => {
        const mapsCopy = { ...prev };
        mapsCopy[category] = mapsCopy[category].map((item, i) =>
          i === idx ? { ...item, name: newName } : item
        );
        return mapsCopy;
      });
      fetch(`/api/data/${encodeURIComponent(category)}/${idx}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
        .then(() => fetch("/api/data"))
        .then(res => res.json())
        .then(data => setData(data));
    }
    if (section === "data") {
      const [category, idx] = pathArr;
      setData(prev => {
        const dataCopy = { ...prev };
        dataCopy[category] = dataCopy[category].map((item, i) =>
          i === idx ? { ...item, name: newName } : item
        );
        return dataCopy;
      });
      fetch(`/api/data/${encodeURIComponent(category)}/${idx}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
        .then(() => fetch("/api/data"))
        .then(res => res.json())
        .then(data => setData(data));
    }
    if (section === "analyses") {
      const [folder, idx] = pathArr;
      setAnalyses(prev => {
        const analysesCopy = { ...prev };
        analysesCopy[folder] = analysesCopy[folder].map((item, i) =>
          i === idx ? { ...item, name: newName } : item
        );
        return analysesCopy;
      });
      fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      })
        .then(() => fetch("/api/analyses"))
        .then(res => res.json())
        .then(data => setAnalyses(groupAnalysesByType(data)));
    }
  };

  // Delete
  const handleDeleteNode = (section, pathArr) => {
    if (section === "maps") {
      setMaps(prev => prev.filter((_, i) => i !== pathArr[0]));
    }
    if (section === "data") {
      const [param, idx] = pathArr;
      setData(prev => {
        const dataCopy = { ...prev };
        dataCopy[param] = dataCopy[param].filter((_, i) => i !== idx);
        if (dataCopy[param].length === 0) {
          delete dataCopy[param];
        }
        return dataCopy;
      });
      fetch(`/api/data/${encodeURIComponent(param)}/${idx}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          fetch("/api/data")
            .then(res => res.json())
            .then(data => setData(data));
        });
    }
    if (section === "analyses") {
      const [folder, idx] = pathArr;
      setAnalyses(prev => {
        const analysesCopy = { ...prev };
        analysesCopy[folder] = analysesCopy[folder].filter((_, i) => i !== idx);
        if (analysesCopy[folder].length === 0) {
          delete analysesCopy[folder];
        }
        return analysesCopy;
      });
      fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          fetch("/api/analyses")
            .then(res => res.json())
            .then(data => setAnalyses(groupAnalysesByType(data)));
        });
    }
  };

  // Analysis wizard finish
  const handleWizardFinish = async (type, valuesObj, id) => {
    const friendlyType = componentDisplayNames[type] || type;
    try {
      await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: friendlyType, data: valuesObj }),
      });
      fetch("/api/analyses")
        .then(res => res.json())
        .then(data => setAnalyses(groupAnalysesByType(data)))
        .catch(() => {});
    } catch (err) {
      // TODO
    }
  };

  // Data save (editor)
  const handleDataSave = async (category, valuesObj, id) => {
    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: category, data: valuesObj }),
      });
      fetch("/api/data")
        .then(res => res.json())
        .then(data => setData(data))
        .catch(() => {});
    } catch (err) {
      // TODO
    }
  };

  return {
    maps, setMaps, data, setData, analyses, setAnalyses,
    handleSaveAsNode, handleRenameNode, handleDeleteNode,
    handleWizardFinish, handleDataSave
  };
}
