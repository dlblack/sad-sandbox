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

  // Analyses are fetched from the backend
  const [analyses, setAnalyses] = useState({});

  // Messages etc.
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState("info");

  // Containers for DockableFrame
  const [containers, setContainers] = useState({
    ComponentContent: { x: 10, y: 10, width: 300, height: 300, type: "ComponentContent" },
    Map: { x: 1000, y: 10, width: 500, height: 500, type: "Map" },
    Messages: { x: 400, y: 650, width: 1020, height: 200, type: "Messages" },
  });

  // ----- LOAD analyses on mount -----
  useEffect(() => {
    fetch("/api/analyses")
      .then(res => res.json())
      .then(data => setAnalyses(groupAnalysesByType(data)))
      .catch(() => setAnalyses({}));
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
  
      setContainers(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setMessages(prev => [
        ...prev,
        makeMessage(`Created ${friendlyType} "${valuesObj.name}".`, "success"),
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        makeMessage("Something went wrong.", "danger"),
      ]);
      setMessageType("danger");
    }
  };
  
  // ----- Dockable windows -----
  const addComponent = (type) => {
    const existingKey = Object.keys(containers).find(
      (key) => containers[key].type === type
    );
    if (existingKey) {
      alert(`${componentMetadata[type]?.entityName || type} is already open.`);
      return;
    }

    const meta = componentMetadata[type] || DEFAULT_COMPONENT_SIZE;
    const noun = meta.noun ? ` ${meta.noun}` : "";

    const newComponentId = `${type}-${Date.now()}`;
    const newComponent = {
      [newComponentId]: {
        x: 320,
        y: 10,
        width: meta.width,
        height: meta.height,
        type,
      },
    };

    setContainers((prev) => ({ ...prev, ...newComponent }));

    setMessages(prev => [
      ...prev,
      makeMessage(
        `${meta.openVerb || "Opened"} ${meta.entityName || type}${noun}.`,
        "text-body-secondary"
      ),
    ]);    
  };

  const removeComponent = (id) => {
    setContainers((prev) => {
      const updatedContainers = { ...prev };
      delete updatedContainers[id];
      return updatedContainers;
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
    <div className={`app-container ${appBackgroundStyle}`} style={{ height: "100vh" }}>
      <div>
        <Navbar
          addComponent={addComponent}
        />
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <DockableFrame
          containers={containers}
          removeComponent={removeComponent}
          onDragStart={onDragStart}
          messages={messages}
          messageType={messageType}
          setMessageType={setMessageType}
          analyses={analyses}
          onWizardFinish={handleWizardFinish}
        />
      </div>
    </div>
  );
}

export default App;
