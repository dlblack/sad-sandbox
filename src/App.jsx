import React, { useState, useEffect, useContext } from "react";
import { StyleContext } from "./styles/StyleContext";
import Navbar from "./app_components/navbar";
import DockableFrame from "./app_components/dockable/DockableFrame";
import { componentMetadata, DEFAULT_COMPONENT_SIZE } from "./utils/componentMetadata";
import { componentDisplayNames } from "./utils/componentDisplayNames";
import { makeMessage } from "./utils/messageUtils";
import ComponentMessage from "./app_components/ComponentMessage";

function groupAnalysesByType(analysesObj = {}) {
  return analysesObj;
}

function App() {
  const { appBackgroundStyle } = useContext(StyleContext);

  const [maps, setMaps] = useState({});
  const [data, setData] = useState({});
  const [analyses, setAnalyses] = useState({});

  const getDefaultDockZone = (type) => {
    switch (type) {
      case "ComponentContent": return "W";
      case "ComponentMessage": return "S";
      case "ComponentStyleSelector": return "E";
      default: return "CENTER";
    }
  };

  // Messages, DockableFrames, etc.
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState("info");
  const [containers, setContainers] = useState([
    { id: "ComponentContent", type: "ComponentContent", dockZone: getDefaultDockZone("ComponentContent"), ...componentMetadata.ComponentContent },
    { id: "ComponentMessage", type: "ComponentMessage", dockZone: getDefaultDockZone("ComponentMessage"), ...componentMetadata.ComponentMessage },
  ]);
  
  // ----- LOAD analyses & data on mount -----
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

  // ----- ADD analysis and persist -----
  const handleWizardFinish = async (type, valuesObj, id) => {
    const friendlyType = componentDisplayNames[type] || type;
    try {
      // API post
      await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: friendlyType, data: valuesObj }),
      });

      // Fetch, update, etc.
      fetch("/api/analyses")
        .then(res => res.json())
        .then(data => setAnalyses(groupAnalysesByType(data)))
        .catch(() => {});

      setContainers(prev => prev.filter(c => c.id !== id));
      setMessages(prev => [
        ...prev,
        makeMessage(10002, [friendlyType, valuesObj.name], "success"),
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        makeMessage(10003, [], "danger"),
      ]);
      setMessageType("danger");
    }
  };

  const handleDataSave = async (category, valuesObj, id) => {
    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: category, data: valuesObj }),
      });
  
      // Re-fetch
      fetch("/api/data")
        .then(res => res.json())
        .then(data => setData(data))
        .catch(() => {});
  
      setContainers(prev => prev.filter(c => c.id !== id));
      setMessages(prev => [
        ...prev,
        makeMessage(20002, [category, valuesObj.name], "success"),
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        makeMessage(20003, [], "danger"),
      ]);
      setMessageType("danger");
    }
  };
  
  // ----- Dockable windows -----
  const addComponent = (type, optionalProps = {}) => {
    const meta = componentMetadata[type] || DEFAULT_COMPONENT_SIZE;

    if (containers.some(c => c.type === type)) {
      setMessages(prev => [
        ...prev,
        makeMessage(
          10010,
          [meta.entityName || type],
          "text-warning"
        )
      ]);
      return;
    }

    setMessages(prev => [...prev, componentMetadata[type]?.entityName || type]);

    const newComponentId = `${type}-${Date.now()}`;
    setContainers(prev => [
      ...prev, 
      {
        id: newComponentId,
        type,
        dockZone: getDefaultDockZone(type),
        width: meta.width,
        height: meta.height,
        ...optionalProps,
      }
    ]);

    const noun = meta.noun ? ` ${meta.noun}` : "";
    setMessages(prev => [
      ...prev,
      makeMessage(10001, [meta.entityName || type, noun], "text-body-secondary"),
    ]);   
  };

  const removeComponent = id => {
    setContainers(prev => {
      const filtered = prev.filter(c => c.id !== id);
      return filtered;
    });
  };

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
      const itemObj = data[folder][idx];
      const newItem = { ...itemObj, name: newName, description: newDesc };
      fetch(`/api/analyses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: folder, data: newItem }),
      })
        .then(() => fetch("/api/analyses"))
        .then(res => res.json())
        .then(data => setAnalyses(data));
    }
  };  

  const handleRenameNode = (section, pathArr, newName) => {
    if (section === "maps") {
      const [category, idx] = pathArr;
      setData(prev => {
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
        .then(data => setAnalyses(data));
    }
  };  

  const handleDeleteNode = (section, pathArr) => {
    if (section === "maps") {
      setMaps(prev => prev.filter((_, i) => i !== pathArr[0]));
    }
    if (section === "data") {
      setData(prev => {
        const dataCopy = { ...prev };
        const [param, idx] = pathArr;
        dataCopy[param] = dataCopy[param].filter((_, i) => i !== idx);
        return dataCopy;
      });
      fetch(`/api/data/${encodeURIComponent(category)}/${idx}`, { method: "DELETE" })
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
        return analysesCopy;
      });
      fetch(`/api/analyses/${encodeURIComponent(folder)}/${idx}`, { method: "DELETE" })
        .then(res => res.json())
        .then(() => {
          fetch("/api/analyses")
            .then(res => res.json())
            .then(data => setAnalyses(data));
        });
    }
  };  
  
  const onDragStart = (id, event) => {
    const container = containers[id];
    const startX = event.clientX - container.x;
    const startY = event.clientY - container.y;

    const onMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      setContainers((prev) => ({
        ...prev,
        [id]: { ...prev[id], x: newX, y: newY },
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className={`app-container ${appBackgroundStyle}`} style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div>
        <Navbar addComponent={addComponent}/>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <DockableFrame
          containers={containers}
          setContainers={setContainers}
          removeComponent={removeComponent}
          onDragStart={onDragStart}
          messages={messages}
          messageType={messageType}
          setMessageType={setMessageType}
          onSaveAsNode={handleSaveAsNode}
          onRenameNode={handleRenameNode}
          onDeleteNode={handleDeleteNode}
          maps={maps}
          data={data}
          analyses={analyses}
          onWizardFinish={handleWizardFinish}
          onDataSave={handleDataSave}
        />
      </div>
    </div>
  );
}

export default App;
