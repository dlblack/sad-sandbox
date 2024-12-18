import React, { useState, useEffect } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import ComponentEditorComponent from "./component-editor-component";
import MapComponent from "./map-component";
import MessageComponent from "./message-component";
import ProjectTree from "./project-tree";
import "../css/ResizableFrame.css";

function ResizableFrame({ backgroundColor }) {
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const column2Width = containerWidth * (4 / 5);
  const rowHeight = 400;

  const resizableStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: backgroundColor,
  };

  const minLeftColumnWidth = containerWidth * (1 / 5);

  const leftColumnWidth = Math.max(
    minLeftColumnWidth,
    containerWidth - column2Width
  );

  return (
    <div className="resizable-frame-container">
      <div className="resizable-column resizable-left">
        <ResizableBox
          width={leftColumnWidth}
          height={Infinity}
          minConstraints={[minLeftColumnWidth, 100]}
          resizeHandles={["e"]}
          style={{ resizableStyle, backgroundColor: backgroundColor }}
        >
          <>
            <div className="resizable-row">
              <ResizableBox
                width={Infinity}
                height={rowHeight}
                minConstraints={[100, 100]}
                resizeHandles={["s"]}
                style={resizableStyle}
              >
                <div className="resizable-content">
                  <ProjectTree />
                </div>
              </ResizableBox>
            </div>
            <div className="resizable-separator-horizontal" />
            <ResizableBox
              width={Infinity}
              height={rowHeight}
              minConstraints={[100, 100]}
              resizeHandles={["s"]}
              style={{ resizableStyle, backgroundColor: backgroundColor }}
            >
              <div className="resizable-content">
                <ComponentEditorComponent />
              </div>
            </ResizableBox>
          </>
        </ResizableBox>
      </div>
      <div className="resizable-separator-vertical" />
      <ResizableBox
        width={column2Width}
        height={Infinity}
        resizeHandles={["w"]}
        style={{ resizableStyle, backgroundColor: backgroundColor }}
      >
        <div className="resizable-column">
          <ResizableBox
            width={Infinity}
            height={rowHeight}
            minConstraints={[100, 100]}
            resizeHandles={["s"]}
            style={resizableStyle}
          >
            <div className="resizable-content">
              <MapComponent />
            </div>
          </ResizableBox>
          <div className="resizable-separator-horizontal" />
          <ResizableBox
            width={Infinity}
            height={rowHeight}
            minConstraints={[100, 100]}
            resizeHandles={["s"]}
            style={{ resizableStyle, backgroundColor: backgroundColor }}
          >
            <div className="resizable-content resizable-content-align-left frame-message-component">
              {" "}
              <MessageComponent />
            </div>
          </ResizableBox>
        </div>
      </ResizableBox>
    </div>
  );
}

export default ResizableFrame;
