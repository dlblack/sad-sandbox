import { useState, useRef, useCallback } from "react";
import { componentMetadata, DEFAULT_COMPONENT_SIZE } from "../utils/componentMetadata";
import { makeMessage } from "../utils/messageUtils";

function getDefaultDockZone(type) {
  switch (type) {
    case "ComponentContent": return "W";
    case "ComponentMessage": return "S";
    case "ComponentStyleSelector": return "E";
    default: return "CENTER";
  }
}

export default function useDockableContainers() {
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState("info");
  const [containers, setContainers] = useState([
    { id: "ComponentContent", type: "ComponentContent", dockZone: getDefaultDockZone("ComponentContent"), ...componentMetadata.ComponentContent },
    { id: "ComponentMessage", type: "ComponentMessage", dockZone: getDefaultDockZone("ComponentMessage"), ...componentMetadata.ComponentMessage },
  ]);
  const openComponentTypesRef = useRef(new Set());

  // Add
  const addComponent = useCallback((type, optionalProps = {}) => {
    if (containers.some(c => c.type === type)) return;
    if (openComponentTypesRef.current.has(type)) return;

    openComponentTypesRef.current.add(type);

    setMessages(prev => [...prev, componentMetadata[type]?.entityName || type]);

    const newComponentId = `${type}-${crypto.randomUUID()}`;
    const meta = componentMetadata[type] || DEFAULT_COMPONENT_SIZE;
    const resolvedWidth = (typeof meta.width === "number" && meta.width > 0)
      ? meta.width
      : (typeof DEFAULT_COMPONENT_SIZE.width === "number" ? DEFAULT_COMPONENT_SIZE.width : 320);
    const resolvedHeight = (typeof meta.height === "number" && meta.height > 0)
      ? meta.height
      : (typeof DEFAULT_COMPONENT_SIZE.height === "number" ? DEFAULT_COMPONENT_SIZE.height : 240);

    setContainers(prev => [
      ...prev,
      {
        id: newComponentId,
        type,
        dockZone: getDefaultDockZone(type),
        width: resolvedWidth,
        height: resolvedHeight,
        ...optionalProps,
      }
    ]);

    const noun = meta.noun ? ` ${meta.noun}` : "";
    setMessages(prev => [
      ...prev,
      makeMessage(10001, [meta.entityName || type, noun], "text-body-secondary"),
    ]);
    setTimeout(() => openComponentTypesRef.current.delete(type), 100);
  }, [containers, setMessages]);

  // Remove
  const removeComponent = id => {
    setContainers(prev => prev.filter(c => c.id !== id));
  };

  // Drag/Resize
  const onDragStart = (id, event) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;
    const startX = event.clientX - (container.x || 0);
    const startY = event.clientY - (container.y || 0);

    const onMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      setContainers(prev => prev.map(c => c.id === id ? { ...c, x: newX, y: newY } : c));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    containers, setContainers, messages, setMessages, messageType, setMessageType,
    addComponent, removeComponent, onDragStart
  };
}
