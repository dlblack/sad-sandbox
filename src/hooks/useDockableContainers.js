import {useCallback, useRef, useState} from "react";
import {componentMetadata, DEFAULT_COMPONENT_SIZE} from "../utils/componentMetadata";
import {makeMessage} from "../utils/messageUtils";

function getDefaultDockZone(type) {
  switch (type) {
    case "ComponentContent":
      return "W";
    case "ComponentMessage":
      return "S";
    case "ComponentInterfaceSize":
    case "ComponentStyleSelector":
      return "E";
    default:
      return "CENTER";
  }
}

export default function useDockableContainers({handleWizardFinish, handleDeleteNode}) {
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState("info");

  // Initialize with correct titles and metadata
  const [containers, setContainers] = useState(() => {
    return ["ComponentContent", "ComponentMessage"].map(type => {
      const meta = componentMetadata[type] || {};
      return {
        id: type,
        type,
        title: meta.entityName || type,
        dockZone: getDefaultDockZone(type),
        width: meta.width || DEFAULT_COMPONENT_SIZE.width,
        height: meta.height || DEFAULT_COMPONENT_SIZE.height,
        ...meta
      };
    });
  });

  const openComponentTypesRef = useRef(new Set());

  const addComponent = useCallback((type, optionalProps = {}) => {
    const meta = componentMetadata[type] || DEFAULT_COMPONENT_SIZE;

    if (containers.some(c => c.type === type) || openComponentTypesRef.current.has(type)) {
      setMessages(prev => [
        ...prev,
        makeMessage(10010, [meta.entityName || type], "warning"),
      ]);
      return;
    }

    openComponentTypesRef.current.add(type);

    const newComponentId = `${type}-${crypto.randomUUID()}`;
    const resolvedWidth = meta.width > 0 ? meta.width : (DEFAULT_COMPONENT_SIZE.width || 320);
    const resolvedHeight = meta.height > 0 ? meta.height : (DEFAULT_COMPONENT_SIZE.height || 240);

    setContainers(prev => [
      ...prev,
      {
        id: newComponentId,
        type,
        title: meta.entityName || type,
        dockZone: getDefaultDockZone(type),
        width: resolvedWidth,
        height: resolvedHeight,
        ...meta,
        ...optionalProps,
      },
    ]);

    setMessages(prev => [
      ...prev,
      makeMessage(10001, [meta.entityName || type, meta.category], "text-body"),
    ]);

    setTimeout(() => openComponentTypesRef.current.delete(type), 100);
  }, [containers]);

  const wizardFinishWithMessages = useCallback(async (type, valuesObj, id) => {
    const meta = componentMetadata[type] || {};
    const name = valuesObj?.name || "";
    setMessages(prev => [
      ...prev,
      makeMessage(10002, [meta.entityName || type, name], "success"),
    ]);
    if (handleWizardFinish) {
      await handleWizardFinish(type, valuesObj, id);
    }
  }, [handleWizardFinish]);

  const deleteNodeWithMessages = useCallback((section, pathArr, name) => {
    setMessages(prev => [
      ...prev,
      makeMessage(10020, [name || "Unknown"], "danger"),
    ]);
    if (handleDeleteNode) {
      handleDeleteNode(section, pathArr);
    }
  }, [handleDeleteNode]);

  const removeComponent = (id) => {
    setContainers((prev) => {
      const removed = prev.find((c) => c.id === id);
      if (!removed) return prev;

      const meta = componentMetadata[removed.type] || {};
      const entityName = meta.entityName || removed.type;

      setMessages((prevMsgs) => {
        const closedMsg = makeMessage(
          10030,
          [entityName, meta.category || ""],
          "text-body-secondary"
        );
        const lastMsg = prevMsgs[prevMsgs.length - 1];
        if (lastMsg?.text === closedMsg.text) {
          return prevMsgs;
        }
        return [...prevMsgs, closedMsg];
      });

      return prev.filter((c) => c.id !== id);
    });
  };

  const onDragStart = (id, event) => {
    const container = containers.find(c => c.id === id);
    if (!container) return;
    const startX = event.clientX - (container.x || 0);
    const startY = event.clientY - (container.y || 0);

    const onMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      setContainers(prev =>
        prev.map(c => c.id === id ? {...c, x: newX, y: newY} : c)
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    containers, setContainers,
    messages, setMessages,
    messageType, setMessageType,
    addComponent, removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
  };
}
