import { useCallback, useState } from "react";
import { componentMetadata, DEFAULT_COMPONENT_SIZE } from "../utils/componentMetadata";
import { makeMessage } from "../utils/messageUtils";

type DockZone = "W" | "E" | "S" | "CENTER" | string;

function getDefaultDockZone(type: string): DockZone {
  switch (type) {
    case "ComponentProject":
      return "W";
    case "ComponentMessage":
      return "S";
    case "ComponentInterfaceOptions":
      return "E";
    default:
      return "CENTER";
  }
}

export type WizardFinishFn = (type: string, valuesObj: any, id?: string) => Promise<void>;

export default function useDockableContainers({
                                                handleWizardFinish,
                                                handleDeleteNode,
                                              }: {
  handleWizardFinish?: WizardFinishFn;
  handleDeleteNode?: (section: any, pathArr: any[], name?: string) => void | Promise<void>;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageType, setMessageType] = useState("info");

  const [containers, setContainers] = useState<any[]>(() => {
    return ["ComponentProject", "ComponentMessage"].map((type) => {
      const meta = (componentMetadata as any)[type] || {};
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

  const addComponent = useCallback((type: string, optionalProps: Record<string, any> = {}) => {
    const meta = (componentMetadata as any)[type] || DEFAULT_COMPONENT_SIZE;
    const resolvedWidth =
        typeof meta.width === "number" && meta.width > 0 ? meta.width : DEFAULT_COMPONENT_SIZE.width || 320;
    const resolvedHeight =
        typeof meta.height === "number" && meta.height > 0 ? meta.height : DEFAULT_COMPONENT_SIZE.height || 240;

    const newComponentId =
        type === "ComponentProject" || type === "ComponentMessage" ? type : `${type}-${crypto.randomUUID()}`;

    setContainers((prev) => {
      const cleaned = prev.filter((c: any) => c.type !== type);
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
    setMessages((prevMsgs) => [...prevMsgs, makeMessage(10001, [meta.entityName || type, category], "text-body")]);
  }, []);

  const wizardFinishWithMessages: WizardFinishFn = async (type, valuesObj, id) => {
    const meta = (componentMetadata as any)[type] || {};
    const name = valuesObj?.name || "";
    setMessages((prev) => [...prev, makeMessage(10002, [meta.entityName || type, name], "success")]);
    if (handleWizardFinish) {
      await handleWizardFinish(type, valuesObj, id);
    }
  };

  const deleteNodeWithMessages = useCallback(
      (section: any, pathArr: any[], name?: string) => {
        setMessages((prev) => [...prev, makeMessage(10020, [name || "Unknown"], "danger")]);
        if (handleDeleteNode) {
          handleDeleteNode(section, pathArr, name);
        }
      },
      [handleDeleteNode]
  );

  const removeComponent = (id: string) => {
    let removedInfo: { name: string; category: string } | null = null;

    setContainers((prev) => {
      const removed = prev.find((c: any) => c.id === id);
      if (!removed) return prev;

      const meta = (componentMetadata as any)[removed.type] || {};
      removedInfo = {
        name: meta.entityName || removed.type,
        category: (meta.category || "").trim(),
      };

      return prev.filter((c: any) => c.id !== id);
    });

    if (removedInfo) {
      setMessages((prevMsgs) => [
        ...prevMsgs,
        makeMessage(10030, [removedInfo.name, removedInfo.category], "text-body-secondary"),
      ]);
    }
  };

  const onDragStart = (id: string, event: MouseEvent) => {
    const container = containers.find((c: any) => c.id === id);
    if (!container) return;
    const startX = event.clientX - (container.x || 0);
    const startY = event.clientY - (container.y || 0);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;
      setContainers((prev) => prev.map((c: any) => (c.id === id ? { ...c, x: newX, y: newY } : c)));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp as any);
    };

    document.addEventListener("mousemove", onMouseMove as any);
    document.addEventListener("mouseup", onMouseUp as any);
  };

  const logCenterOpened = (type: string, title: string) => {
    const cat = ((componentMetadata as any)[type]?.category || "").trim() || "Component";
    setMessages((prev) => [...prev, makeMessage(10001, [title, cat], "info")]);
  };

  const logCenterClosed = (type: string, title: string) => {
    const cat = ((componentMetadata as any)[type]?.category || "").trim() || "Component";
    setMessages((prevMsgs) => {
      const msg = makeMessage(10030, [title, cat], "text-body-secondary");
      const last = prevMsgs[prevMsgs.length - 1];
      if (last?.text === msg.text) return prevMsgs;
      return [...prevMsgs, msg];
    });
  };

  const logCenterAlreadyOpen = (type: string, title: string) => {
    setMessages((prev) => [...prev, makeMessage(10010, [title], "warning")]);
  };

  return {
    containers,
    setContainers,
    messages,
    setMessages,
    messageType,
    setMessageType,
    addComponent,
    removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
    logCenterOpened,
    logCenterClosed,
    logCenterAlreadyOpen,
  };
}
