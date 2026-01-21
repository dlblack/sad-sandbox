import { useCallback, useState } from "react";
import {
  getComponentRegistryEntry,
  getComponentLabel,
  DEFAULT_COMPONENT_SIZE,
} from "../registry/componentRegistry";
import { makeMessage } from "../utils/messageUtils";
import { DeleteHandler, SectionKey } from "../types/appData";
import { DockContainer, DockZone } from "../types/dock";

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
  valuesObj: unknown,
  id?: string
) => Promise<void>;

export type DeleteNodeFn = (
  section: SectionKey,
  pathArr: [number] | [string, number],
  name?: string
) => Promise<string | null>;

type AddComponentOptions = {
  dockZone?: DockZone;
  dataset?: unknown;
  props?: Record<string, unknown>;
};

const buildContainerBase = (type: string, options?: AddComponentOptions): DockContainer => {
  const entry = getComponentRegistryEntry(type);

  const width =
    entry && typeof entry.width === "number" && entry.width > 0
      ? entry.width
      : DEFAULT_COMPONENT_SIZE.width;

  const height =
    entry && typeof entry.height === "number" && entry.height > 0
      ? entry.height
      : DEFAULT_COMPONENT_SIZE.height;

  const dockZone = options?.dockZone || getDefaultDockZone(type);
  const props = options?.props ?? {};
  const dataset = options?.dataset;

  const name = getComponentLabel(type, { ...props, dataset });

  return {
    id: type,
    type,
    title: name,
    dockZone,
    width,
    height,
    props,
    dataset,
    componentType: entry?.componentType,
    singleton: entry?.singleton,
    centerTab: entry?.centerTab,
  };
};

export default function useDockableContainers({
                                                handleWizardFinish,
                                                handleDeleteNode,
                                              }: {
  handleWizardFinish?: WizardFinishFn;
  handleDeleteNode?: DeleteNodeFn;
}) {
  const [messages, setMessages] = useState<ReturnType<typeof makeMessage>[]>([]);
  const [messageType, setMessageType] = useState<"info" | "success" | "warning" | "danger">("info");

  const [containers, setContainers] = useState<DockContainer[]>(() => {
    return ["ComponentProject", "ComponentMessage"].map((type) => {
      const c = buildContainerBase(type);
      return { ...c, id: type };
    });
  });

  const addComponent = useCallback(
    (type: string, options: AddComponentOptions = {}) => {
      const entry = getComponentRegistryEntry(type);
      const isSingleton = entry?.singleton === true;

      const category = String(entry?.componentType || "").trim();
      const name = getComponentLabel(type, { ...(options.props ?? {}), dataset: options.dataset });

      let alreadyOpen = false;

      setContainers((prev) => {
        if (isSingleton) {
          const existing = prev.find((c) => c.type === type);
          if (existing) {
            alreadyOpen = true;
            return prev;
          }
        }

        const newComponentId =
          isSingleton || type === "ComponentProject" || type === "ComponentMessage"
            ? type
            : `${type}-${crypto.randomUUID()}`;

        const base = buildContainerBase(type, options);

        return [...prev, { ...base, id: newComponentId }];
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

  const wizardFinishWithMessages: WizardFinishFn = async (type, valuesObj, id) => {
    const entry = getComponentRegistryEntry(type);

    let name: string | undefined;
    if (valuesObj && typeof valuesObj === "object" && "name" in valuesObj) {
      const v = (valuesObj as any).name;
      if (typeof v === "string" && v.length > 0) name = v;
    }

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
    async (args) => {
      const section = args.section;
      const pathArr = args.pathArr;
      const name = args.name;

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

      setMessages((prev) => [
        ...prev,
        makeMessage(10020, [finalName || "Unknown"], "danger"),
      ]);

      return finalName;
    },
    [handleDeleteNode]
  );

  const removeComponent = (
    id: string,
    reason?: { code?: number; args?: any[]; type?: any }
  ) => {
    setContainers((prev) => {
      const removed = prev.find((c) => c.id === id);
      if (!removed) return prev;

      const entry = getComponentRegistryEntry(removed.type);
      const name = getComponentLabel(removed.type);
      const category = String(entry?.componentType || "").trim();

      setMessages((prevMsgs) => {
        if (reason && (reason.code || reason.args || reason.type)) {
          return [
            ...prevMsgs,
            makeMessage(
              reason.code ?? 10002,
              reason.args ?? [],
              reason.type ?? "success"
            ),
          ];
        }
        return [...prevMsgs, makeMessage(10030, [name, category], "info")];
      });

      return prev.filter((c) => c.id !== id);
    });
  };

  const onDragStart = (id: string, event: MouseEvent) => {
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    let startX = 0;
    let startY = 0;

    setContainers((prev) => {
      const c = prev.find((x) => x.id === id);
      if (!c) return prev;
      startX = typeof c.x === "number" ? c.x : 0;
      startY = typeof c.y === "number" ? c.y : 0;
      return prev;
    });

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startClientX;
      const dy = moveEvent.clientY - startClientY;

      setContainers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, x: startX + dx, y: startY + dy } : c
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
    setMessages((prev) => [...prev, makeMessage(10001, [title, cat], "info")]);
  };

  const logCenterClosed = (type: string, title: string) => {
    const entry = getComponentRegistryEntry(type);
    const cat = String(entry?.componentType || "").trim() || "Component";
    setMessages((prevMsgs) => {
      const msg = makeMessage(10030, [title, cat], "info");
      const last = prevMsgs[prevMsgs.length - 1];
      if ((last as any)?.text === (msg as any).text) return prevMsgs;
      return [...prevMsgs, msg];
    });
  };

  const logCenterAlreadyOpen = (_type: string, title: string) => {
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
