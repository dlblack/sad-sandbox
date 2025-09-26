import React, { useContext, useEffect, useState } from "react";
import { StyleContext } from "./styles/StyleContext";
import isElectron from "./utils/isElectron";
import Navbar from "./app_components/Navbar.jsx";
import DockableFrame from "./app_components/dockable/DockableFrame";
import useAppData from "./hooks/useAppData";
import useDockableContainers from "./hooks/useDockableContainers";
import useElectronMenus from "./hooks/useElectronMenus";
import { openWizard, wizardBus } from "./utils/wizardBus";
import CenterZoneComponents, { centerTitle } from "./app_components/common/CenterZoneComponents.jsx";
import { componentMetadata } from "./utils/componentMetadata";

function App() {
  const { appBackgroundStyle } = useContext(StyleContext);

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
    containers, setContainers,
    messages, messageType, setMessageType,
    addComponent, removeComponent,
    onDragStart,
    handleWizardFinish: wizardFinishWithMessages,
    handleDeleteNode: deleteNodeWithMessages,
    logCenterOpened, logCenterClosed, logCenterAlreadyOpen,
  } = useDockableContainers({ handleWizardFinish, handleDeleteNode });

  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);

  function addTab({ kind, props = {} }) {
    const title =
      (typeof centerTitle === "function" && centerTitle(kind, props)) ||
      componentMetadata[kind]?.entityName ||
      kind;

    const existing = tabs.find(t => t.kind === kind);
    if (existing) {
      setActiveId(existing.id);
      logCenterAlreadyOpen(kind, existing.title);
      return;
    }

    const id = `wiz_${Math.random().toString(36).slice(2, 9)}`;
    setTabs(prev => [...prev, { id, kind, title, props }]);
    setActiveId(id);
    logCenterOpened(kind, title);
  }

  function closeTab(id) {
    const closing = tabs.find(t => t.id === id);
    if (closing) logCenterClosed(closing.kind, closing.title);

    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;

      const next = [...prev.slice(0, idx), ...prev.slice(idx + 1)];

      if (activeId === id) {
        const neighbor = next[idx - 1] || next[idx] || null;
        setActiveId(neighbor ? neighbor.id : null);
      }
      return next;
    });
  }

  useEffect(() => {
    const off = wizardBus.onOpen(addTab);
    return () => off();
  }, [tabs]);

  // Ensure activeId always points to an existing tab.
  useEffect(() => {
    if (!tabs.length) {
      if (activeId !== null) setActiveId(null);
      return;
    }
    const stillExists = tabs.some(t => t.id === activeId);
    if (!stillExists) {
      setActiveId(tabs[tabs.length - 1].id);
    }
  }, [tabs, activeId]);

  function isCenterTab(type) {
    const meta = componentMetadata[type] || {};
    if (typeof meta.centerTab === "boolean") return meta.centerTab;

    const cat = (meta.category || "").toLowerCase();
    if (cat.includes("wizard") || cat.includes("editor")) return true;
    return /wizard|editor/i.test(type);
  }

  const openComponent = (type, props = {}) => {
    if (isCenterTab(type)) {
      openWizard(type, props);
      return;
    }
    addComponent(type, props);
  };

  useElectronMenus(openComponent);

  const centerContent = (
    <CenterZoneComponents
      tabs={tabs}
      activeId={activeId}
      setActiveId={setActiveId}
      closeTab={closeTab}
      maps={maps}
      data={data}
      analyses={analyses}
    />
  );

  return (
    <div
      className={`app-container ${appBackgroundStyle}`}
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      {!isElectron() && <Navbar addComponent={openComponent} />}
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
          onDeleteNode={deleteNodeWithMessages}
          maps={maps}
          data={data}
          analyses={analyses}
          handleOpenComponent={openComponent}
          onWizardFinish={wizardFinishWithMessages}
          onDataSave={handleDataSave}
          centerContent={centerContent}
        />
      </div>
    </div>
  );
}

export default App;
