import React, { useState } from "react";
import DockableItem from "./DockableItem";
import { dockableTitles } from "../../utils/dockableTitles";
import { dockableContentFactory } from "../../utils/dockableContentFactory";

function DockableFrame({ containers, removeComponent, onDragStart, messages, messageType, setMessageType, onWizardFinish, addAnalysis, analyses }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {Object.entries(containers).map(([id, container]) => (
        <DockableItem
          key={id}
          id={id}
          x={container.x}
          y={container.y}
          width={container.width}
          height={container.height}
          type={dockableTitles[container.type] || container.type}
          onRemove={removeComponent}
          onDragStart={onDragStart}
        >
          {dockableContentFactory(container.type, {
            id,
            type: container.type,
            onFinish: onWizardFinish,
            messages,
            analyses,
          })}
        </DockableItem>
      ))}
    </div>
  );
}

export default DockableFrame;
