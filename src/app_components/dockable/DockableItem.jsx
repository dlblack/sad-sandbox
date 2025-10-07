import React, { useEffect, useRef, useState } from "react";
import { Resizable } from "react-resizable";
import { Card } from "@mantine/core";
import "react-resizable/css/styles.css";

const MIN_WIDTH = 180;
const MIN_HEIGHT = 120;
const MAX_WIDTH = 900;
const MAX_HEIGHT = 800;

function DockableItem({
                        expandToContents = false,
                        id,
                        type,
                        title,
                        onRemove,
                        children,
                        dragHandleProps,
                        width: propWidth,
                        height: propHeight,
                        className,
                        onResize,
                        onClick,
                        isFocused,
                        onDragStart,
                        onDragEnd,
                        showHeader = true,
                        fill = true,
                      }) {
  const [dimensions, setDimensions] = useState({
    width: typeof propWidth === "number" && propWidth > 0 ? propWidth : 380,
    height: typeof propHeight === "number" && propHeight > 0 ? propHeight : 240,
  });

  useEffect(() => {
    if (fill) return;
    if (typeof propWidth === "number" && propWidth > 0 && propWidth !== dimensions.width) {
      setDimensions((d) => ({ ...d, width: propWidth }));
    }
    if (typeof propHeight === "number" && propHeight > 0 && propHeight !== dimensions.height) {
      setDimensions((d) => ({ ...d, height: propHeight }));
    }
  }, [propWidth, propHeight, fill]); // eslint-disable-line

  const handleResize = (e, { size }) => {
    if (!fill) setDimensions(size);
    onResize?.(size);
  };

  const containerRef = useRef(null);

  const baseContainerStyle = fill
    ? {
      position: "relative",
      zIndex: isFocused ? 10 : 1,
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      minWidth: 0,
      minHeight: 0
    }
    : expandToContents
      ? {
        width: dimensions.width,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        height: "auto",
        position: "relative",
        zIndex: isFocused ? 10 : 1,
      }
      : {
        width: dimensions.width,
        height: dimensions.height,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        position: "relative",
        zIndex: isFocused ? 10 : 1,
      };

  const headerTitle = `${type}${title ? ` — ${title}` : ""}`;

  const innerCard = (
    <Card
      withBorder={false}
      radius="md"
      p={0}
      style={{ display: "flex", flexDirection: "column", flex: 1, width: "100%", height: "100%", minWidth: 0, minHeight: 0 }}
    >
      {showHeader && (
        <div className="card-header d-flex align-items-center justify-content-between" style={{ padding: 6 }}>
          <div
            className="drag-handle"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            {...dragHandleProps}
            style={{ cursor: "grab" }}
          >
            <div className="card-title mb-0">{headerTitle}</div>
          </div>
          <div className="dockable-header-btns">
            <button
              type="button"
              className="dockable-item-header-btn dockable-item-close-btn"
              onClick={(e) => { e.stopPropagation(); onRemove(id); e.currentTarget.blur(); }}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="card-body" style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "auto", padding: 0 }}>
        {children}
      </div>
    </Card>
  );

  const outer = (
    <div
      ref={containerRef}
      className={`dockable-item${className ? ` ${className}` : ""}`}
      style={baseContainerStyle}
      onClick={(e) => onClick?.(e)}
      tabIndex={0}
    >
      {innerCard}
    </div>
  );

  if (fill) return outer;

  return (
    <Resizable
      width={dimensions.width}
      height={dimensions.height}
      minConstraints={[MIN_WIDTH, MIN_HEIGHT]}
      maxConstraints={[MAX_WIDTH, MAX_HEIGHT]}
      onResize={handleResize}
      resizeHandles={["s","e","se","n","w","ne","nw","sw"]}
      axis="both"
      handle={(h, ref) => (
        <span
          className={`react-resizable-handle react-resizable-handle-${h}`}
          ref={ref}
        />
      )}
    >
      {outer}
    </Resizable>
  );
}

export default DockableItem;
