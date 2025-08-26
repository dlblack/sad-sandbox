import React, {useContext, useEffect, useRef, useState} from "react";
import {Resizable} from "react-resizable";
import {StyleContext} from "../../styles/StyleContext";
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
                      }) {
  const {componentHeaderStyle, componentBackgroundStyle} = useContext(StyleContext);

  const initialWidth =
    typeof propWidth === "number" && !isNaN(propWidth) && propWidth > 0
      ? propWidth
      : 380;
  const initialHeight =
    typeof propHeight === "number" && !isNaN(propHeight) && propHeight > 0
      ? propHeight
      : 240;

  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    if (
      typeof propWidth === "number" &&
      !isNaN(propWidth) &&
      propWidth > 0 &&
      propWidth !== dimensions.width
    ) {
      setDimensions(dim => ({...dim, width: propWidth}));
    }
    if (
      typeof propHeight === "number" &&
      !isNaN(propHeight) &&
      propHeight > 0 &&
      propHeight !== dimensions.height
    ) {
      setDimensions(dim => ({...dim, height: propHeight}));
    }
  }, [propWidth, propHeight]);

  const [expanded, setExpanded] = useState(false);

  const handleResize = (e, {size}) => {
    setDimensions(size);
    onResize?.(size);
  };

  const containerStyle = expanded
    ? {
      position: "absolute",
      zIndex: 100,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
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

  const innerCard = (
    <div className="card d-flex flex-column">
      <div
        className={`card-header d-flex align-items-center justify-content-between ${componentHeaderStyle}`}
      >
        <div
          className="drag-handle"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          {...dragHandleProps}
          style={{cursor: "grab"}}
        >
          <div className="card-title mb-0">
            {type}{title ? ` - ${title}` : ""}
          </div>
        </div>
        <div className="dockable-header-btns">
          <button
            type="button"
            className="dockable-item-header-btn dockable-item-expand-btn"
            onClick={e => {
              e.stopPropagation();
              setExpanded(exp => !exp);
              e.currentTarget.blur();
            }}
            aria-label={expanded ? "Restore" : "Expand"}
            title={expanded ? "Restore" : "Expand"}
          >
            {expanded ? "▭" : "▢"}
          </button>
          <button
            type="button"
            className="dockable-item-header-btn dockable-item-close-btn"
            onClick={e => {
              e.stopPropagation();
              onRemove(id);
              e.currentTarget.blur();
            }}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      <div
        className={`card-body flex-grow-1 overflow-auto p-2 ${componentBackgroundStyle}`}
      >
        {children}
      </div>
    </div>
  );

  const containerClass =
    `card-container dockable-item${expanded ? " expanded" : ""}${isFocused ? " focused" : ""}${expandToContents ? " expand-to-contents" : ""}${className ? " " + className : ""}`;

  const containerRef = useRef(null);

  const handleClick = (e) => {
    onClick?.(e);
    if (e.target === containerRef.current) {
      containerRef.current.focus();
    }
  };

  const handleFocus = () => {
    onClick?.();
  };

  useEffect(() => {
    if (
      isFocused &&
      containerRef.current &&
      !containerRef.current.contains(document.activeElement)
    ) {
      containerRef.current.focus();
    }
  }, [isFocused]);

  return expanded ? (
    <div
      ref={containerRef}
      className={containerClass}
      style={containerStyle}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={0}
    >
      {innerCard}
    </div>
  ) : (
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
      <div
        ref={containerRef}
        className={containerClass}
        style={containerStyle}
        onClick={handleClick}
        onFocus={handleFocus}
        tabIndex={0}
      >
        {innerCard}
      </div>
    </Resizable>
  );
}

export default DockableItem;
