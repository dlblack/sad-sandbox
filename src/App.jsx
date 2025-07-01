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

  // Analyses (unchanged)
  const [analyses, setAnalyses] = useState({});
  // NEW: Data (time series, precipitation/discharge/etc.)
  const [data, setData] = useState({});

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

  // ----- ADD new data (for time series, discharge, precipitation, etc.) -----
  const handleDataSave = async (category, valuesObj, id) => {
    // category = "Precipitation", "SWE", "discharge", etc.
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
          analyses={analyses}
          data={data}
          onWizardFinish={handleWizardFinish}
          onDataSave={handleDataSave}
        />
      </div>
    </div>
  );
}

export default App;
