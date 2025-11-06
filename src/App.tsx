import React, { useEffect, useMemo, useState } from "react";
import isElectron from "./utils/isElectron";
import Navbar from "./app_components/Navbar";
import DockableFrame from "./app_components/dockable/DockableFrame";
import useAppData from "./hooks/useAppData";
import useDockableContainers from "./hooks/useDockableContainers";
import useElectronMenus from "./hooks/useElectronMenus";
import { openWizard, wizardBus } from "./utils/wizardBus";
import CenterZoneComponents, { centerTitle } from "./app_components/common/CenterZoneComponents";
import EastZoneComponents, { eastTitle } from "./app_components/common/EastZoneComponents";
import SouthZoneComponents from "./app_components/common/SouthZoneComponents";
import WestZoneComponents, { westTitle } from "./app_components/common/WestZoneComponents";
import { componentMetadata } from "./utils/componentMetadata";
import { CenterTab } from "./types/app";
import GlobalFileModals from "./app_components/GlobalFileModals";

function App() {
  const {
    maps,
    data,
    analyses,
    handleSaveAsNode,
    handleRenameNode,
    handleDeleteNode,
    handleWizardFinish,
    handleDataSave,
  } = useAppData();

  const {
    containers,
    setContainers,
    messages,
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
  } = useDockableContainers({
    handleWizardFinish,
    handleDeleteNode: async (section, pathArr, name) => {
      const resolved = await handleDeleteNode({ section, pathArr } as any);
      return resolved ?? name ?? null;
    },
  });

  const [tabs, setTabs] = useState<CenterTab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addTab = (payload: { kind: string; props?: unknown }) => {
    const { kind, props } = payload;
    const propsObj = (props && typeof props === "object" ? props : {}) as Record<string, unknown>;

    const title =
        (typeof centerTitle === "function" && centerTitle(kind, propsObj)) ||
        (componentMetadata as any)[kind]?.entityName ||
        kind;

    const existing = tabs.find((t) => t.kind === kind);
    if (existing) {
      setActiveId(existing.id);
      logCenterAlreadyOpen(kind, existing.title);
      return;
    }

    const id = `wiz_${Math.random().toString(36).slice(2, 9)}`;
    setTabs((prev) => [...prev, { id, kind, title, props: propsObj }]);
    setActiveId(id);
    logCenterOpened(kind, title);
  };

  const closeTab = (id: string) => {
    const closing = tabs.find((t) => t.id === id);
    if (closing) logCenterClosed(closing.kind, closing.title);

    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;

      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];

      if (activeId === id) {
        const prevNeighbor = next.slice(0, idx).pop();
        const neighbor = prevNeighbor ?? next[idx] ?? null;
        setActiveId(neighbor ? neighbor.id : null);
      }
      return next;
    });
  };

  useEffect(() => {
    const off = wizardBus.onOpen(addTab);
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    if (!tabs.length) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    if (!tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[tabs.length - 1].id);
    }
  }, [tabs, activeId]);

  const isCenterTab = (type: string) => {
    const meta = (componentMetadata as any)[type] || {};
    if (typeof meta.centerTab === "boolean") return meta.centerTab;

    const cat = String(meta.category || "").toLowerCase();
    if (cat.includes("wizard") || cat.includes("editor")) return true;
    return /wizard|editor/i.test(type);
  };

  const openComponent = (type: string, props: Record<string, unknown> = {}) => {
    if (isCenterTab(type)) {
      openWizard(type, props);
      return;
    }
    addComponent(type, props);
  };

  useElectronMenus(openComponent);

  const westTabs = useMemo<CenterTab[]>(() => {
    return containers
        .filter((c: any) => c.dockZone === "W")
        .map((c: any) => ({
          id: c.id,
          kind: c.type,
          title: westTitle(c.type, c),
          props: { ...(c.props || {}), dataset: c.dataset },
        }));
  }, [containers]);

  const [activeWestId, setActiveWestId] = useState<string | null>(null);

  useEffect(() => {
    if (westTabs.length === 0) {
      if (activeWestId !== null) setActiveWestId(null);
      return;
    }
    if (!westTabs.some((t) => t.id === activeWestId)) {
      setActiveWestId(westTabs[0].id);
    }
  }, [westTabs, activeWestId]);

  const closeWestTab = (id: string) => {
    removeComponent(id);
  };

  const eastTabs = useMemo<CenterTab[]>(() => {
    return containers
        .filter((c: any) => c.dockZone === "E")
        .map((c: any) => ({
          id: c.id,
          kind: c.type,
          title: eastTitle(c.type, c),
          props: { ...(c.props || {}), dataset: c.dataset },
        }));
  }, [containers]);

  const [activeEastId, setActiveEastId] = useState<string | null>(null);

  useEffect(() => {
    if (eastTabs.length === 0) {
      if (activeEastId !== null) setActiveEastId(null);
      return;
    }
    if (!eastTabs.some((t) => t.id === activeEastId)) {
      setActiveEastId(eastTabs[0].id);
    }
  }, [eastTabs, activeEastId]);

  const closeEastTab = (id: string) => {
    removeComponent(id);
  };

  return (
      <div className="app-container" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {!isElectron() && <Navbar addComponent={openComponent} />}

        <GlobalFileModals />

        <div style={{ flex: 1, minHeight: 0 }}>
          <DockableFrame
              containers={containers}
              setContainers={setContainers}
              removeComponent={removeComponent}
              onDragStart={onDragStart}
              messages={messages}
              messageType={messageType}
              setMessageType={setMessageType}
              onSaveAsNode={handleSaveAsNode as any}
              onRenameNode={handleRenameNode as any}
              onDeleteNode={deleteNodeWithMessages}
              maps={maps}
              data={data}
              analyses={analyses}
              handleOpenComponent={openComponent}
              onWizardFinish={wizardFinishWithMessages}
              onDataSave={handleDataSave}
              centerContent={
                <CenterZoneComponents
                    tabs={tabs}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    closeTab={closeTab}
                    data={data}
                    analyses={analyses}
                    onDataSave={handleDataSave}
                    onFinish={wizardFinishWithMessages}
                />
              }
              westContent={
                <WestZoneComponents
                    tabs={westTabs}
                    activeId={activeWestId}
                    setActiveId={setActiveWestId}
                    closeTab={closeWestTab}
                    maps={maps}
                    data={data}
                    analyses={analyses}
                    handleOpenComponent={openComponent}
                    onSaveAsNode={handleSaveAsNode as any}
                    onRenameNode={handleRenameNode as any}
                    onDeleteNode={deleteNodeWithMessages}
                />
              }
              southContent={<SouthZoneComponents messages={messages} onRemove={() => removeComponent("ComponentMessage")} />}
              eastContent={<EastZoneComponents tabs={eastTabs} activeId={activeEastId} setActiveId={setActiveEastId} closeTab={closeEastTab} />}
          />
        </div>
      </div>
  );
}

export default App;
