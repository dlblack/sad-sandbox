import React, { useEffect, useState, useRef, useCallback } from "react";
import DockableItem from "./DockableItem";
import { dockableTitles } from "@/utils/dockableTitles.js";
import { dockableContentFactory } from "../../utils/dockableContentFactory";

const MIN_WIDTH = 120;
const MAX_WIDTH_W = 300;
const MAX_WIDTH_E = 420;
const CENTER_MIN_WIDTH = 200;
const MIN_S_HEIGHT = 120;
const MAX_S_HEIGHT = 340;

const DOCK_ZONES = ["W", "CENTER", "E", "S"];

function getZoneMaxWidth(zone) {
  if (zone === "W") return MAX_WIDTH_W;
  if (zone === "E") return MAX_WIDTH_E;
  return undefined;
}

function DraggableDockableItem({
  container,
  onRemove,
  width,
  height,
  onResize,
  moveToZone,
  setFocusedId,
  focusedId,
  draggingPanelId,
  setDraggingPanelId,
}) {
  const { id, type, isDragging} = container;

  // Drag handlers
  const handleDragStart = (e) => {
    setDraggingPanelId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-dockable-id", id);
  };

  const handleDragEnd = () => setDraggingPanelId(null);

  return (
    <div
      className={`dockable-drag-wrapper${isDragging ? " dragging" : ""}`}
    >
      <DockableItem
        {...container}
        type={dockableTitles[type] || type}
        title={container.dataset?.name || ""}
        onRemove={onRemove}
        width={container.width}
        height={container.height}
        onResize={(size) => onResize(size, id)}
        onClick={() => setFocusedId(container.id)}
        isFocused={container.id === focusedId}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
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
  onSaveAsNode,
  onRenameNode,
  onDeleteNode,
  handleOpenComponent,
  maps,
  data,
  analyses,
}) {
  // --- Focused panel state ---
  const [focusedId, setFocusedId] = useState(null);
  const [draggingPanelId, setDraggingPanelId] = useState(null);

  const focusedPanel = containers.find((c) => c.id === focusedId);
  const focusedZone = focusedPanel ? focusedPanel.dockZone : null;
  const zonePanelIds = containers
    .filter((c) => c.dockZone === focusedZone)
    .map((c) => c.id);

  // --- State for zone widths (E, W, CENTER is flexible) ---
  const [zoneWidths, setZoneWidths] = useState({
    W: 240,
    CENTER: undefined,
    E: 240,
  });

  // --- State for South zone height ---
  const initialSouthHeight = React.useMemo(() => {
    const southItem = containers.find(
      (c) => c.dockZone === "S" && typeof c.height === "number"
    );
    return southItem ? Math.max(southItem.height, MIN_S_HEIGHT) : 240;
  }, [containers]);
  const [southHeight, setSouthHeight] = useState(initialSouthHeight);

  // For dragging splitters
  const dragging = useRef({
    zone: null,
    startX: 0,
    startWidth: 0,
    startY: 0,
    startHeight: 0,
  });

  // Get containers by zone
  const containersWithContent = containers.map((c) => {
    const dataset = c.dataset || c.datasetRef || c;

    return {
      ...c,
      dataset,
      content: dockableContentFactory(c.type, {
        ...c,
        dataset, // Pass dataset explicitly
        id: c.id,
        type: c.type,
        onFinish: onWizardFinish,
        onRemove: () => removeComponent(c.id),
        onDataSave,
        messages,
        onSaveAsNode,
        onRenameNode,
        onDeleteNode,
        handleOpenComponent,
        maps,
        data,
        analyses,
      }),
    };
  });

  // Effect: auto-expand zone when a panel is added/moved
  useEffect(() => {
    DOCK_ZONES.forEach(zone => {
      if (zone === "CENTER") return;
      const panelsInZone = containers.filter(c => c.dockZone === zone);
      if (!panelsInZone.length) return;
      if (zone === "S") {
        const maxHeight = Math.max(
          ...panelsInZone.map(p => typeof p.height === "number" ? p.height : 0),
          MIN_S_HEIGHT
        );
        setSouthHeight(h =>
          Math.min(Math.max(maxHeight + 24, MIN_S_HEIGHT), MAX_S_HEIGHT)
        );
      } else {
        const maxWidth = Math.max(
          ...panelsInZone.map(p => typeof p.width === "number" ? p.width : 0),
          MIN_WIDTH
        );
        setZoneWidths(w =>
          w[zone] !== undefined && w[zone] === maxWidth + 24
            ? w
            : {
                ...w,
                [zone]: Math.min(
                  Math.max(maxWidth + 24, MIN_WIDTH),
                  getZoneMaxWidth(zone)
                ),
              }
        );
      }
    });
  }, [containers]);

  // When user resizes a DockableItem, potentially expand zone
  const handleItemResize = useCallback(
    (zone) => (size, id) => {
      if (zone === "S") {
        setSouthHeight((h) => {
          const newH = Math.max(
            MIN_S_HEIGHT,
            Math.min(size.height + 24, MAX_S_HEIGHT)
          );
          return newH;
        });
      } else {
        setZoneWidths((prev) => {
          if (!zone || !size || !size.width) return prev;
          const maxWidth = getZoneMaxWidth(zone);
          const newWidth = Math.max(
            MIN_WIDTH,
            Math.min(size.width + 24, maxWidth)
          );
          if (prev[zone] !== newWidth) {
            return { ...prev, [zone]: newWidth };
          }
          return prev;
        });
      }
      // Persist the new width/height to the panel’s container
      setContainers(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, width: size.width, height: size.height }
            : c
        )
      );
    },
    [setContainers]
  );

  // Vertical splitter drag (E/W zones)
  const onVerticalSplitterDown = (zone) => (e) => {
    dragging.current = {
      zone,
      startX: e.clientX,
      startWidth: zoneWidths[zone],
    };
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", onVerticalMouseMove);
    window.addEventListener("mouseup", onVerticalMouseUp);
  };

  const onVerticalMouseMove = (e) => {
    const { zone, startX, startWidth } = dragging.current;
    if (!zone) return;
    const dx = e.clientX - startX;
    const maxWidth = getZoneMaxWidth(zone);
    let newWidth = startWidth + (zone === "E" ? -dx : dx);
    newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, maxWidth));
    setZoneWidths((prev) => ({ ...prev, [zone]: newWidth }));
  };

  const onVerticalMouseUp = () => {
    dragging.current = { zone: null };
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onVerticalMouseMove);
    window.removeEventListener("mouseup", onVerticalMouseUp);
  };

  // Horizontal splitter drag (S zone)
  const onHorizontalSplitterDown = (e) => {
    dragging.current = {
      zone: "S",
      startY: e.clientY,
      startHeight: southHeight,
    };
    document.body.style.cursor = "row-resize";
    window.addEventListener("mousemove", onHorizontalMouseMove);
    window.addEventListener("mouseup", onHorizontalMouseUp);
  };

  const onHorizontalMouseMove = (e) => {
    const { startY, startHeight } = dragging.current;
    let newHeight = startHeight - (e.clientY - startY);
    newHeight = Math.max(MIN_S_HEIGHT, Math.min(newHeight, MAX_S_HEIGHT));
    setSouthHeight(newHeight);
  };

  const onHorizontalMouseUp = () => {
    dragging.current = { zone: null };
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onHorizontalMouseMove);
    window.removeEventListener("mouseup", onHorizontalMouseUp);
  };

  // Move component to new zone
  const moveToZone = useCallback((id, newZone) => {
    setContainers(prev => {
      // Find the panel being moved
      const moved = prev.find(c => c.id === id);
      if (!moved) return prev;

      // Move the panel to the new zone
      const updated = prev.map(c => c.id === id ? { ...c, dockZone: newZone } : c);

      // Update zone sizes
      if ((newZone === "W" || newZone === "E") && moved.width) {
        setZoneWidths(zoneWidths => {
          const maxWidth = getZoneMaxWidth(newZone);
          const desiredWidth = Math.min(Math.max(moved.width + 24, MIN_WIDTH), maxWidth);
          if (!zoneWidths[newZone] || desiredWidth > zoneWidths[newZone]) {
            return { ...zoneWidths, [newZone]: desiredWidth };
          }
          return zoneWidths;
        });
      }
      if (newZone === "S" && moved.height) {
        setSouthHeight(curr => {
          const desiredHeight = Math.min(Math.max(moved.height + 24, MIN_S_HEIGHT), MAX_S_HEIGHT);
          if (desiredHeight > curr) return desiredHeight;
          return curr;
        });
      }

      setFocusedId(id);
      return updated;
    });
  }, [setContainers]);

  // Shrink E/W if empty, S if empty
  useEffect(() => {
    DOCK_ZONES.forEach((zone) => {
      if (
        (zone === "E" || zone === "W") &&
        !containersWithContent.some((c) => c.dockZone === zone)
      ) {
        setZoneWidths((prev) => {
          if (prev[zone] !== MIN_WIDTH) return { ...prev, [zone]: MIN_WIDTH };
          return prev;
        });
      }
    });
    // South shrink to min if empty
    if (!containersWithContent.some((c) => c.dockZone === "S")) {
      setSouthHeight(MIN_S_HEIGHT);
    }
  }, [containersWithContent]);

  // Render a zone with its width/height
  function renderZone(zone, idx) {
    const items = containersWithContent.filter((c) => c.dockZone === zone);
    let zoneStyle = {};
    if (zone === "S") {
      zoneStyle.height = southHeight;
    } else if (zone === "W" || zone === "E") {
      zoneStyle.width = zoneWidths[zone];
    }

    // Drop zone handlers
    const handleDragOver = (e) => {
      if (draggingPanelId) e.preventDefault();
    };
    const handleDrop = (e) => {
      e.preventDefault();
      const panelId = e.dataTransfer.getData("application/x-dockable-id");
      if (panelId) {
        moveToZone(panelId, zone);
      }
      setDraggingPanelId(null);
    };

    return (
      <div
        key={zone}
        className={`dock-zone dock-zone-${zone.toLowerCase()}`}
        style={zoneStyle}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {items.map((c) => (
          <DraggableDockableItem
            key={c.id}
            container={c}
            onRemove={removeComponent}
            width={zone === "CENTER" ? undefined : zoneWidths[zone] - 24}
            height={zone === "S" ? southHeight - 24 : undefined}
            onResize={handleItemResize(zone)}
            moveToZone={moveToZone}
            setFocusedId={setFocusedId}
            focusedId={focusedId}
            draggingPanelId={draggingPanelId}
            setDraggingPanelId={setDraggingPanelId}
          />
        ))}
      </div>
    );
  }

  // Render splitters with class only, no inline style
  function renderVerticalSplitter(leftZone, rightZone) {
    return (
      <div
        className="dock-splitter"
        onMouseDown={onVerticalSplitterDown(leftZone)}
      />
    );
  }

  function renderHorizontalSplitter() {
    return (
      <div
        className="dock-splitter-horizontal"
        onMouseDown={onHorizontalSplitterDown}
      />
    );
  }

  // Layout: column (main row, splitter, S zone)
  return (
    <div className="dockable-frame">
      <div className="dockable-frame-row">
        {renderZone("W")}
        {renderVerticalSplitter("W", "CENTER")}
        {renderZone("CENTER")}
        {renderVerticalSplitter("E", "CENTER")}
        {renderZone("E")}
      </div>
      {renderHorizontalSplitter()}
      {renderZone("S")}
    </div>
  );
}
