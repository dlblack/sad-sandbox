import {useCallback, useState} from "react";
import {componentMetadata, DEFAULT_COMPONENT_SIZE} from "../utils/componentMetadata";
import {makeMessage} from "../utils/messageUtils";

function getDefaultDockZone(type) {
  switch (type) {
    case "ComponentProject":
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

export default function useDockableContainers({ handleWizardFinish, handleDeleteNode }) {
  const [messages, setMessages] = useState([]);
  const [messageType, setMessageType] = useState("info");

  const [containers, setContainers] = useState(() => {
    return ["ComponentProject", "ComponentMessage"].map((type) => {
      const meta = componentMetadata[type] || {};
      return {
        id: type,
        type,
        title: meta.entityName || type,
        dockZone: getDefaultDockZone(type),
        width: meta.width || DEFAULT_COMPONENT_SIZE.width,
        height: meta.height || DEFAULT_COMPONENT_SIZE.height,
        ...meta,
      };
    });
  });

  const addComponent = useCallback((type, optionalProps = {}) => {
    const meta = componentMetadata[type] || DEFAULT_COMPONENT_SIZE;
    const resolvedWidth = meta.width > 0 ? meta.width : (DEFAULT_COMPONENT_SIZE.width || 320);
    const resolvedHeight = meta.height > 0 ? meta.height : (DEFAULT_COMPONENT_SIZE.height || 240);

    const newComponentId =
      type === "ComponentProject" || type === "ComponentMessage"
        ? type
        : `${type}-${crypto.randomUUID()}`;

    setContainers((prev) => {
      const cleaned = prev.filter((c) => c.type !== type);
      return [
        ...cleaned,
        {
          id: newComponentId,
          type,
          title: meta.entityName || type,
          dockZone: optionalProps.dockZone || getDefaultDockZone(type),
          width: resolvedWidth,
          height: resolvedHeight,
          ...meta,
          ...optionalProps,
        },
      ];
    });

    const category = (meta.category || "").trim();
    setMessages((prevMsgs) => [
      ...prevMsgs,
      makeMessage(10001, [meta.entityName || type, category], "text-body"),
    ]);
  }, []);

  const wizardFinishWithMessages = useCallback(
    async (type, valuesObj, id) => {
      const meta = componentMetadata[type] || {};
      const name = valuesObj?.name || "";
      setMessages((prev) => [
        ...prev,
        makeMessage(10002, [meta.entityName || type, name], "success"),
      ]);
      if (handleWizardFinish) {
        await handleWizardFinish(type, valuesObj, id);
      }
    },
    [handleWizardFinish]
  );

  const deleteNodeWithMessages = useCallback(
    (section, pathArr, name) => {
      setMessages((prev) => [...prev, makeMessage(10020, [name || "Unknown"], "danger")]);
      if (handleDeleteNode) {
        handleDeleteNode(section, pathArr);
      }
    },
    [handleDeleteNode]
  );

  const removeComponent = (id) => {
    let removedInfo = null;

    setContainers((prev) => {
      const removed = prev.find((c) => c.id === id);
      if (!removed) return prev;

      const meta = componentMetadata[removed.type] || {};
      removedInfo = {
        name: meta.entityName || removed.type,
        category: (meta.category || "").trim(),
      };

      return prev.filter((c) => c.id !== id);
    });

    if (removedInfo) {
      setMessages((prevMsgs) => [
        ...prevMsgs,
        makeMessage(10030, [removedInfo.name, removedInfo.category], "text-body-secondary"),
      ]);
    }
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

  // Type-aware logging
  const logCenterOpened = (type, title) => {
    const cat = (componentMetadata[type]?.category || "").trim() || "Component";
    setMessages((prev) => [...prev, makeMessage(10001, [title, cat], "text-body")]);
  };

  const logCenterClosed = (type, title) => {
    const cat = (componentMetadata[type]?.category || "").trim() || "Component";
    setMessages((prevMsgs) => {
      const msg = makeMessage(10030, [title, cat], "text-body-secondary");
      const last = prevMsgs[prevMsgs.length - 1];
      if (last?.text === msg.text) return prevMsgs;
      return [...prevMsgs, msg];
    });
  };

  const logCenterAlreadyOpen = (type, title) => {
    setMessages((prev) => [...prev, makeMessage(10010, [title], "warning")]);
  };

  return {
    containers, setContainers,
    messages, setMessages,
    messageType, setMessageType,
    addComponent, removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
    logCenterOpened, logCenterClosed, logCenterAlreadyOpen,
  };
}
