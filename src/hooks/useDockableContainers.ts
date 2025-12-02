import { useCallback, useState } from "react";
import {
  getComponentRegistryEntry,
  getComponentLabel,
  DEFAULT_COMPONENT_SIZE,
} from "../registry/componentRegistry";
import { makeMessage } from "../utils/messageUtils";
import {DeleteHandler, SectionKey} from "../types/appData";

type DockZone = "W" | "E" | "S" | "CENTER" | string;

function getDefaultDockZone(type: string): DockZone {
  switch (type) {
    case "ComponentProject":
      return "W";
    case "ComponentMessage":
      return "S";
    case "ComponentInterfaceOptions":
    case "ComponentPlotStyle":
      return "E";
    default:
      return "CENTER";
  }
}

export type WizardFinishFn = (
    type: string,
    valuesObj: any,
    id?: string
) => Promise<void>;

export type DeleteNodeFn = (
    section: SectionKey,
    pathArr: [number] | [string, number],
    name?: string
) => Promise<string | null>;

export default function useDockableContainers({
                                                handleWizardFinish,
                                                handleDeleteNode,
                                              }: {
  handleWizardFinish?: WizardFinishFn;
  handleDeleteNode?: DeleteNodeFn;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageType, setMessageType] = useState("info");

  const [containers, setContainers] = useState<any[]>(() => {
    return ["ComponentProject", "ComponentMessage"].map((type) => {
      const entry = getComponentRegistryEntry(type);
      const width =
          entry && typeof entry.width === "number" && entry.width > 0
              ? entry.width
              : DEFAULT_COMPONENT_SIZE.width;
      const height =
          entry && typeof entry.height === "number" && entry.height > 0
              ? entry.height
              : DEFAULT_COMPONENT_SIZE.height;

      const name = getComponentLabel(type);

      return {
        id: type,
        type,
        title: name,
        dockZone: getDefaultDockZone(type),
        width,
        height,
        ...(entry || {}),
      };
    });
  });

  const addComponent = useCallback(
      (type: string, optionalProps: Record<string, any> = {}) => {
        const entry = getComponentRegistryEntry(type);
        const isSingleton = entry?.singleton === true;

        const width =
            entry && typeof entry.width === "number" && entry.width > 0
                ? entry.width
                : DEFAULT_COMPONENT_SIZE.width;
        const height =
            entry && typeof entry.height === "number" && entry.height > 0
                ? entry.height
                : DEFAULT_COMPONENT_SIZE.height;

        const name = getComponentLabel(type, optionalProps);
        const category = String(entry?.componentType || "").trim();

        let alreadyOpen = false;

        setContainers((prev) => {
          if (isSingleton) {
            const existing = prev.find((c: any) => c.type === type);
            if (existing) {
              alreadyOpen = true;
              return prev;
            }
          }

          const newComponentId =
              isSingleton ||
              type === "ComponentProject" ||
              type === "ComponentMessage"
                  ? type
                  : `${type}-${crypto.randomUUID()}`;

          const cleaned = isSingleton ? prev.filter((c: any) => c.type !== type) : prev;

          return [
            ...cleaned,
            {
              id: newComponentId,
              type,
              title: name,
              dockZone: optionalProps.dockZone || getDefaultDockZone(type),
              width,
              height,
              ...(entry || {}),
              ...optionalProps,
            },
          ];
        });

        setMessages((prevMsgs) => [
          ...prevMsgs,
          alreadyOpen
              ? makeMessage(10010, [name], "warning")
              : makeMessage(10001, [name, category], "info"),
        ]);
      },
      []
  );

  const wizardFinishWithMessages: WizardFinishFn = async (
      type,
      valuesObj,
      id
  ) => {
    const entry = getComponentRegistryEntry(type);
    const name = valuesObj?.name || getComponentLabel(type);
    const labelForMsg = name || getComponentLabel(type);
    const category = String(entry?.componentType || "").trim();

    setMessages((prev) => [
      ...prev,
      makeMessage(10002, [labelForMsg, category], "success"),
    ]);

    if (handleWizardFinish) {
      await handleWizardFinish(type, valuesObj, id);
    }
  };

  const deleteNodeWithMessages: DeleteHandler = useCallback(
      async (arg1: any, arg2?: any, arg3?: any) => {
        let section: SectionKey;
        let pathArr: [number] | [string, number];
        let name: string | undefined;

        if (
            arg1 &&
            typeof arg1 === "object" &&
            "section" in arg1 &&
            "pathArr" in arg1
        ) {
          const obj = arg1 as { section: SectionKey; pathArr: [number] | [string, number]; name?: string };
          section = obj.section;
          pathArr = obj.pathArr;
          name = obj.name;
        } else {
          section = arg1 as SectionKey;
          pathArr = arg2 as [number] | [string, number];
          name = arg3 as string | undefined;
        }

        let finalName = name ?? null;

        if (handleDeleteNode) {
          try {
            const resolved = await handleDeleteNode(section, pathArr, name);
            if (typeof resolved === "string" && resolved.length > 0) {
              finalName = resolved;
            }
          } catch {
            // ignore
          }
        }

        setMessages(prev => [
          ...prev,
          makeMessage(10020, [finalName || "Unknown"], "danger"),
        ]);
      },
      [handleDeleteNode]
  );

  const removeComponent = (
      id: string,
      reason?: { code?: number; args?: any[]; type?: any }
  ) => {
    const removed = containers.find((c: any) => c.id === id);
    if (!removed) return;

    const entry = getComponentRegistryEntry(removed.type);
    const name = getComponentLabel(removed.type);
    const category = String(entry?.componentType || "").trim();

    setContainers((prev) => prev.filter((c: any) => c.id !== id));

    if (reason && (reason.code || reason.args || reason.type)) {
      setMessages((prevMsgs) => [
        ...prevMsgs,
        makeMessage(
            reason.code ?? 10002,
            reason.args ?? [],
            reason.type ?? "success"
        ),
      ]);
    } else {
      setMessages((prevMsgs) => [
        ...prevMsgs,
        makeMessage(10030, [name, category], "info"),
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
      setContainers((prev) =>
          prev.map((c: any) =>
              c.id === id ? { ...c, x: newX, y: newY } : c
          )
      );
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp as any);
    };

    document.addEventListener("mousemove", onMouseMove as any);
    document.addEventListener("mouseup", onMouseUp as any);
  };

  const logCenterOpened = (type: string, title: string) => {
    const entry = getComponentRegistryEntry(type);
    const cat = String(entry?.componentType || "").trim() || "Component";
    setMessages((prev) => [
      ...prev,
      makeMessage(10001, [title, cat], "info"),
    ]);
  };

  const logCenterClosed = (type: string, title: string) => {
    const entry = getComponentRegistryEntry(type);
    const cat = String(entry?.componentType || "").trim() || "Component";
    setMessages((prevMsgs) => {
      const msg = makeMessage(10030, [title, cat], "info");
      const last = prevMsgs[prevMsgs.length - 1];
      if (last?.text === msg.text) return prevMsgs;
      return [...prevMsgs, msg];
    });
  };

  const logCenterAlreadyOpen = (_type: string, title: string) => {
    setMessages((prev) => [
      ...prev,
      makeMessage(10010, [title], "warning"),
    ]);
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
