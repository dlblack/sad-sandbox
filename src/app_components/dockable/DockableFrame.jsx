import React, { useCallback, useEffect, useRef, useState } from "react";
import DockableItem from "./DockableItem";
import { componentMetadata } from "../../utils/componentMetadata.js";
import { dockableContentFactory } from "../../utils/dockableContentFactory";

const MIN_WIDTH = 120;
const MAX_WIDTH_W = 300;
const MAX_WIDTH_E = 420;
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
                                 onResize,
                                 setFocusedId,
                                 focusedId,
                                 setDraggingPanelId,
                               }) {
  const { id, type, isDragging } = container;

  const handleDragStart = (e) => {
    setDraggingPanelId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-dockable-id", id);
  };

  const handleDragEnd = () => setDraggingPanelId(null);

  return (
    <div className={`dockable-drag-wrapper${isDragging ? " dragging" : ""}`}>
      <DockableItem
        {...container}
        type={componentMetadata?.[type]?.entityName ?? type}
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
  const [focusedId, setFocusedId] = useState(null);
  const [draggingPanelId, setDraggingPanelId] = useState(null);

  const [zoneWidths, setZoneWidths] = useState({
    W: 240,
    CENTER: undefined,
    E: 240,
  });

  const initialSouthHeight = React.useMemo(() => {
    const southItem = containers.find(
      (c) => c.dockZone === "S" && typeof c.height === "number"
    );
    return southItem ? Math.max(southItem.height, MIN_S_HEIGHT) : 240;
  }, [containers]);

  const [southHeight, setSouthHeight] = useState(initialSouthHeight);

  // Explicitly allow string OR null for zone
  const dragging = useRef({
    zone: /** @type {string|null} */ (null),
    startX: 0,
    startWidth: 0,
    startY: 0,
    startHeight: 0,
  });

  const containersWithContent = containers.map((c) => {
    const dataset = c.dataset || c;
    return {
      ...c,
      dataset,
      content: dockableContentFactory(c.type, {
        ...c,
        dataset,
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

  useEffect(() => {
    DOCK_ZONES.forEach((zone) => {
      if (zone === "CENTER") return;
      const panelsInZone = containers.filter((c) => c.dockZone === zone);
      if (!panelsInZone.length) return;

      if (zone === "S") {
        const maxHeight = Math.max(
          ...panelsInZone.map((p) => (typeof p.height === "number" ? p.height : 0)),
          MIN_S_HEIGHT
        );
        setSouthHeight(
          Math.min(Math.max(maxHeight + 24, MIN_S_HEIGHT), MAX_S_HEIGHT)
        );
      } else {
        const maxWidth = Math.max(
          ...panelsInZone.map((p) => (typeof p.width === "number" ? p.width : 0)),
          MIN_WIDTH
        );
        setZoneWidths((w) =>
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

  const handleItemResize = useCallback(
    (zone) => (size, id) => {
      if (zone === "S") {
        setSouthHeight(() =>
          Math.max(MIN_S_HEIGHT, Math.min(size.height + 24, MAX_S_HEIGHT))
        );
      } else {
        setZoneWidths((prev) => {
          if (!zone || !size || !size.width) return prev;
          const maxWidth = getZoneMaxWidth(zone);
          const newWidth = Math.max(
            MIN_WIDTH,
            Math.min(size.width + 24, maxWidth)
          );
          return prev[zone] !== newWidth ? { ...prev, [zone]: newWidth } : prev;
        });
      }
      setContainers((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, width: size.width, height: size.height } : c
        )
      );
    },
    [setContainers]
  );

  const onVerticalSplitterDown = (zone) => (e) => {
    dragging.current = {
      zone, // can now be "W" or "E"
      startX: e.clientX,
      startWidth: zoneWidths[zone] || 0,
      startY: 0,
      startHeight: 0,
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
    dragging.current = { zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 };
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onVerticalMouseMove);
    window.removeEventListener("mouseup", onVerticalMouseUp);
  };

  const onHorizontalSplitterDown = (e) => {
    dragging.current = {
      zone: "S",
      startY: e.clientY,
      startHeight: southHeight,
      startX: 0,
      startWidth: 0,
    };
    document.body.style.cursor = "row-resize";
    window.addEventListener("mousemove", onHorizontalMouseMove);
    window.addEventListener("mouseup", onHorizontalMouseUp);
  };

  const onHorizontalMouseMove = (e) => {
    const { startY, startHeight } = dragging.current;
    if (!startHeight) return;
    let newHeight = startHeight - (e.clientY - startY);
    newHeight = Math.max(MIN_S_HEIGHT, Math.min(newHeight, MAX_S_HEIGHT));
    setSouthHeight(newHeight);
  };

  const onHorizontalMouseUp = () => {
    dragging.current = { zone: null, startX: 0, startWidth: 0, startY: 0, startHeight: 0 };
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", onHorizontalMouseMove);
    window.removeEventListener("mouseup", onHorizontalMouseUp);
  };

  const moveToZone = useCallback(
    (id, newZone) => {
      setContainers((prev) => {
        const moved = prev.find((c) => c.id === id);
        if (!moved) return prev;

        const updated = prev.map((c) =>
          c.id === id ? { ...c, dockZone: newZone } : c
        );

        if ((newZone === "W" || newZone === "E") && moved.width) {
          setZoneWidths((zoneWidths) => {
            const maxWidth = getZoneMaxWidth(newZone);
            const desiredWidth = Math.min(
              Math.max(moved.width + 24, MIN_WIDTH),
              maxWidth
            );
            return !zoneWidths[newZone] || desiredWidth > zoneWidths[newZone]
              ? { ...zoneWidths, [newZone]: desiredWidth }
              : zoneWidths;
          });
        }
        if (newZone === "S" && moved.height) {
          setSouthHeight((curr) => {
            const desiredHeight = Math.min(
              Math.max(moved.height + 24, MIN_S_HEIGHT),
              MAX_S_HEIGHT
            );
            return desiredHeight > curr ? desiredHeight : curr;
          });
        }

        setFocusedId(id);
        return updated;
      });
    },
    [setContainers]
  );

  useEffect(() => {
    DOCK_ZONES.forEach((zone) => {
      if (
        (zone === "E" || zone === "W") &&
        !containersWithContent.some((c) => c.dockZone === zone)
      ) {
        setZoneWidths((prev) =>
          prev[zone] !== MIN_WIDTH ? { ...prev, [zone]: MIN_WIDTH } : prev
        );
      }
    });
    if (!containersWithContent.some((c) => c.dockZone === "S")) {
      setSouthHeight(MIN_S_HEIGHT);
    }
  }, [containersWithContent]);

  function renderZone(zone) {
    const items = containersWithContent.filter((c) => c.dockZone === zone);
    const zoneStyle = {};
    if (zone === "S") {
      zoneStyle.height = southHeight;
    } else if (zone === "W" || zone === "E") {
      zoneStyle.width = zoneWidths[zone];
    }

    const handleDragOver = (e) => {
      if (draggingPanelId) e.preventDefault();
    };
    const handleDrop = (e) => {
      e.preventDefault();
      const panelId = e.dataTransfer.getData("application/x-dockable-id");
      if (panelId) moveToZone(panelId, zone);
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

  const renderVerticalSplitter = (zone) => (
    <div className="dock-splitter" onMouseDown={onVerticalSplitterDown(zone)} />
  );

  const renderHorizontalSplitter = () => (
    <div className="dock-splitter-horizontal" onMouseDown={onHorizontalSplitterDown} />
  );

  return (
    <div className="dockable-frame">
      <div className="dockable-frame-row">
        {renderZone("W")}
        {renderVerticalSplitter("W")}
        {renderZone("CENTER")}
        {renderVerticalSplitter("E")}
        {renderZone("E")}
      </div>
      {renderHorizontalSplitter()}
      {renderZone("S")}
    </div>
  );
}
