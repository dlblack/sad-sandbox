import React, { useState } from "react";
import DockableItem from "./DockableItem";
import { dockableTitles } from "../../utils/dockableTitles";
import { dockableContentFactory } from "../../utils/dockableContentFactory";

const DOCK_ZONES = [
  "N", "E", "S", "W", "CENTER"
];

// Helper to render a docked item with drag logic
function DraggableDockableItem({ container, onRemove }) {
  const { id, type, isDragging } = container;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("dockable-item-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`dockable-drag-wrapper${isDragging ? " dragging" : ""}`}
    >
      <DockableItem
        {...container}
        type={dockableTitles[type] || type}
        onRemove={onRemove}
      >
        {container.content}
      </DockableItem>
    </div>
  );
}

export default function DockableFrame({
  containers,
  setContainers,
  removeComponent,
  onWizardFinish,
  onDataSave,
  messages,
  analyses,
  data,
}) {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Only needed for initial creation if you don't already set dockZone
  // Example add handler:
  // addComponent(type) => setContainers([...containers, {id, type, dockZone: getDefaultDockZone(type), ...}]);

  // Generate content for each container
  const containersWithContent = containers.map((c) => ({
    ...c,
    content: dockableContentFactory(c.type, {
      id: c.id,
      type: c.type,
      onFinish: onWizardFinish,
      onDataSave,
      messages,
      analyses,
      data,
    }),
  }));

  function handleDrop(e, zone) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("dockable-item-id");
    setContainers((prev) =>
      prev.map((c) =>
        c.id === itemId ? { ...c, dockZone: zone } : c
      )
    );
    setHoveredZone(null);
  }

  function handleDragOver(e, zone) {
    e.preventDefault();
    setHoveredZone(zone);
  }

  function handleDragLeave(e, zone) {
    e.preventDefault();
    // Only clear if leaving the current hovered zone
    if (hoveredZone === zone) setHoveredZone(null);
  }

  // Helper to render all items in a zone
  function renderZone(zone) {
    return (
      <div
        key={zone}
        className={`dock-zone dock-zone-${zone.toLowerCase()}${hoveredZone === zone ? " hovered" : ""}`}
        onDrop={(e) => handleDrop(e, zone)}
        onDragOver={(e) => handleDragOver(e, zone)}
        onDragLeave={(e) => handleDragLeave(e, zone)}
      >
        {containersWithContent
          .filter((c) => c.dockZone === zone)
          .map((c) => (
            <DraggableDockableItem
              key={c.id}
              container={c}
              onRemove={removeComponent}
            />
          ))}
      </div>
    );
  }

  return (
    <div className="dockable-frame">
      {DOCK_ZONES.map(renderZone)}
    </div>
  );
}
