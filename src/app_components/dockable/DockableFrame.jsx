import React, { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DockableItem from "./DockableItem";
import { dockableTitles } from "../../utils/dockableTitles";
import { dockableContentFactory } from "../../utils/dockableContentFactory";

function SortableDockableItem({ id, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <DockableItem {...props} id={id} dragHandleProps={listeners} isDragging={isDragging} />
    </div>
  );
}

function DockableFrame({ 
  containers,
  setContainers,
  removeComponent,
  onDragStart,
  messages,
  messageType,
  setMessageType,
  onWizardFinish,
  onDataSave,
  addAnalysis,
  analyses,
  data
}) {
  const containerIds = containers.map(c => c.id);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = containers.findIndex(c => c.id === active.id);
      const newIndex = containers.findIndex(c => c.id === over.id);
      setContainers(arrayMove(containers, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={containerIds} strategy={verticalListSortingStrategy}>
        <div className="dockable-frame-container">
          {containers.map(container => (
            <SortableDockableItem
              key={container.id}
              {...container}
              type={dockableTitles[container.type] || container.type}
              onRemove={removeComponent}
              onDragStart={onDragStart}
              >
                {dockableContentFactory(container.type, {
                  id: container.id,
                  type: container.type,
                  onFinish: onWizardFinish,
                  onDataSave,
                  messages,
                  analyses,
                  data,
                })}
            </SortableDockableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default DockableFrame;
